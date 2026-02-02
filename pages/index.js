
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
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
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
    skillLevel: [1, 10],
    sport: 'all'
  });

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      if (filters.dateRange === 'today' && !isToday(game.date)) return false;
      if (filters.dateRange === 'week' && !isThisWeek(game.date)) return false;
      if (filters.dateRange === 'month' && !isThisMonth(game.date)) return false;
      if (filters.location && !game.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.sport !== 'all' && game.sport?.toLowerCase() !== filters.sport) return false;
      const avgSkill = getGameAvgSkill(game.signed_up_players);
      if (game.signed_up_players.length > 0) {
        if (avgSkill < filters.skillLevel[0] || avgSkill > filters.skillLevel[1]) return false;
      }
      return true;
    });
  }, [filters]);

  const recommendedGames = filteredGames
    .filter(g => g.status === 'upcoming')
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 6);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ dateRange: 'all', location: '', skillLevel: [1, 10], sport: 'all' });
  };

  // Stats for hero section
  const totalGames = gamesData.filter(g => g.status === 'upcoming').length;
  const totalPlayers = playersData.length;
  const uniqueLocations = [...new Set(gamesData.map(g => g.location.split(',')[0]))].length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        <section className="relative mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

          <div className="relative px-8 py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {totalGames} games available now
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Find Your Next
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Soccer Match ⚽
                  </span>
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-lg">
                  AI-powered matchmaking connects you with the perfect games based on your skill level, location, and preferences.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/games" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg">
                    Browse All Games
                  </Link>
                  <Link href="/player-dashboard" className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-all border border-white/30">
                    My Dashboard
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <div className="text-4xl font-bold text-white mb-2">{totalGames}</div>
                  <div className="text-white/70 text-sm">Active Games</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <div className="text-4xl font-bold text-white mb-2">{totalPlayers}</div>
                  <div className="text-white/70 text-sm">Players</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <div className="text-4xl font-bold text-white mb-2">{uniqueLocations}</div>
                  <div className="text-white/70 text-sm">Locations</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Soccer Badge */}
        <section className="mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-lg">
            <span className="text-xl">⚽</span>
            <span>Soccer Games Only</span>
          </div>
        </section>

        {/* Advanced Filters */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">🔍</span>
              Find a Game
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📅 When</label>
              <div className="relative">
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 py-3 px-4 pr-10 focus:border-indigo-500 focus:ring-0 transition-colors"
                >
                  <option value="all">Anytime</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📍 Where</label>
              <input
                type="text"
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 py-3 px-4 focus:border-indigo-500 focus:ring-0 transition-colors"
              />
            </div>

            {/* Skill Level */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ⭐ Skill Level: <span className="text-indigo-600">{filters.skillLevel[0]} - {filters.skillLevel[1]}</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">Beginner</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filters.skillLevel[1]}
                  onChange={(e) => handleFilterChange('skillLevel', [1, parseInt(e.target.value)])}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs text-gray-400">Pro</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Games */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">🎯 Recommended For You</h2>
              <p className="text-gray-500 text-sm">Based on your skill level and preferences</p>
            </div>
            <Link href="/games" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all">
              View All
              <span>→</span>
            </Link>
          </div>

          {recommendedGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">No games match your filters</p>
              <p className="text-gray-400 text-sm mb-4">Try adjusting your search criteria</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                🤖
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Matching</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Smart algorithms find games that match your skill level perfectly.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-700">
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                👻
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ghost Score</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Track reliability with our unique attendance scoring system.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                🌍
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Real-time Chat</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Chat with teammates in any language with auto-translation.</p>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
