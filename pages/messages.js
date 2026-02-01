
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translationEngine';
import initialMessages from '../data/messages.json';

export default function Messages() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all');
    const [messages, setMessages] = useState(initialMessages);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter Logic
    const filteredMessages = messages.filter(msg => {
        if (filter === 'all') return true;
        return msg.type === filter;
    });

    const markAllRead = () => {
        const updated = messages.map(m => ({ ...m, isRead: true }));
        setMessages(updated);
    };

    const simulateIncoming = () => {
        const newMsg = {
            id: `new-${Date.now()}`,
            type: ['update', 'nudge', 'waitlist', 'chat'][Math.floor(Math.random() * 4)],
            content_key: 'custom_msg',
            fallback_text: `New simulated message at ${new Date().toLocaleTimeString()}`,
            sender: "Simulated User",
            timestamp: new Date().toISOString(),
            isRead: false
        };
        setMessages([newMsg, ...messages]);
    };

    // Color/Icon Helpers
    const getTypeStyles = (type) => {
        switch (type) {
            case 'update': return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10';
            case 'nudge': return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10';
            case 'waitlist': return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10';
            case 'chat': return 'border-l-4 border-indigo-500 bg-white dark:bg-gray-800';
            default: return 'bg-white';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'update': return '📢 Update';
            case 'nudge': return '⏰ Nudge';
            case 'waitlist': return '🎉 Waitlist';
            case 'chat': return '💬 Chat';
            default: return 'Message';
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('inbox_title')}</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={simulateIncoming}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                            + Simulate Incoming
                        </button>
                        <button
                            onClick={markAllRead}
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                            {t('mark_read')}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'update', 'nudge', 'waitlist', 'chat'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors
                                ${filter === f
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}
                            `}
                        >
                            {t(`filter_${f === 'update' ? 'updates' : f === 'nudge' ? 'nudges' : f}`)}
                        </button>
                    ))}
                </div>

                {/* Message List */}
                <div className="space-y-4">
                    {filteredMessages.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed text-gray-400">
                            No messages found.
                        </div>
                    ) : (
                        filteredMessages.map(msg => (
                            <div key={msg.id} className={`p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all ${getTypeStyles(msg.type)} ${!msg.isRead ? 'ring-1 ring-offset-1 ring-indigo-400' : 'opacity-90'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                                        {getTypeLabel(msg.type)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {mounted ? new Date(msg.timestamp).toLocaleString() : ''}
                                    </span>
                                </div>
                                <p className="text-gray-900 dark:text-white font-medium mb-1">
                                    {t(msg.content_key, msg.fallback_text)}
                                </p>
                                <p className="text-xs text-gray-500">From: {msg.sender}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
