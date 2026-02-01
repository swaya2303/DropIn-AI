
// Utility to calculate Ghost Score (0-100)

export const calculateGhostScore = (player) => {
    let score = 0;
    const breakdown = {
        attendance: 0,
        cancellation: 0,
        skill: 0,
        sportsmanship: 0
    };

    // 1. Attendance Consistency (40% Weight -> Max 40 pts)
    if (player.attendance_history && player.attendance_history.length > 0) {
        const attended = player.attendance_history.filter(a => a.showed_up).length;
        const total = player.attendance_history.length;
        const rate = attended / total;

        let attendancePoints = 0;
        if (rate >= 0.9) attendancePoints = 40;
        else attendancePoints = Math.round(rate * 40);

        score += attendancePoints;
        breakdown.attendance = attendancePoints;
    } else {
        // New player boost (start with decent faith)
        score += 30;
        breakdown.attendance = 30;
    }

    // 2. Cancellation Behavior (25% Weight -> Max 25 pts)
    let cancellationPoints = 25; // Start full
    if (player.cancellation_history && player.cancellation_history.length > 0) {
        player.cancellation_history.forEach(scan => {
            const cancelledAt = new Date(scan.cancelled_at);
            const gameTime = new Date(scan.game_time);
            const hoursBefore = (gameTime - cancelledAt) / (1000 * 60 * 60);

            if (hoursBefore < 2) cancellationPoints -= 10; // Late
            else if (hoursBefore < 24) cancellationPoints -= 5;
            else cancellationPoints -= 2;
        });
    }
    cancellationPoints = Math.max(0, cancellationPoints);
    score += cancellationPoints;
    breakdown.cancellation = cancellationPoints;

    // 3. Skill Honesty (20% Weight -> Max 20 pts)
    const reported = player.skill_level || 5;
    const actual = player.actual_skill_rating || reported; // Fallback
    const diff = Math.abs(reported - actual);

    let skillPoints = 0;
    if (diff <= 1) skillPoints = 20;
    else if (diff <= 2) skillPoints = 10;
    else skillPoints = 0; // Dishonest!

    score += skillPoints;
    breakdown.skill = skillPoints;

    // 4. Sportsmanship (15% Weight -> Max 15 pts)
    if (player.sportsmanship_ratings && player.sportsmanship_ratings.length > 0) {
        const sum = player.sportsmanship_ratings.reduce((a, b) => a + b, 0);
        const avg = sum / player.sportsmanship_ratings.length;
        // Map 1-5 to 0-15
        // 5 -> 15, 3 -> 7.5, 1 -> 0
        // Formula: (avg / 5) * 15
        const sportsPoints = Math.round((avg / 5) * 15);
        score += sportsPoints;
        breakdown.sportsmanship = sportsPoints;
    } else {
        score += 15; // Benefit of doubt
        breakdown.sportsmanship = 15;
    }

    // Cap at 100
    score = Math.min(100, Math.max(0, score));

    // Badge Logic
    let badge = 'Grey';
    let colorClass = 'bg-gray-100 text-gray-800';

    if (score >= 80) {
        badge = 'Gold';
        colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (score >= 60) {
        badge = 'Silver';
        colorClass = 'bg-gray-200 text-gray-800 border-gray-300';
    } else if (score >= 40) {
        badge = 'Bronze';
        colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
    } else {
        badge = 'Grey';
        colorClass = 'bg-gray-100 text-gray-600 border-gray-200';
    }

    return {
        score,
        badge,
        colorClass,
        breakdown
    };
};
