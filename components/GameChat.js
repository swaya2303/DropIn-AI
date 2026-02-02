import { useState, useEffect } from 'react';
import languagesData from '../data/languages.json';

export default function GameChat({ gameId, currentPlayerLanguage, onLanguageChange }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showOriginal, setShowOriginal] = useState({});
    const [translating, setTranslating] = useState({});
    const [translatedCache, setTranslatedCache] = useState({});

    // Initialize mock messages for demo
    useEffect(() => {
        const mockMessages = [
            {
                id: 'msg1',
                senderId: 'p9',
                senderName: 'Jean Dubois',
                text: 'Salut tout le monde ! Qui est prêt pour le match de demain ? ⚽',
                originalLanguage: 'fr',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'msg2',
                senderId: 'p7',
                senderName: 'Klaus Mueller',
                text: 'Ich bin dabei! Das Wetter sieht gut aus 🌤️',
                originalLanguage: 'de',
                timestamp: new Date(Date.now() - 3000000).toISOString()
            },
            {
                id: 'msg3',
                senderId: 'p8',
                senderName: 'Maria Garcia',
                text: '¡Perfecto! Nos vemos en el campo a las 6pm 🏃‍♀️',
                originalLanguage: 'es',
                timestamp: new Date(Date.now() - 2400000).toISOString()
            },
            {
                id: 'msg4',
                senderId: 'p1',
                senderName: 'Alex Rivera',
                text: "Can't wait! I'll bring extra water bottles 💧",
                originalLanguage: 'en',
                timestamp: new Date(Date.now() - 1800000).toISOString()
            },
            {
                id: 'msg5',
                senderId: 'p9',
                senderName: 'Jean Dubois',
                text: 'Quelqu\'un peut apporter un ballon ? J\'ai oublié le mien 😅',
                originalLanguage: 'fr',
                timestamp: new Date(Date.now() - 900000).toISOString()
            },
            {
                id: 'msg6',
                senderId: 'p7',
                senderName: 'Klaus Mueller',
                text: 'Kein Problem, ich habe zwei!',
                originalLanguage: 'de',
                timestamp: new Date(Date.now() - 300000).toISOString()
            }
        ];
        setMessages(mockMessages);
    }, []);

    // Translate a message
    const translateMessage = async (messageId, text, sourceLanguage, targetLanguage) => {
        const cacheKey = `${messageId}-${targetLanguage}`;

        // Check if already in cache
        if (translatedCache[cacheKey]) {
            return translatedCache[cacheKey];
        }

        // Skip if same language
        if (sourceLanguage === targetLanguage) {
            return text;
        }

        setTranslating(prev => ({ ...prev, [messageId]: true }));

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    sourceLanguage,
                    targetLanguage,
                    context: 'casual sports chat'
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Cache the translation
                setTranslatedCache(prev => ({
                    ...prev,
                    [cacheKey]: data.translatedText
                }));
                return data.translatedText;
            } else {
                console.error('Translation error:', data.error);
                return text; // Fallback to original
            }
        } catch (error) {
            console.error('Translation fetch error:', error);
            return text; // Fallback to original
        } finally {
            setTranslating(prev => ({ ...prev, [messageId]: false }));
        }
    };

    // Handle sending a new message
    const handleSend = () => {
        if (!newMessage.trim()) return;

        const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: 'p13', // Current user (Eva Johansson)
            senderName: 'Eva Johansson',
            text: newMessage,
            originalLanguage: currentPlayerLanguage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
    };

    // Get language name from code
    const getLanguageName = (code) => {
        const lang = languagesData.find(l => l.code === code);
        return lang ? lang.name : code.toUpperCase();
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Game Chat</h2>
                <button
                    onClick={() => setShowOriginal(prev => {
                        const newState = {};
                        messages.forEach(msg => {
                            newState[msg.id] = !prev[msg.id];
                        });
                        return newState;
                    })}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {Object.values(showOriginal).some(v => v) ? 'Hide Original' : 'Show Original'}
                </button>
            </div>

            {/* Chat Feed */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                    <MessageItem
                        key={msg.id}
                        message={msg}
                        currentLanguage={currentPlayerLanguage}
                        showOriginal={showOriginal[msg.id]}
                        translating={translating[msg.id]}
                        translateMessage={translateMessage}
                        getLanguageName={getLanguageName}
                        formatTime={formatTime}
                    />
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Type in ${getLanguageName(currentPlayerLanguage)}...`}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={handleSend}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

// Message Item Component
function MessageItem({
    message,
    currentLanguage,
    showOriginal,
    translating,
    translateMessage,
    getLanguageName,
    formatTime
}) {
    const [displayText, setDisplayText] = useState(message.text);
    const needsTranslation = message.originalLanguage !== currentLanguage;

    useEffect(() => {
        if (needsTranslation && !showOriginal) {
            translateMessage(
                message.id,
                message.text,
                message.originalLanguage,
                currentLanguage
            ).then(translated => {
                setDisplayText(translated);
            });
        } else {
            setDisplayText(message.text);
        }
    }, [currentLanguage, showOriginal, message.id, message.text, message.originalLanguage, needsTranslation]);

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {message.senderName}
                </span>
                <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                </span>
            </div>

            <p className="text-gray-800 dark:text-gray-200 mb-2">
                {translating ? (
                    <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Translating...
                    </span>
                ) : (
                    displayText
                )}
            </p>

            {needsTranslation && !showOriginal && !translating && (
                <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded">
                    Translated from {getLanguageName(message.originalLanguage)}
                </span>
            )}

            {showOriginal && needsTranslation && (
                <span className="inline-block px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                    Original {getLanguageName(message.originalLanguage)}
                </span>
            )}
        </div>
    );
}
