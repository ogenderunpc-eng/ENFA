import React, { useState } from 'react';
import { Bell, Star, TrendingUp, MessageSquare, Calendar, ArrowRight, BookOpen, BarChart3, CheckCircle2, UserPlus, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GRADE_UPDATES, TEACHER_COMMENTS } from '../constants';
import { Student, ClassSession, Message } from '../types';

interface ParentDashboardProps {
  classes?: ClassSession[];
  messages: Message[];
  userName: string;
  onNavigate?: (tab: string) => void;
  students?: Student[];
  activeTab?: string;
}

export default function ParentDashboard({ onNavigate, messages, userName, students = [], activeTab = 'home' }: ParentDashboardProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Real child data (assuming first student for demo)
  const child = students[0];
  const realGrades = child?.grades || [];
  
  const [activities] = useState([
    { id: 1, type: 'attendance', title: 'Yoklama Girişi', description: 'Ali bugün Matematik dersine katıldı.', time: '09:15', icon: <UserPlus className="text-green-500" size={18} /> },
    { id: 2, type: 'grade', title: 'Yeni Not Girildi', description: 'Fizik laboratuvar raporu: 95/100', time: '11:30', icon: <TrendingUp className="text-secondary" size={18} /> },
    { id: 3, type: 'material', title: 'Ders Materyali', description: 'Biyoloji: Hücre Bölünmesi dökümanı paylaşıldı.', time: '13:45', icon: <BookOpen className="text-primary" size={18} /> },
    { id: 4, type: 'behavior', title: 'Öğretmen Notu', description: 'Ali grup çalışmasında liderlik gösterdi.', time: '15:20', icon: <Star className="text-orange-400" size={18} fill="currentColor" /> },
  ]);

  const chartData = realGrades.map(g => ({
    label: g.subject.substring(0, 4).toUpperCase(),
    value: g.value,
    target: 85
  }));

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">📊 Talebe Paneli / {activeTab === 'kts' ? 'Notlarım' : activeTab === 'schedule' ? 'İstatistikler' : 'Ana Sayfa'}</h2>
        <p className="text-on-surface-variant font-medium">Hoş Geldiniz, {userName}. Bugün akademik durumunuz aşağıdadır.</p>
      </motion.section>

      {/* Talebe Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Toplam Öğrenci</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-secondary">66</span>
            <span className="text-xs font-bold text-primary bg-secondary/10 px-2 py-0.5 rounded-full">+2</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Genel Başarı Oranı</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-secondary">%84.5</span>
            <span className="text-xs font-bold text-primary bg-secondary/10 px-2 py-0.5 rounded-full">1.4</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 text-center">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Yoklama Durumu</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-secondary">%98</span>
            <span className="text-xs font-bold text-primary bg-secondary/10 px-2 py-0.5 rounded-full">Tamam</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Haftalık Başarı Grafiği */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/10"
        >
          <h3 className="text-xl font-bold text-primary mb-8">Haftalık Başarı Grafiği</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[20, 35, 30, 58, 75, 94].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full group">
                <div className="w-full bg-surface-container-high rounded-t-lg relative h-48">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg transition-colors group-hover:bg-primary"
                  />
                </div>
                <span className="text-xs font-medium text-outline">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Puan Dağılımı */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/10"
        >
          <h3 className="text-xl font-bold text-primary mb-8">Puan Dağılımı</h3>
          <div className="space-y-6">
            {[
              { label: 'Mat', score: 85 },
              { label: 'Fiz', score: 70 },
              { label: 'Tür', score: 90 },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-primary">{item.label}</span>
                  <span className="text-xs font-black text-secondary">{item.score}</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-10 border-t border-outline-variant/10"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Activity className="text-secondary" size={24} />
            Son Etkinlikler
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-outline-variant/10 shadow-sm">
              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center flex-shrink-0">
                {activity.icon}
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-primary">{activity.title}</h5>
                  <span className="text-[10px] font-medium text-outline ml-4">{activity.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-2xl group hover:bg-primary/10 transition-colors border border-primary/10">
            <div className="w-14 h-14 flex-shrink-0 bg-primary/10 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <BookOpen className="text-primary" size={28} />
            </div>
            <div className="flex-grow">
              <h5 className="font-bold text-primary text-lg">Ödev Takibi</h5>
              <p className="text-sm text-on-surface-variant font-medium">Bu hafta tamamlanması gereken 3 ödev var.</p>
            </div>
            <button 
              onClick={() => onNavigate?.('schedule')}
              className="px-5 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-nowrap"
            >
              Kontrol Et
            </button>
          </div>

          <div className="flex items-center gap-6 p-6 bg-secondary/5 rounded-2xl group hover:bg-secondary/10 transition-colors border border-secondary/10">
            <div className="w-14 h-14 flex-shrink-0 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Bell className="text-secondary" size={28} />
            </div>
            <div className="flex-grow">
              <h5 className="font-bold text-primary text-lg">Haftalık Rapor</h5>
              <p className="text-sm text-on-surface-variant font-medium">Ali'nin haftalık durum raporu hazır.</p>
            </div>
            <button 
              onClick={() => {
                setToastMessage('Haftalık rapor e-posta adresinize gönderildi.');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
              }}
              className="px-5 py-2 bg-secondary text-white rounded-lg font-bold text-sm shadow-lg shadow-secondary/20 hover:opacity-90 transition-all text-nowrap"
            >
              Raporu Al
            </button>
          </div>
        </div>
      </motion.section>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[200] bg-primary text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl"
          >
            <CheckCircle2 className="text-secondary" size={24} />
            <span className="font-bold">{toastMessage || 'Etkinlik başarıyla takviminize eklendi!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
