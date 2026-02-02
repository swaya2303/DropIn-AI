
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../utils/translationEngine';
import messagesData from '../data/messages.json';

export default function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation();

  const unreadCount = messagesData.filter(m => !m.isRead).length;

  const isActive = (path) => router.pathname === path ? 'bg-indigo-700' : 'hover:bg-gray-800';

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold tracking-tight">GameSync</h2>
        <p className="text-xs text-gray-400 mt-1">Soccer MVP</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
          {t('nav_home')}
        </Link>
        <Link href="/organizer-dashboard" className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/organizer-dashboard')}`}>
          Organizer Dashboard
        </Link>
        <Link href="/player-dashboard" className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/player-dashboard')}`}>
          Player Dashboard
        </Link>
        <Link href="/messages" className={`flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${isActive('/messages')}`}>
          <span>{t('nav_messages')}</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/profile" className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/profile')}`}>
          {t('nav_profile')}
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
          <div>
            <p className="text-sm font-bold">Alex Rivera</p>
            <p className="text-xs text-gray-400">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
