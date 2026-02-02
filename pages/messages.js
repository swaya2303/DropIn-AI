
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translationEngine';
import initialMessages from '../data/messages.json';

export default function Messages() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all');
    const [messages, setMessages] = useState(initialMessages);
    const [mounted, setMounted] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

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

    const markAsRead = (msgId) => {
        const updated = messages.map(m =>
            m.id === msgId ? { ...m, isRead: true } : m
        );
        setMessages(updated);
    };

    const deleteMessage = (msgId) => {
        setMessages(messages.filter(m => m.id !== msgId));
        if (selectedMessage?.id === msgId) {
            setSelectedMessage(null);
        }
    };

    const simulateIncoming = () => {
        const types = ['update', 'nudge', 'waitlist', 'chat'];
        const senders = ['Alex Martinez', 'Game Organizer', 'System', 'Eva Johansson'];
        const contents = [
            'Your game tomorrow has been confirmed!',
            'Reminder: Soccer match starts in 2 hours',
            'You moved up in the waitlist!',
            'New message from your teammate'
        ];
        const typeIdx = Math.floor(Math.random() * 4);

        const newMsg = {
            id: `new-${Date.now()}`,
            type: types[typeIdx],
            content_key: 'custom_msg',
            fallback_text: contents[typeIdx],
            sender: senders[typeIdx],
            timestamp: new Date().toISOString(),
            isRead: false
        };
        setMessages([newMsg, ...messages]);
    };

    // Color/Icon Helpers
    const getTypeIcon = (type) => {
        switch (type) {
            case 'update': return '📢';
            case 'nudge': return '⏰';
            case 'waitlist': return '🎉';
            case 'chat': return '💬';
            default: return '📩';
        }
    };

    const getTypeBadgeStyles = (type) => {
        switch (type) {
            case 'update': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'nudge': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            case 'waitlist': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'chat': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getAvatarGradient = (type) => {
        switch (type) {
            case 'update': return 'from-blue-400 to-blue-600';
            case 'nudge': return 'from-orange-400 to-orange-600';
            case 'waitlist': return 'from-green-400 to-green-600';
            case 'chat': return 'from-indigo-400 to-purple-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const unreadCount = messages.filter(m => !m.isRead).length;

    const formatTime = (timestamp) => {
        if (!mounted) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {t('inbox_title')}
                            {unreadCount > 0 && (
                                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                                    {unreadCount} new
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Stay updated with game notifications and messages</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={simulateIncoming}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                        >
                            <span>➕</span> Simulate
                        </button>
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                        >
                            <span>✓</span> {t('mark_read')}
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
                    {[
                        { key: 'all', label: 'All', icon: '📬' },
                        { key: 'update', label: 'Updates', icon: '📢' },
                        { key: 'nudge', label: 'Nudges', icon: '⏰' },
                        { key: 'waitlist', label: 'Waitlist', icon: '🎉' },
                        { key: 'chat', label: 'Chat', icon: '💬' }
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-1 justify-center
                                ${filter === f.key
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <span>{f.icon}</span>
                            <span className="hidden sm:inline">{f.label}</span>
                        </button>
                    ))}
                </div>

                {/* Messages Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Message List */}
                    <div className="lg:col-span-2 space-y-3">
                        {filteredMessages.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-500 font-medium">No messages found</p>
                                <p className="text-gray-400 text-sm mt-1">Try a different filter or wait for new messages</p>
                            </div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => { setSelectedMessage(msg); markAsRead(msg.id); }}
                                    className={`relative p-4 rounded-xl cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] border 
                                        ${selectedMessage?.id === msg.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                        }
                                        ${!msg.isRead ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900' : ''}
                                    `}
                                >
                                    {/* Unread indicator */}
                                    {!msg.isRead && (
                                        <div className="absolute top-4 right-4 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(msg.type)} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                                            {getTypeIcon(msg.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTypeBadgeStyles(msg.type)}`}>
                                                    {msg.type.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                                            </div>
                                            <p className={`font-semibold text-gray-900 dark:text-white truncate ${!msg.isRead ? '' : 'opacity-80'}`}>
                                                {t(msg.content_key, msg.fallback_text)}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">From: {msg.sender}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Message Detail Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {selectedMessage ? (
                                <div>
                                    {/* Header */}
                                    <div className={`p-6 bg-gradient-to-br ${getAvatarGradient(selectedMessage.type)}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-4xl">
                                                {getTypeIcon(selectedMessage.type)}
                                            </div>
                                            <div className="text-white">
                                                <p className="font-bold text-lg">{selectedMessage.sender}</p>
                                                <p className="text-white/80 text-sm">{selectedMessage.type.toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6">
                                        <p className="text-gray-900 dark:text-white font-medium text-lg mb-4">
                                            {t(selectedMessage.content_key, selectedMessage.fallback_text)}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            {mounted ? new Date(selectedMessage.timestamp).toLocaleString() : ''}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            {(selectedMessage.type === 'chat' || selectedMessage.type === 'nudge') && (
                                                <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                                                    Reply
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteMessage(selectedMessage.id)}
                                                className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="text-6xl mb-4 opacity-30">📩</div>
                                    <p className="text-gray-400 font-medium">Select a message</p>
                                    <p className="text-gray-400 text-sm mt-1">Click on any message to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
