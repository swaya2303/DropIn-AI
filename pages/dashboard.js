
import Layout from '../components/Layout';
import gamesDataJSON from '../data/games.json';
import playersData from '../data/players.json';
import { calculateConfidenceScore } from '../utils/confidenceScore';
import { generateIncentiveActions } from '../utils/incentiveEngine';
import { calculateGhostScore } from '../utils/ghostScore';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Organizers to switch between
const ORGANIZERS = [
    { id: "p1", name: "Alex Rivera" },
    { id: "p2", name: "Sarah Chen" },
    { id: "p4", name: "Emma Wilson" }
];

export default function Dashboard() {
    const [organizerId, setOrganizerId] = useState("p1");
    const [games, setGames] = useState(gamesDataJSON);
    const [actions, setActions] = useState([]);
    const [history, setHistory] = useState([]);
    const [expandedGameId, setExpandedGameId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Simulation State
    const [simStep, setSimStep] = useState(0); // 0: Idle, 1: Start, 2: Cancel, 3: Warning, 4: Incentive, 5: Fill
    const [simGame, setSimGame] = useState(null);

    // Form State
    const [newGame, setNewGame] = useState({
        title: "",
        sport: "Soccer",
        date: "",
        time: "",
        location: "",
        max_players: 10,
        description: "",
        price: 15
    });

    const myGames = games.filter(g => g.organizer_id === organizerId);

    // Initial Load & Incentive Engine
    useEffect(() => {
        let pending = [];
        myGames.forEach(game => {
            if (game.status !== 'completed') {
                const roster = game.signed_up_players.map(pid => playersData.find(p => p.id === pid)).filter(Boolean);
                const confidence = calculateConfidenceScore(game, roster);
                const gameActions = generateIncentiveActions(game, roster, playersData, confidence);
                pending = [...pending, ...gameActions];
            }
        });
        // Filter history
        pending = pending.filter(a => !history.find(h => h.id === a.id));
        setActions(pending);
    }, [games, organizerId, history]);

    // Simulator Runner
    const runSimulation = () => {
        setSimStep(1);
        const demoGame = { ...games[0], id: "sim-1", title: "Simulation Match", signed_up_players: ["p1", "p2", "p3", "p4", "p5"], max_players: 6, weather_forecast: "Sunny" };
        setSimGame(demoGame);

        // Step 2: Cancellation
        setTimeout(() => {
            setSimStep(2);
            setSimGame(prev => ({ ...prev, signed_up_players: ["p1", "p2", "p3", "p4"], weather_forecast: "Rainy (High Chance)" }));
        }, 2000);

        // Step 3: Confidence Drop & Warning
        setTimeout(() => {
            setSimStep(3);
        }, 4000);

        // Step 4: Incentive Fired
        setTimeout(() => {
            setSimStep(4);
            setHistory(prev => [{ id: `sim-h-${Date.now()}`, type: "Reward Offer", targetPlayer: "Top Waitlist", message: "Free Gatorade if you join now!" }, ...prev]);
        }, 6000);

        // Step 5: Spot Filled
        setTimeout(() => {
            setSimStep(5);
            setSimGame(prev => ({ ...prev, signed_up_players: ["p1", "p2", "p3", "p4", "p6"] })); // p6 joins
        }, 8000);

        // Reset
        setTimeout(() => {
            setSimStep(0);
            setSimGame(null);
        }, 12000);
    };


    const handleCreateGame = (e) => {
        e.preventDefault();
        const gameId = `g${Date.now()}`;
        const created = {
            id: gameId,
            organizer_id: organizerId,
            ...newGame,
            signed_up_players: [],
            status: 'upcoming',
            weather_forecast: "Sunny, 22°C (Forecast)",
            confidence_score: 100 // Initial
        };
        setGames([created, ...games]);
        setIsCreating(false);
        setNewGame({ title: "", sport: "Soccer", date: "", time: "", location: "", max_players: 10, description: "", price: 15 });
        alert("Game Created Successfully!");
    };

    const handleSendAction = (action) => {
        setHistory([action, ...history]);
        setActions(actions.filter(a => a.id !== action.id));
        alert(`Simulated: Sent "${action.type}" to ${action.targetPlayer}`);
    };

    // Analytics Helper
    const getBreakdown = (game) => {
        const roster = game.signed_up_players.map(pid => playersData.find(p => p.id === pid)).filter(Boolean);
        let reliable = 0, atRisk = 0, sensitive = 0;

        roster.forEach(p => {
            const score = calculateGhostScore(p).score;
            if (score >= 80) reliable++;
            else if (score < 50) atRisk++;
            if (p.weather_sensitivity) sensitive++;
        });

        return { reliable, atRisk, sensitive, count: roster.length };
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Header & Switcher */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizer Dashboard</h1>
                        <p className="text-gray-500 text-sm">Manage games, monitor confidence, and boost attendance.</p>
                    </div>
                    <div className="flex bg-white dark:bg-gray-800 p-2 rounded shadow-sm border border-gray-200 dark:border-gray-700 items-center gap-3">
                        <span className="text-xs font-bold uppercase text-gray-500">Organizer:</span>
                        <select
                            value={organizerId}
                            onChange={(e) => setOrganizerId(e.target.value)}
                            className="bg-transparent font-medium text-indigo-600 focus:outline-none text-sm"
                        >
                            {ORGANIZERS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        <button
                            onClick={runSimulation}
                            disabled={simStep > 0}
                            className={`ml-2 px-3 py-1.5 rounded text-sm font-bold transition-colors shadow-sm
                                ${simStep > 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:opacity-90'}
                            `}
                        >
                            {simStep > 0 ? "Running..." : "⚡ Simulate Scenario"}
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors"
                        >
                            + New Game
                        </button>
                    </div>
                </div>

                {/* Simulation Highlight Area */}
                {simStep > 0 && simGame && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-indigo-900 rounded-xl text-white shadow-2xl border border-indigo-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">⚡</div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            Live Simulation: <span className="text-yellow-400">{
                                simStep === 1 ? "Game Live" :
                                    simStep === 2 ? "Player Cancelled!" :
                                        simStep === 3 ? "Confidence Dropping..." :
                                            simStep === 4 ? "Incentive Fired!" :
                                                "Spot Filled!"
                            }</span>
                        </h3>

                        <div className="flex gap-8 items-center">
                            <div className="text-center">
                                <p className="text-xs uppercase opacity-70">Confidence</p>
                                <p className={`text-4xl font-bold ${simStep >= 2 && simStep < 5 ? 'text-red-400 animate-pulse' : 'text-green-400'
                                    }`}>
                                    {simStep >= 2 && simStep < 5 ? 45 : 92}%
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs uppercase opacity-70">Roster</p>
                                <p className="text-4xl font-bold">
                                    {simGame.signed_up_players.length}/{simGame.max_players}
                                </p>
                            </div>
                            <div className="flex-1 border-l border-white/20 pl-6">
                                <p className="text-sm font-mono opacity-80">
                                    {simStep === 1 && "System: Monitoring game parameters..."}
                                    {simStep === 2 && "Alert: Player 'p5' cancelled. Weather warning active."}
                                    {simStep === 3 && "Engine: Confidence below threshold (45%). Preparing action."}
                                    {simStep === 4 && "Action: Triggered 'Reward Offer' to top waitlist candidates."}
                                    {simStep === 5 && "Success: Player 'p6' accepted offer. Confidence restored."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

                    {/* Left: Games List */}
                    <div className="lg:col-span-2 space-y-6">
                        {myGames.length === 0 ? (
                            <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No games found. Create one to get started!</p>
                            </div>
                        ) : (
                            myGames.map(game => {
                                const isExpanded = expandedGameId === game.id;
                                const roster = game.signed_up_players.map(pid => playersData.find(p => p.id === pid)).filter(Boolean);
                                const confidence = calculateConfidenceScore(game, roster);
                                const stats = getBreakdown(game);
                                const fillRate = Math.round((game.signed_up_players.length / game.max_players) * 100);

                                return (
                                    <div key={game.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all overflow-hidden
                                        ${isExpanded ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200 dark:border-gray-700'}
                                    `}>
                                        {/* Summary Row */}
                                        <div
                                            className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            onClick={() => setExpandedGameId(isExpanded ? null : game.id)}
                                        >
                                            <div className="flex items-center gap-4 mb-3 md:mb-0">
                                                <div className={`w-2 h-12 rounded-full ${game.status === 'completed' ? 'bg-gray-300' : confidence.score > 70 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{game.title}</h3>
                                                    <p className="text-sm text-gray-500">{game.date} @ {game.time} • <span className="capitalize">{game.status}</span></p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Fill Rate</p>
                                                    <p className="font-mono font-bold text-gray-700 dark:text-gray-300">{game.signed_up_players.length}/{game.max_players}</p>
                                                </div>
                                                <div className="text-right min-w-[100px]">
                                                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-1
                                                        ${confidence.label === 'High' ? 'bg-green-100 text-green-800' :
                                                            confidence.label === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                                                    `}>
                                                        {confidence.score}% Confidence
                                                    </div>
                                                </div>
                                                <div className="text-gray-400">
                                                    {isExpanded ? '▲' : '▼'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 p-6 animate-fadeIn">

                                                {game.status === 'completed' ? (
                                                    // Completed Game Analytics
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Post-Game Analytics</h4>
                                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                                            <div className="p-3 bg-white rounded shadow-sm border border-gray-100">
                                                                <p className="text-xs text-gray-500 uppercase">Actual Attendance</p>
                                                                <p className="text-xl font-bold text-indigo-600">85%</p> {/* Mock */}
                                                            </div>
                                                            <div className="p-3 bg-white rounded shadow-sm border border-gray-100">
                                                                <p className="text-xs text-gray-500 uppercase">No-Shows</p>
                                                                <p className="text-xl font-bold text-red-500">2</p> {/* Mock */}
                                                            </div>
                                                            <div className="p-3 bg-white rounded shadow-sm border border-gray-100">
                                                                <p className="text-xs text-gray-500 uppercase">Revenue</p>
                                                                <p className="text-xl font-bold text-green-600">${game.signed_up_players.length * game.price}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 italic">"The weather forecast (Rain) caused a 15% drop compared to expected attendance."</p>
                                                    </div>
                                                ) : (
                                                    // Active Game Details
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Confidence Factors</h4>
                                                            <p className="text-sm text-gray-600 mb-3">{confidence.explanation}</p>

                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span>Reliable Players (Ghost Score 80+)</span>
                                                                    <span className="font-bold text-green-600">{stats.reliable}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span>At-Risk Players (Ghost Score &lt;50)</span>
                                                                    <span className="font-bold text-red-500">{stats.atRisk}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span>Weather Sensitive</span>
                                                                    <span className="font-bold text-blue-500">{stats.sensitive}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-end items-end gap-2">
                                                            <Link href={`/games/${game.id}`} className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-bold hover:bg-gray-50 w-full text-center">
                                                                Manage Roster
                                                            </Link>
                                                            <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-bold hover:bg-red-100 w-full">
                                                                Cancel Game
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Right: Incentive Feed */}
                    <div className="lg:col-span-1 space-y-8">

                        {/* Feed */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Action Feed</h2>
                                {actions.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{actions.length}</span>}
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                                {actions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm italic">
                                        All quiet on the field. 🌿
                                    </div>
                                ) : (
                                    actions.map(action => (
                                        <div key={action.id} className={`p-4 rounded-lg border shadow-sm relative overflow-hidden transition-all hover:shadow-md
                                            ${action.level === 3 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700'}
                                        `}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                                                    ${action.level === 3 ? 'bg-red-200 text-red-800' : action.type.includes('Reward') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}
                                                `}>{action.type}</span>
                                                <span className="text-[10px] text-gray-400">{action.gameTitle.substring(0, 15)}...</span>
                                            </div>

                                            <p className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-2">Target: {action.targetPlayer}</p>
                                            <div className="bg-gray-100/50 dark:bg-black/20 p-2 rounded text-xs text-gray-600 dark:text-gray-400 italic mb-3">
                                                "{action.message}"
                                            </div>
                                            <button
                                                onClick={() => handleSendAction(action)}
                                                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2"
                                            >
                                                Send Action ⚡
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* History */}
                            {history.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Recent Activity</h3>
                                    <div className="space-y-3">
                                        {history.slice(0, 5).map((h, i) => (
                                            <div key={i} className="text-xs flex gap-2 items-center text-gray-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                <span>Sent <b>{h.type}</b> to {h.targetPlayer}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Create Game Modal */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create New Game</h3>
                                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <form onSubmit={handleCreateGame} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="e.g. Wednesday Night Futsal"
                                        value={newGame.title}
                                        onChange={e => setNewGame({ ...newGame, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                            value={newGame.date}
                                            onChange={e => setNewGame({ ...newGame, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                            value={newGame.time}
                                            onChange={e => setNewGame({ ...newGame, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="e.g. Central Park Pitch 3"
                                        value={newGame.location}
                                        onChange={e => setNewGame({ ...newGame, location: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                                    >
                                        Create Game
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
