
// Utility to calculate confidence score

export const calculateConfidenceScore = (game, roster) => {
    let score = 100;
    const explanations = [];

    // 1. Player Reliability
    let reliabilityDeduction = 0;
    let flakyPlayers = 0;

    roster.forEach(player => {
        if (!player.attendance_history || player.attendance_history.length === 0) return;

        const attended = player.attendance_history.filter(a => a.showed_up).length;
        const total = player.attendance_history.length;
        const rate = attended / total;

        if (rate < 0.7) {
            flakyPlayers++;
            let penalty = 5;
            // Check for late cancellations
            const lateCancels = player.cancellation_history?.length || 0;
            if (lateCancels > 1) penalty += 5; // Extra penalty for repeat offenders

            reliabilityDeduction += penalty;
        }
    });

    if (reliabilityDeduction > 0) {
        score -= reliabilityDeduction;
        explanations.push(`${flakyPlayers} player(s) have low attendance history.`);
    }

    // 2. Weather Sensitivity
    const isBadWeather = game.weather_forecast &&
        (game.weather_forecast.toLowerCase().includes('rain') ||
            game.weather_forecast.toLowerCase().includes('snow') ||
            game.weather_forecast.toLowerCase().includes('storm'));

    if (isBadWeather) {
        let weatherDeduction = 0;
        let sensitivePlayers = 0;
        roster.forEach(player => {
            if (player.weather_sensitivity) {
                weatherDeduction += 5;
                sensitivePlayers++;
            }
        });

        if (weatherDeduction > 0) {
            score -= weatherDeduction;
            explanations.push(`Forecast is bad and ${sensitivePlayers} player(s) are weather-sensitive.`);
        }
    }

    // 3. Time-Based Risk
    const gameDate = new Date(`${game.date}T${game.time}`);
    const now = new Date(); // In a real app, use consistent server time
    const hoursUntil = (gameDate - now) / (1000 * 60 * 60);

    if (hoursUntil < 24 && hoursUntil > 0) {
        if (score < 75) {
            score -= 5;
            explanations.push("Game is soon and confidence is shaky (urgency penalty).");
        }
    }

    // 4. Spots Remaining Boost
    if (roster.length > game.max_players) {
        score += 5;
        explanations.push("Oversubscribed game (good buffer).");
    }

    // Clamping
    score = Math.max(0, Math.min(100, score));

    // Labeling
    let label = 'High';
    if (score < 50) label = 'Low';
    else if (score < 70) label = 'Medium';

    // Default explanation if empty
    if (explanations.length === 0) {
        explanations.push("Solid roster and conditions.");
    }

    return {
        score,
        label,
        explanation: explanations.join(" ")
    };
};
