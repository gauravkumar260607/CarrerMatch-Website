import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ExternalLink, Calendar, Award, AlertCircle, FileText, Briefcase } from 'lucide-react';
import { Notification } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface NotificationDropdownProps {
  onNavigate: (path: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigate }) => {
  const { unreadCount, refreshNotifications } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifs();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickItem = async (notif: Notification) => {
    if (!notif.read) {
      await api.markNotificationRead(notif._id);
      refreshNotifications();
    }
    setOpen(false);
    if (notif.link) {
      onNavigate(notif.link);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'selection':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'interview':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'application':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-indigo-600 rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No notifications right now.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleClickItem(n)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start ${
                    !n.read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-md bg-white border border-slate-200 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-medium truncate ${!n.read ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
