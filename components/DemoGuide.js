
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DemoGuide() {
    const router = useRouter();
    const { demoStep } = router.query;

    if (!demoStep) return null;

    const step = parseInt(demoStep);

    const guides = {
        1: {
            text: "Welcome to GameSync! Step 1: Find a game to join. Notice the variety of sports and filtering options.",
            nextText: "Go to a Game",
            nextLink: "/games?demoStep=2",
            position: "bottom-8 left-1/2 transform -translate-x-1/2"
        },
        2: {
            text: "This is the Game Detail Page. Check out the calculated Confidence Score and the Ghost Score badges on the roster.",
            nextText: "Check Profile",
            nextLink: "/profile?demoStep=3",
            position: "bottom-8 left-1/2 transform -translate-x-1/2"
        },
        3: {
            text: "Here is your Player Profile. See your detailed Ghost Score breakdown and earned Milestones.",
            nextText: "Organizer View",
            nextLink: "/dashboard?demoStep=4",
            position: "bottom-8 left-1/2 transform -translate-x-1/2"
        },
        4: {
            text: "The Organizer Dashboard. Try the 'Simulate Scenario' to see the Incentive Engine in action!",
            nextText: "See Messages",
            nextLink: "/messages?demoStep=5",
            position: "bottom-8 right-8"
        },
        5: {
            text: "The Unified Communication Hub. Try switching languages in the top right to see AI translation work!",
            nextText: "Finish Demo",
            nextLink: "/",
            position: "bottom-8 left-1/2 transform -translate-x-1/2"
        }
    };

    const currentGuide = guides[step];
    if (!currentGuide) return null;

    return (
        <div className={`fixed ${currentGuide.position} z-50 bg-indigo-900 text-white p-6 rounded-xl shadow-2xl border border-indigo-400 max-w-sm animate-bounce-slight`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-indigo-900"></div>
            <h4 className="font-bold text-indigo-300 uppercase text-xs mb-2 tracking-wider">Demo Step {step}/5</h4>
            <p className="mb-4 text-sm font-medium leading-relaxed">{currentGuide.text}</p>
            <div className="flex justify-end">
                <Link
                    href={currentGuide.nextLink}
                    className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
                >
                    {currentGuide.nextText} →
                </Link>
            </div>
        </div>
    );
}
