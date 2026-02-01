
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import gamesData from '../data/games.json';
import playersData from '../data/players.json';
import Link from 'next/link';
import { useState, useMemo } from 'react';

// Helpers for date filtering (Local time safe)
const parseDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const isToday = (dateString) => {
  const date = parseDate(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isThisWeek = (dateString) => {
  const date = parseDate(dateString);
  const today = new Date();
  const currentDay = today.getDay();

  // Calculate start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);

  // Calculate end of week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
};

const isThisMonth = (dateString) => {
  const date = parseDate(dateString);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

// Helper to calculate average skill level of signed-up players
const getGameAvgSkill = (signedUpPlayerIds) => {
  if (!signedUpPlayerIds || signedUpPlayerIds.length === 0) return 0;

  let totalSkill = 0;
  let count = 0;

  signedUpPlayerIds.forEach(id => {
    const player = playersData.find(p => p.id === id);
    if (player) {
      totalSkill += player.skill_level;
      count++;
    }
  });

  return count === 0 ? 0 : (totalSkill / count);
};

export default function Home() {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    location: '',
    skillLevel: [1, 10] // Range: min, max
  });

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      // Date Filter
      if (filters.dateRange === 'today' && !isToday(game.date)) return false;
      if (filters.dateRange === 'week' && !isThisWeek(game.date)) return false;
      if (filters.dateRange === 'month' && !isThisMonth(game.date)) return false;

      // Location Filter (case-insensitive partial match)
      if (filters.location && !game.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

      // Skill Level Filter
      const avgSkill = getGameAvgSkill(game.signed_up_players);
      if (game.signed_up_players.length > 0) {
        if (avgSkill < filters.skillLevel[0] || avgSkill > filters.skillLevel[1]) return false;
      }

      return true;
    });
  }, [filters]);

  const recommendedGames = filteredGames
    .filter(g => g.status === 'upcoming')
    .sort((a, b) => b.confidence_score - a.confidence_score) // Sort by confidence
    .slice(0, 4);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Greeting Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to GameSync</h1>
          <p className="text-gray-600 dark:text-gray-400">Find your next soccer game with AI-powered matching.</p>
        </header>

        {/* Filter Bar */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Find a Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              >
                <option value="all">Anytime</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              />
            </div>

            {/* Skill Level Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avg Skill Level: {filters.skillLevel[0]} - {filters.skillLevel[1]}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filters.skillLevel[1]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    handleFilterChange('skillLevel', [1, val]);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Adjust max skill limit</p>
            </div>
          </div>
        </section>

        {/* Recommended Games */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended For You</h2>
            <Link href="/games" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Browse All Games &rarr;
            </Link>
          </div>

          {recommendedGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No games match your filters.</p>
              <button
                onClick={() => setFilters({ dateRange: 'all', location: '', skillLevel: [1, 10] })}
                className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
