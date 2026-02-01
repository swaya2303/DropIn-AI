
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PlayerCard from '../components/PlayerCard';
import playersData from '../data/players.json';
import gamesData from '../data/games.json';
import { calculateGhostScore } from '../utils/ghostScore';

export default function Profile() {
    const [selectedPlayerId, setSelectedPlayerId] = useState("p1"); // Default to Alex
    const [stats, setStats] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [ghostData, setGhostData] = useState(null);

    const player = playersData.find(p => p.id === selectedPlayerId);

    useEffect(() => {
        if (!player) return;

        // 1. Ghost Score
        const ghostResult = calculateGhostScore(player);
        setGhostData(ghostResult);

        // 2. Analytics
        const history = player.attendance_history || [];
        const totalGames = history.length;
        const attended = history.filter(h => h.showed_up).length;
        const attendanceRate = totalGames > 0 ? Math.round((attended / totalGames) * 100) : 0;

        // Streak
        let currentStreak = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].showed_up) currentStreak++;
            else break;
        }

        // Cancellations
        const cancels = player.cancellation_history || [];
        const totalCancels = cancels.length;
        const lastMinuteCancels = cancels.filter(c => {
            const diff = new Date(c.game_time) - new Date(c.cancelled_at);
            return diff < 2 * 60 * 60 * 1000; // < 2 hours
        }).length;

        // Sports Chart
        // Mocking played sports based on preferences since history doesn't link to sport types directly in this simple data model
        // We'll simulate it by assigning sports to past games
        const sportCounts = {};
        player.preferred_sports.forEach(s => sportCounts[s] = 0);

        // Distribute strictly for visual demo
        const sportsList = Object.keys(sportCounts);
        if (totalGames > 0 && sportsList.length > 0) {
            for (let i = 0; i < totalGames; i++) {
                const sport = sportsList[i % sportsList.length];
                sportCounts[sport]++;
            }
        }

        setStats({
            totalGames,
            attendanceRate,
            currentStreak,
            totalCancels,
            lastMinuteCancels,
            sportCounts
        });

        // 3. Milestones & Gamification
        const newMilestones = [
            { label: "Rookie Debut", desc: "Played your first game", earned: totalGames > 0, icon: "👟" },
            { label: "Reliable", desc: "90% Attendance (min 5 games)", earned: totalGames >= 5 && attendanceRate >= 90, icon: "🛡️" },
            { label: "Ghost Gold", desc: "Achieve Gold Ghost Score", earned: ghostResult.score >= 80, icon: "👻" },
            { label: "Team Player", desc: "Avg Sportsmanship > 4.5", earned: (ghostResult.breakdown.sportsmanship / 15) * 5 > 4.5, icon: "🤝" },
            { label: "Veteran", desc: "Play 50 Games", earned: totalGames >= 50, icon: "🏆" }
        ];
        setMilestones(newMilestones);

    }, [selectedPlayerId]);

    const calculateGameCoins = () => {
        if (!stats) return 0;
        let coins = stats.totalGames * 10; // 10 coins per game
        milestones.forEach(m => { if (m.earned) coins += 50; }); // 50 bonus per milestone
        return coins;
    };

    if (!player || !stats || !ghostData) return <Layout>Loading...</Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                {/* Header & Switcher */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Player Profile</h1>
                        <p className="text-gray-500 text-sm">Manage stats, milestones, and settings.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-gray-500">View As:</span>
                        <select
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(e.target.value)}
                            className="bg-transparent font-medium text-indigo-600 focus:outline-none text-sm"
                        >
                            {playersData.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Profile Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left: Identity & Ghost Score */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {player.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{player.name}</h2>
                                    <p className="text-gray-500 text-sm mt-1">{player.location}</p>
                                    <div className="flex gap-1 mt-2">
                                        {player.languages.map(lang => (
                                            <span key={lang} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 capitalize">{lang}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg border-2 ${ghostData.colorClass.replace('bg-', 'bg-opacity-20 bg-')}`}>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold uppercase opacity-70">Ghost Score</span>
                                    <span className="text-3xl font-black">{ghostData.score}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mb-3">
                                    <div className={`h-2 rounded-full transition-all duration-1000 ${ghostData.score >= 80 ? 'bg-yellow-400' : ghostData.score >= 60 ? 'bg-gray-400' : 'bg-orange-400'}`} style={{ width: `${ghostData.score}%` }}></div>
                                </div>
                                <p className="text-xs opacity-75">{ghostData.badge} Status • Keep it up!</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">GameCoins</span>
                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                    🪙 {calculateGameCoins()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Analytics */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6">Performance Analytics</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalGames}</p>
                                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium mt-1">Total Games</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.attendanceRate}%</p>
                                <p className="text-xs text-green-800 dark:text-green-300 font-medium mt-1">Attendance</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak} 🔥</p>
                                <p className="text-xs text-orange-800 dark:text-orange-300 font-medium mt-1">Current Streak</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.totalCancels}</p>
                                <p className="text-xs text-red-800 dark:text-red-300 font-medium mt-1">{stats.lastMinuteCancels} Late</p>
                            </div>
                        </div>

                        {/* Bar Chart Mockup */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Games by Sport</h4>
                            <div className="space-y-3">
                                {Object.entries(stats.sportCounts).map(([sport, count]) => (
                                    <div key={sport}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{sport}</span>
                                            <span className="text-gray-500">{count} games</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-indigo-500 h-2.5 rounded-full"
                                                style={{ width: `${stats.totalGames > 0 ? (count / stats.totalGames) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(stats.sportCounts).length === 0 && <p className="text-sm text-gray-400 italic">No games played yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Milestones */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Milestones & Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {milestones.map((milestone, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border flex flex-col items-center text-center transition-all
                            ${milestone.earned
                                ? 'bg-white dark:bg-gray-800 border-indigo-200 shadow-sm opacity-100 transform hover:-translate-y-1'
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 opacity-50 grayscale'}
                        `}>
                            <div className="text-3xl mb-2">{milestone.icon}</div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{milestone.label}</h4>
                            <p className="text-xs text-gray-500 leading-tight">{milestone.desc}</p>
                            {milestone.earned && <div className="mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Earned</div>}
                        </div>
                    ))}
                </div>

            </div>
        </Layout>
    );
}
