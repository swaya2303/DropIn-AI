
import { calculateGhostScore } from './ghostScore';

// Utility to determine incentive actions based on confidence score

export const generateIncentiveActions = (game, roster, allPlayers, confidenceData) => {
    const actions = [];
    const score = confidenceData.score;
    const hoursUntil = (new Date(`${game.date}T${game.time}`) - new Date()) / (1000 * 60 * 60);

    // Helpers
    const getAtRiskPlayers = () => {
        return roster.filter(p => {
            const history = p.attendance_history || [];
            if (history.length === 0) return false;
            const rate = history.filter(a => a.showed_up).length / history.length;
            return rate < 0.8; // Expanded definition of "at risk" for nudges
        });
    };

    const getTopWaitlistCandidates = () => {
        // Potential players = All players NOT in roster
        const potential = allPlayers.filter(p => !game.signed_up_players.includes(p.id));

        // Sort by Ghost Score (Desc) -> Distance (Asc)
        return potential.sort((a, b) => {
            const scoreA = calculateGhostScore(a).score;
            const scoreB = calculateGhostScore(b).score;

            if (scoreB !== scoreA) return scoreB - scoreA;
            return a.distance_from_venue_km - b.distance_from_venue_km;
        }).slice(0, 3);
    };

    // Logic
    if (score < 40) {
        // LEVEL 3: ESCALATION
        // 1. Nudge ALL at-risk players
        const targets = getAtRiskPlayers();
        targets.forEach(p => {
            actions.push({
                id: `nudge-${game.id}-${p.id}`,
                gameId: game.id,
                gameTitle: game.title,
                type: 'Nudge (Urgent)',
                targetPlayer: p.name,
                message: `Hey ${p.name}, urgent check-in for ${game.title} in ${Math.round(hoursUntil)}h. Please confirm!`,
                level: 3
            });
        });

        // 2. Reward Waitlist
        const waitlist = getTopWaitlistCandidates();
        waitlist.forEach(p => {
            actions.push({
                id: `reward-${game.id}-${p.id}`,
                gameId: game.id,
                gameTitle: game.title,
                type: 'Reward Offer',
                targetPlayer: p.name,
                message: `Spot open in ${game.title}! We added 50 GameCoins bonus. Join now?`,
                level: 3
            });
        });

        // 3. Organizer Warning (Client handles display, but we can return a meta action)
        actions.push({
            id: `warn-${game.id}`,
            gameId: game.id,
            gameTitle: game.title,
            type: 'Escalation',
            targetPlayer: 'Organizer',
            message: 'Consider rescheduling or reducing max players.',
            level: 3
        });

    } else if (score < 55) {
        // LEVEL 2: REWARD
        const waitlist = getTopWaitlistCandidates();
        waitlist.forEach(p => {
            actions.push({
                id: `reward-${game.id}-${p.id}`,
                gameId: game.id,
                gameTitle: game.title,
                type: 'Reward Offer',
                targetPlayer: p.name,
                message: `A spot opened in ${game.title}. Offering 50 GameCoins to join!`,
                level: 2
            });
        });

    } else if (score < 70) {
        // LEVEL 1: NUDGE
        const targets = getAtRiskPlayers();
        targets.forEach(p => {
            actions.push({
                id: `nudge-${game.id}-${p.id}`,
                gameId: game.id,
                gameTitle: game.title,
                type: 'Smart Nudge',
                targetPlayer: p.name,
                message: `Hey ${p.name}, just confirming you're good for ${game.title} in ${Math.round(hoursUntil)}h?`,
                level: 1
            });
        });
    }

    return actions;
};
