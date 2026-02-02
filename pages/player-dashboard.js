import Layout from '../components/Layout';
import PlayerRating from '../components/PlayerRating';
import gamesData from '../data/games.json';
import playersData from '../data/players.json';
import ratingsData from '../data/ratings.json';
import { calculateGhostScore } from '../utils/ghostScore';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Current player (Eva Johansson)
const CURRENT_PLAYER_ID = "p13";

export default function PlayerDashboard() {
    const [ratings, setRatings] = useState(ratingsData);
    const [activeTab, setActiveTab] = useState('history');
    const [selectedGame, setSelectedGame] = useState(null);

    const currentPlayer = playersData.find(p => p.id === CURRENT_PLAYER_ID);
    const ghostScoreInfo = calculateGhostScore(currentPlayer);

    // Get games player has participated in or signed up for
    const myGames = gamesData.filter(g =>
        g.signed_up_players.includes(CURRENT_PLAYER_ID)
    );

    const upcomingGames = myGames.filter(g => g.status === 'upcoming');
    const pastGames = myGames.filter(g => g.status === 'completed');

    // Calculate stats
    const totalGames = myGames.length;
    const attendedGames = currentPlayer.attendance_history?.filter(h => h.showed_up).length || 0;
    const attendanceRate = totalGames > 0 ? Math.round((attendedGames / totalGames) * 100) : 100;

    // Get ratings received by current player
    const receivedRatings = ratings.filter(r => r.rated_player_id === CURRENT_PLAYER_ID);
    const avgRating = receivedRatings.length > 0
        ? (receivedRatings.reduce((acc, r) => acc + r.skill_rating, 0) / receivedRatings.length).toFixed(1)
        : 'N/A';

    // Get ratings submitted by current player
    const submittedRatings = ratings.filter(r => r.rater_id === CURRENT_PLAYER_ID);

    // Get players from a specific game that can be rated
    const getPlayersToRate = (gameId) => {
        const game = gamesData.find(g => g.id === gameId);
        if (!game) return [];

        return game.signed_up_players
            .filter(pid => pid !== CURRENT_PLAYER_ID)
            .map(pid => playersData.find(p => p.id === pid))
            .filter(Boolean);
    };

    // Check if current player has already rated a player for a game
    const getExistingRating = (playerId, gameId) => {
        return ratings.find(r =>
            r.rater_id === CURRENT_PLAYER_ID &&
            r.rated_player_id === playerId &&
            r.game_id === gameId
        );
    };

    // Handle new rating submission
    const handleRatingSubmit = (ratingData) => {
        const newRating = {
            id: `r-${Date.now()}`,
            rater_id: CURRENT_PLAYER_ID,
            ...ratingData,
            timestamp: new Date().toISOString()
        };
        setRatings(prev => [...prev, newRating]);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Player Dashboard</h1>
                        <p className="text-gray-500 text-sm">Track your games, stats, and rate other players.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {currentPlayer.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{currentPlayer.name}</p>
                            <p className="text-xs text-gray-500">Playing since 2023</p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Games</p>
                        <p className="text-3xl font-bold text-indigo-600">{totalGames}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Attendance Rate</p>
                        <p className="text-3xl font-bold text-green-600">{attendanceRate}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ghost Score</p>
                        <p className="text-3xl font-bold text-purple-600">{ghostScoreInfo.score}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Avg. Skill Rating</p>
                        <p className="text-3xl font-bold text-yellow-600">{avgRating}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => { setActiveTab('history'); setSelectedGame(null); }}
                        className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'history'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Game History
                    </button>
                    <button
                        onClick={() => setActiveTab('rate')}
                        className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'rate'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Rate Players
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'history' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upcoming Games */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Upcoming Games ({upcomingGames.length})
                            </h2>
                            {upcomingGames.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                                    <p className="text-gray-500">No upcoming games.</p>
                                    <Link href="/games" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
                                        Browse available games →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingGames.map(game => (
                                        <Link key={game.id} href={`/games/${game.id}`}>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors cursor-pointer">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{game.title}</h3>
                                                        <p className="text-sm text-gray-500">{game.date} at {game.time}</p>
                                                        <p className="text-xs text-gray-400">{game.location}</p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                                                        Upcoming
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past Games */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Past Games ({pastGames.length})
                            </h2>
                            {pastGames.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                                    <p className="text-gray-500">No past games yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pastGames.map(game => (
                                        <div key={game.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{game.title}</h3>
                                                    <p className="text-sm text-gray-500">{game.date}</p>
                                                    <p className="text-xs text-gray-400">{game.signed_up_players.length} players</p>
                                                </div>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                                                    Completed
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => { setActiveTab('rate'); setSelectedGame(game.id); }}
                                                className="mt-3 text-sm text-indigo-600 hover:underline"
                                            >
                                                Rate players from this game →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'rate' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rate Players</h2>

                        {/* Game Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select a game to rate players from:
                            </label>
                            <select
                                value={selectedGame || ''}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Choose a game...</option>
                                {myGames.map(game => (
                                    <option key={game.id} value={game.id}>
                                        {game.title} - {game.date}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Players to Rate */}
                        {selectedGame ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getPlayersToRate(selectedGame).map(player => (
                                    <PlayerRating
                                        key={player.id}
                                        player={player}
                                        gameId={selectedGame}
                                        existingRating={getExistingRating(player.id, selectedGame)}
                                        onSubmit={handleRatingSubmit}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                                <p className="text-gray-500">Select a game above to rate players you played with.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
