import { useState } from 'react';

export default function PlayerRating({ player, gameId, existingRating, onSubmit }) {
    const [rating, setRating] = useState(existingRating?.skill_rating || 0);
    const [comment, setComment] = useState(existingRating?.comment || '');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(!!existingRating);

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Please select a rating before submitting');
            return;
        }

        onSubmit({
            rated_player_id: player.id,
            game_id: gameId,
            skill_rating: rating,
            comment: comment.trim()
        });

        setSubmitted(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{player.name}</h4>
                    <p className="text-xs text-gray-500">Skill Level: {player.skill_level}</p>
                </div>
            </div>

            {/* Rating Scale */}
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rate their skill (1-10)
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                            key={num}
                            type="button"
                            disabled={submitted}
                            onMouseEnter={() => !submitted && setHoveredRating(num)}
                            onMouseLeave={() => !submitted && setHoveredRating(0)}
                            onClick={() => !submitted && setRating(num)}
                            className={`w-8 h-8 rounded font-bold text-sm transition-all ${submitted
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'hover:scale-110'
                                } ${num <= (hoveredRating || rating)
                                    ? num <= 3
                                        ? 'bg-red-500 text-white'
                                        : num <= 6
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-green-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment (optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => !submitted && setComment(e.target.value)}
                    disabled={submitted}
                    placeholder="Share your experience playing with this player..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={2}
                />
            </div>

            {/* Submit Button */}
            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Submit Rating
                </button>
            ) : (
                <div className="py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center rounded-lg font-semibold text-sm">
                    ✓ Rating Submitted
                </div>
            )}
        </div>
    );
}
