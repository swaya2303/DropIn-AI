
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import GameChat from '../../components/GameChat';
import LanguageDemo from '../../components/LanguageDemo';
import gamesData from '../../data/games.json';
import playersData from '../../data/players.json';
import { calculateConfidenceScore } from '../../utils/confidenceScore';
import { useTranslation } from '../../utils/translationEngine';

// Simulated current user ID
const CURRENT_USER_ID = "p13";

export default function GameDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { language, setLanguage } = useTranslation();
    const [game, setGame] = useState(null);
    const [players, setPlayers] = useState([]);
    const [waitlist, setWaitlist] = useState([]);
    const [userStatus, setUserStatus] = useState('none');
    const [confidence, setConfidence] = useState({ score: 100, label: 'High', explanation: '' });

    // Load Game Data
    useEffect(() => {
        if (id) {
            const foundGame = gamesData.find(g => g.id === id);
            if (foundGame) {
                setGame(foundGame);
                const roster = foundGame.signed_up_players.map(pid =>
                    playersData.find(p => p.id === pid)
                ).filter(Boolean);
                setPlayers(roster);

                const isJoined = foundGame.signed_up_players.includes(CURRENT_USER_ID);
                setUserStatus(isJoined ? 'joined' : 'none');
            }
        }
    }, [id]);

    // Recalculate Confidence whenever players (roster) update
    useEffect(() => {
        if (game && players) {
            const result = calculateConfidenceScore(game, players);
            setConfidence(result);
        }
    }, [game, players]);


    if (!game) return <Layout><div className="p-8">Loading...</div></Layout>;

    const sortWaitlist = (list) => {
        return [...list].sort((a, b) => {
            if (b.ghost_score !== a.ghost_score) {
                return b.ghost_score - a.ghost_score;
            }
            return a.distance_from_venue_km - b.distance_from_venue_km;
        });
    };

    const handleJoin = () => {
        if (players.length >= game.max_players) {
            const me = playersData.find(p => p.id === CURRENT_USER_ID);
            const newWaitlist = sortWaitlist([...waitlist, me]);
            setWaitlist(newWaitlist);
            setUserStatus('waitlisted');
        } else {
            const me = playersData.find(p => p.id === CURRENT_USER_ID);
            setPlayers(prev => [...prev, me]);
            setUserStatus('joined');
        }
    };

    const handleLeave = () => {
        if (userStatus === 'joined') {
            const newPlayers = players.filter(p => p.id !== CURRENT_USER_ID);
            setPlayers(newPlayers);
            setUserStatus('none');

            if (waitlist.length > 0) {
                const [promoted, ...rest] = waitlist;
                setPlayers(prev => [...prev, promoted]);
                setWaitlist(rest);
                alert(`${promoted.name} was promoted from the waitlist!`);
            }
        } else if (userStatus === 'waitlisted') {
            const newWaitlist = waitlist.filter(p => p.id !== CURRENT_USER_ID);
            setWaitlist(newWaitlist);
            setUserStatus('none');
        }
    };

    const simulateCancellation = () => {
        if (players.length > 0) {
            const otherPlayers = players.filter(p => p.id !== CURRENT_USER_ID);
            if (otherPlayers.length === 0) return;

            const removed = otherPlayers[0];
            const kept = players.filter(p => p.id !== removed.id);

            let newRoster = kept;
            let newWaitlist = waitlist;

            if (waitlist.length > 0) {
                const [promoted, ...rest] = waitlist;
                newRoster = [...kept, promoted];
                newWaitlist = rest;
                if (promoted.id === CURRENT_USER_ID) {
                    setUserStatus('joined');
                    alert("You have been auto-promoted to the game!");
                }
            }

            setPlayers(newRoster);
            setWaitlist(newWaitlist);
        }
    };

    const isFull = players.length >= game.max_players;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{game.sport}</span>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 mb-2">{game.title}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{game.date} • {game.time} • {game.location}</p>
                            <p className="text-sm text-gray-500 mt-1">Organized by {playersData.find(p => p.id === game.organizer_id)?.name || 'Unknown'}</p>
                        </div>
                        {/* Confidence Badge */}
                        <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded text-sm font-bold mb-2 transition-colors duration-500
                        ${confidence.label === 'High' ? 'bg-green-100 text-green-800' : ''}
                        ${confidence.label === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${confidence.label === 'Low' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                                {confidence.score}% Confidence ({confidence.label})
                            </div>
                            <p className="text-xs text-gray-500 max-w-[200px] leading-tight text-right ml-auto">
                                {confidence.explanation}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Weather Forecast</h3>
                        <p className="text-gray-600 dark:text-gray-300">{game.weather_forecast}</p>
                    </div>
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                        <p className="text-gray-600 dark:text-gray-300">{game.description}</p>
                    </div>

                    {/* Language Demo Button */}
                    <div className="mb-6 flex justify-center">
                        <LanguageDemo currentLanguage={language} onLanguageChange={setLanguage} />
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-4">
                        {userStatus === 'none' && (
                            <button
                                onClick={handleJoin}
                                className={`px-6 py-3 rounded-lg font-bold text-white transition-colors
                            ${isFull ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}
                        `}
                            >
                                {isFull ? 'Join Waitlist' : 'Join Game'}
                            </button>
                        )}

                        {(userStatus === 'joined' || userStatus === 'waitlisted') && (
                            <button
                                onClick={handleLeave}
                                className="px-6 py-3 rounded-lg font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                                {userStatus === 'joined' ? 'Leave Game' : 'Leave Waitlist'}
                            </button>
                        )}

                        <button onClick={simulateCancellation} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-500 hover:bg-gray-50 transition-colors">
                            Simulate Cancellation
                        </button>
                    </div>
                    {userStatus === 'waitlisted' && (
                        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm animate-pulse">
                            You are on the waitlist. Position: {waitlist.findIndex(p => p.id === CURRENT_USER_ID) + 1}
                        </div>
                    )}
                </div>

                {/* Players & Waitlist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Signed Up */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Players ({players.length}/{game.max_players})</h2>
                            {isFull && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded uppercase">Full</span>}
                        </div>
                        <div className="space-y-3">
                            {players.map(player => (
                                <div key={player.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            {player.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{player.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Skill {player.skill_level}</span>
                                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded" title="Ghost Score">👻 {player.ghost_score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Waitlist */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Waitlist ({waitlist.length})</h2>
                        {waitlist.length > 0 ? (
                            <div className="space-y-3">
                                {waitlist.map((player, idx) => (
                                    <div key={player.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700 opacity-75">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 font-mono text-sm">#{idx + 1}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{player.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {player.distance_from_venue_km}km away • 👻 {player.ghost_score}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No one waiting yet.</p>
                        )}
                    </div>
                </div>

                {/* Game Chat */}
                <div className="mt-8">
                    <GameChat
                        gameId={id}
                        currentPlayerLanguage={language}
                    />
                </div>

            </div>
        </Layout>
    );
}
