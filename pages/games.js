
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import gamesData from '../data/games.json';
import { useState } from 'react';

export default function Games() {
    const [filter, setFilter] = useState('all');

    const filteredGames = gamesData.filter(game => {
        if (filter === 'all') return true;
        return game.status === filter;
    });

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find a Game</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Join local pickup games happening now.</p>
                    </div>

                    <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {['all', 'upcoming', 'live', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${filter === status
                                        ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredGames.map(game => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>

                {filteredGames.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-500">No games found with this status.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
