
import Sidebar from './Sidebar';
import { TranslationProvider, useTranslation } from '../utils/translationEngine';
import DemoGuide from './DemoGuide';

// Inner component to access context
const LayoutContent = ({ children }) => {
    const { language, setLanguage } = useTranslation();
    const languages = [
        { code: 'en', label: '🇺🇸 EN' },
        { code: 'es', label: '🇪🇸 ES' },
        { code: 'fr', label: '🇫🇷 FR' },
        { code: 'de', label: '🇩🇪 DE' },
        { code: 'it', label: '🇮🇹 IT' },
        { code: 'pt', label: '🇵🇹 PT' },
        { code: 'nl', label: '🇳🇱 NL' },
        { code: 'pl', label: '🇵🇱 PL' },
        { code: 'sv', label: '🇸🇪 SV' },
        { code: 'no', label: '🇳🇴 NO' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto relative">
                {/* Language Toggler */}
                <div className="absolute top-8 right-8 z-10">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white py-1 px-3 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                    </select>
                </div>
                {children}
                <DemoGuide />
            </main>
        </div>
    );
};

// Main Layout Wrapper
const Layout = ({ children }) => {
    return <LayoutContent>{children}</LayoutContent>;
};

export default Layout;
