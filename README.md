
# GameSync MVP 🏆

**GameSync** is an intelligent sports organizer designed to solve the flakiness problem in pickup games. 
It uses a **Confidence Score** engine to predict game viability, a **Ghost Score** system to rate player reliability, and an **Incentive AI** to automatically fill spots when risk is high.

## Features

- **Ghost Scores**: Automated reliability rating (0-100) based on attendance, cancellations, and sportsmanship.
- **Confidence Engine**: Real-time prediction of whether a game will happen or be cancelled.
- **Incentive Engine**: Automatically triggers nudges, rewards, and waitlist promotions to save at-risk games.
- **Smart Waitlist**: Ranks players by their Ghost Score, promoting the most reliable ones first.
- **Unified Communication**: A central hub for all game updates with automated AI translation.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`.

## Demo Walkthrough 🚀

The MVP includes a guided demo mode to showcase the features in a logical flow:

1. **Start the Demo**: Click the large **"Start Guided Demo 🚀"** button on the Home Page.
2. **Follow the Tooltips**: A blue tooltip box will guide you through:
   - **Game Discovery**: Finding a game.
   - **Game Details**: Viewing Confidence Scores and Roster Badges.
   - **Player Profile**: Checking your Ghost Score breakdown.
   - **Organizer Dashboard**: Managing games and viewing the Incentive Feed.
   - **Communication Hub**: Checking messages and testing Translation.

## Key Simulation Features

- **Organizer Dashboard**: Use the **"⚡ Simulate Scenario"** button to watch the engine react in real-time to a cancellation, drop in confidence, and subsequent incentive recovery.
- **Messages**: Use the **"Simulate Incoming"** button to generate test messages.
- **Translation**: Use the language selector in the top-right corner to translate the interface into 10+ European languages.
