import React from 'react';
import { Calendar, Users, MessageSquare, User, ArrowLeftRight, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onSwitchRole: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userAvatar: string;
}

export default function Layout({ children, role, onSwitchRole, activeTab, setActiveTab, userAvatar }: LayoutProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'portal', label: 'Portal', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20">
              <img 
                className="w-full h-full object-cover" 
                src={userAvatar} 
                alt="User Profile"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl font-bold text-primary tracking-tight">Aeon Academy</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-screen-2xl mx-auto">
        {children}
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-outline-variant/10 shadow-[0_-12px_40px_rgba(0,30,64,0.06)]">
        <div className="flex justify-around items-center pt-3 pb-8 px-4 max-w-screen-2xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="w-1 h-1 bg-secondary rounded-full mt-1"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
