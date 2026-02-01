
const PlayerCard = ({ player }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                    {player.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{player.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{player.location}</p>
                </div>
                <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${player.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {player.active ? 'Active' : 'Inactive'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Stats</h3>
                    <ul className="space-y-2">
                        <li className="flex justify-between">
                            <span>Skill Level</span>
                            <span className="font-medium">{player.skill_level}/10</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Ghost Score</span>
                            <span className="font-medium text-red-500">{player.ghost_score}</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Weather Sensitivity</span>
                            <span className="font-medium">{player.weather_sensitivity ? 'Yes' : 'No'}</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Preferences</h3>
                    <div className="mb-2">
                        <p className="text-xs text-gray-400 mb-1">Sports</p>
                        <div className="flex flex-wrap gap-2">
                            {player.preferred_sports.map(sport => (
                                <span key={sport} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{sport}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Languages</p>
                        <div className="flex flex-wrap gap-2">
                            {player.languages.map(lang => (
                                <span key={lang} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs uppercase">{lang}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;
