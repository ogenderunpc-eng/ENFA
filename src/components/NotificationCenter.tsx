import React from 'react';
import { Bell, X, MessageSquare, BookOpen, BarChart3, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService } from '../services/notificationService';
import { AppNotification } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NotificationCenterProps {
  userId: string;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  React.useEffect(() => {
    if (!userId) return;
    
    // Request permission on mount
    notificationService.requestPermission();

    const unsubscribe = notificationService.getNotifications(userId, (data) => {
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} className="text-blue-500" />;
      case 'exam': return <BookOpen size={16} className="text-orange-500" />;
      case 'performance': return <BarChart3 size={16} className="text-accent" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleOpen}
        className="relative p-2 text-white/70 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[70] lg:hidden bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 max-h-[480px] bg-white rounded-2xl shadow-2xl z-[80] overflow-hidden border border-outline-variant/10 flex flex-col"
            >
              <div className="p-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/10">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <Bell size={18} className="text-accent" />
                  Bildirimler
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={18} className="text-outline" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-outline-variant">
                    <p className="text-sm">Henüz bildiriminiz yok.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer ${
                        notification.isRead ? 'opacity-60 bg-transparent' : 'bg-accent/5 hover:bg-accent/10 border-l-4 border-accent'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold ${notification.isRead ? 'text-outline' : 'text-primary'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] text-outline-variant">
                              {format(new Date(notification.createdAt), 'HH:mm', { locale: tr })}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                            {notification.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.some(n => !n.isRead) && (
                <div className="p-2 border-t border-outline-variant/10 bg-surface-container/50">
                  <button 
                    onClick={() => notificationService.clearAllNotifications(notifications.filter(n => !n.isRead))}
                    className="w-full py-2 text-xs font-bold text-accent hover:bg-accent/5 rounded-lg transition-colors"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
