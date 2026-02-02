export default function LanguageDemo({ currentLanguage, onLanguageChange }) {
    const demoLanguages = ['en', 'fr', 'de', 'es'];

    const switchLanguage = () => {
        const currentIndex = demoLanguages.indexOf(currentLanguage);
        const nextIndex = (currentIndex + 1) % demoLanguages.length;
        onLanguageChange(demoLanguages[nextIndex]);
    };

    const getLanguageName = (code) => {
        const names = {
            'en': 'English',
            'fr': 'French',
            'de': 'German',
            'es': 'Spanish'
        };
        return names[code] || code;
    };

    return (
        <button
            onClick={switchLanguage}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
            🌐 Switch Language Demo
            <span className="ml-2 text-sm opacity-90">({getLanguageName(currentLanguage)})</span>
        </button>
    );
}
