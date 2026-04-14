import React from 'react';
import { Settings, LogOut, Shield, Bell, CreditCard, Award, Book, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { USER_STATS } from '../constants';
import { Role } from '../types';

interface ProfilePageProps {
  role: Role;
  userAvatar: string;
}

export default function ProfilePage({ role, userAvatar }: ProfilePageProps) {
  const menuItems = [
    { icon: Shield, label: 'Güvenlik ve Gizlilik', color: 'text-blue-500' },
    { icon: Bell, label: 'Bildirim Ayarları', color: 'text-orange-500' },
    { icon: CreditCard, label: 'Ödeme ve Abonelik', color: 'text-green-500' },
    { icon: Settings, label: 'Genel Ayarlar', color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-10">
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary">
            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-surface-container">
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <CheckCircle2 size={16} />
          </div>
        </motion.div>

        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">
            {role === 'teacher' ? 'Ahmet Yılmaz' : 'Ahmet Demir'}
          </h2>
          <p className="text-on-surface-variant font-medium">
            {role === 'teacher' ? 'Matematik Bölüm Başkanı' : 'Ali Demir\'in Velisi'}
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm text-center space-y-1">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Katılım</p>
          <p className="text-xl font-black text-primary">{USER_STATS.attendance}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm text-center space-y-1">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Ortalama</p>
          <p className="text-xl font-black text-primary">{USER_STATS.averageGrade}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm text-center space-y-1">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Ödevler</p>
          <p className="text-xl font-black text-primary">{USER_STATS.completedAssignments}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm text-center space-y-1">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Sınavlar</p>
          <p className="text-xl font-black text-primary">{USER_STATS.upcomingExams}</p>
        </div>
      </section>

      {/* Academic Badges (Teacher/Student focus) */}
      <section className="bg-primary-container rounded-2xl p-6 text-white overflow-hidden relative">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Award className="text-secondary-container" size={20} />
              Akademik Başarılar
            </h3>
            <p className="text-white/60 text-xs">Bu dönem kazanılan rozetler ve sertifikalar.</p>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                <Book size={18} className="text-secondary-container" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
      </section>

      {/* Menu List */}
      <section className="bg-surface-container-low rounded-2xl overflow-hidden">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button 
              key={i}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors border-b border-outline-variant/10 last:border-none group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={item.color} size={20} />
                </div>
                <span className="font-bold text-primary text-sm">{item.label}</span>
              </div>
              <ArrowRight className="text-outline-variant" size={18} />
            </button>
          );
        })}
      </section>

      {/* Logout */}
      <button className="w-full py-4 flex items-center justify-center gap-2 text-error font-bold hover:bg-error/5 rounded-2xl transition-colors">
        <LogOut size={20} />
        Oturumu Kapat
      </button>
    </div>
  );
}
