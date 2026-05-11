import React from 'react';
import { Calendar, Users, MessageSquare, User, Home, BarChart3, Settings, LogOut, CheckSquare, ListTodo, LayoutDashboard, BookOpen, Bell, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import { Role } from '../types';
import NotificationCenter from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onSwitchRole: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userAvatar: string;
  userId: string;
}

export default function Layout({ children, role, onLogout, activeTab, setActiveTab, userAvatar, userId }: LayoutProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const teacherNavItems = [
    { id: 'home', label: 'Sınıf Özeti', icon: LayoutDashboard },
    { id: 'portal', label: 'Yoklama Al', icon: ListTodo },
    { id: 'homework', label: 'Ödev Takibi', icon: ClipboardList },
    { id: 'kts', label: 'Not Girişi', icon: BarChart3 },
    { id: 'profile', label: 'Ayarlar', icon: Settings },
  ];

  const studentNavItems = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'homework', label: 'Ödev Takibi', icon: ClipboardList },
    { id: 'kts', label: 'Notlarım', icon: BookOpen },
    { id: 'schedule', label: 'İstatistikler', icon: BarChart3 },
    { id: 'profile', label: 'Ayarlar', icon: Settings },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 fixed inset-y-0 left-0 bg-black text-white z-[60] border-r border-[#222]">
        <div className="p-8 flex flex-col h-full">
          {/* Logo / Branding Area */}
          <div className="flex flex-col mb-8 p-2">
            <h1 className="text-[26px] font-[900] tracking-[2px] leading-none text-secondary uppercase">
              OGE ENDERUN
            </h1>
            <p className="text-[11px] font-bold text-[#777777] tracking-wider uppercase mt-2">BAŞARI ATLASI</p>
          </div>

          <div className="mb-6">
            <NotificationCenter userId={userId} />
          </div>

          <div className="h-px bg-white/5 mb-8" />
          
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all relative group ${
                    isActive ? 'bg-secondary text-black shadow-lg shadow-secondary/10 font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-black' : 'text-white/50 group-hover:text-white/80'} />
                  <span className="text-sm font-bold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5 h-auto">
            {!showLogoutConfirm ? (
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-4 px-4 py-3 text-white/50 hover:text-white transition-colors border border-white/10 rounded-xl"
              >
                <LogOut size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">🚪 Güvenli Çıkış</span>
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111111] p-5 rounded-2xl border border-white/10 shadow-2xl"
              >
                <p className="text-[11px] font-bold text-white/90 uppercase mb-4 text-center tracking-wide">Oturumu kapatmak istiyor musunuz?</p>
                <div className="flex flex-col gap-2">
                   <button 
                    onClick={onLogout}
                    className="bg-secondary text-black text-[11px] font-black py-3 rounded-xl hover:bg-white transition-all uppercase tracking-widest"
                  >
                    Çıkışı Onayla
                  </button>
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="bg-white/5 text-white/60 text-[11px] font-bold py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest"
                  >
                    Vazgeç
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 w-full z-50 bg-black text-white border-b border-white/5 shadow-md">
          <div className="flex justify-between items-center px-6 h-16 w-full">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-[1px] leading-none text-secondary uppercase">OGE ENDERUN</h1>
              <p className="text-[10px] font-bold text-[#777777] tracking-widest uppercase mt-0.5">BAŞARI ATLASI</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter userId={userId} />
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary/20">
                <img 
                  className="w-full h-full object-cover" 
                  src={userAvatar || `https://ui-avatars.com/api/?name=User`} 
                  alt="User Profile"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-24 lg:pt-12 pb-32 lg:pb-12 px-6 lg:px-12 max-w-screen-2xl">
          {children}
        </main>

        {/* Mobile BottomNavBar */}
        <nav className="lg:hidden fixed bottom-1 left-0 w-full z-50 px-4">
          <div className="bg-black text-white rounded-2xl flex justify-around items-center pt-3 pb-8 px-4 border border-white/5 shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center transition-all duration-200 active:scale-95 ${
                    isActive ? 'text-secondary font-bold' : 'text-white/40'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-[8px] uppercase tracking-tighter mt-1">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottomNavActive"
                      className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
