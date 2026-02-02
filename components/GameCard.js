
import Link from 'next/link';

const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
        case 'soccer': return '⚽';
        case 'basketball': return '🏀';
        case 'tennis': return '🎾';
        case 'volleyball': return '🏐';
        case 'badminton': return '🏸';
        case 'running': return '🏃';
        case 'cycling': return '🚴';
        case 'baseball': return '⚾';
        case 'table tennis': return '🏓';
        default: return '🏅';
    }
};

const getConfidenceBadge = (score) => {
    if (score > 70) {
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">High Confidence {score}%</span>;
    } else if (score >= 50) {
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Medium {score}%</span>;
    } else {
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Low {score}%</span>;
    }
};

const GameCard = ({ game }) => {
    const spotsLeft = Math.max(0, game.max_players - game.signed_up_players.length);
    const icon = getSportIcon(game.sport);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={game.sport}>{icon}</span>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{game.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{game.sport}</p>
                    </div>
                </div>
                {getConfidenceBadge(game.confidence_score)}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-4 flex-grow">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>{game.date} • {game.time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="truncate">{game.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    <span className={spotsLeft <= 2 ? 'text-red-500 font-semibold' : ''}>
                        {spotsLeft} spots left
                    </span>
                </div>
            </div>

            <Link
                href={`/games/${game.id}`}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors mt-auto text-center block"
            >
                Join Game
            </Link>
        </div>
    );
};

export default GameCard;
