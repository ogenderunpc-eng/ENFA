import React, { useState } from 'react';
import { Bell, Star, TrendingUp, MessageSquare, Calendar, ArrowRight, BookOpen, BarChart3, CheckCircle2, UserPlus, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GRADE_UPDATES, TEACHER_COMMENTS } from '../constants';
import { ClassSession, Message } from '../types';

interface ParentDashboardProps {
  classes?: ClassSession[];
  messages: Message[];
  userName: string;
  onNavigate?: (tab: string) => void;
}

export default function ParentDashboard({ onNavigate, messages, userName }: ParentDashboardProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [activities] = useState([
    { id: 1, type: 'attendance', title: 'Yoklama Girişi', description: 'Ali bugün Matematik dersine katıldı.', time: '09:15', icon: <UserPlus className="text-green-500" size={18} /> },
    { id: 2, type: 'grade', title: 'Yeni Not Girildi', description: 'Fizik laboratuvar raporu: 95/100', time: '11:30', icon: <TrendingUp className="text-secondary" size={18} /> },
    { id: 3, type: 'material', title: 'Ders Materyali', description: 'Biyoloji: Hücre Bölünmesi dökümanı paylaşıldı.', time: '13:45', icon: <BookOpen className="text-primary" size={18} /> },
    { id: 4, type: 'behavior', title: 'Öğretmen Notu', description: 'Ali grup çalışmasında liderlik gösterdi.', time: '15:20', icon: <Star className="text-orange-400" size={18} fill="currentColor" /> },
  ]);

  const [chartData] = useState(() => [
    { label: 'MAT', ali: Math.floor(Math.random() * 40) + 60, sinif: Math.floor(Math.random() * 30) + 50 },
    { label: 'FİZ', ali: Math.floor(Math.random() * 40) + 60, sinif: Math.floor(Math.random() * 30) + 50 },
    { label: 'KİM', ali: Math.floor(Math.random() * 40) + 60, sinif: Math.floor(Math.random() * 30) + 50 },
    { label: 'EDEB', ali: Math.floor(Math.random() * 40) + 60, sinif: Math.floor(Math.random() * 30) + 50 },
    { label: 'TAR', ali: Math.floor(Math.random() * 40) + 60, sinif: Math.floor(Math.random() * 30) + 50 },
  ]);

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Hoş Geldiniz, {userName}</h2>
        <p className="text-on-surface-variant font-medium">Ali'nin bugünkü akademik durumu ve güncellemeleri aşağıdadır.</p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Notification Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden shadow-[0_12px_40px_rgba(0,30,64,0.06)] border-l-4 border-secondary"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-error relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              </span>
              <h3 className="text-lg font-bold text-primary">Yeni Duyuru</h3>
            </div>
            <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded">2 saat önce</span>
          </div>
          <p className="text-on-surface font-medium mb-4 leading-relaxed">
            Matematik öğretmeni Zeynep Hanım bir not paylaştı: "Ali bugün derste sayılarla kavga etti, 7 rakamı 8'i yemiş diyorlar. Lütfen evde rakamları barıştırın, yoksa matematik ormanı birbirine girecek."
          </p>
          <button 
            onClick={() => onNavigate?.('messages')}
            className="text-sm font-bold text-secondary flex items-center gap-1 hover:gap-2 transition-all border-none bg-transparent"
          >
            Yanıtla <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* Grade Update Snapshot */}
        {GRADE_UPDATES.map((update) => (
          <motion.div 
            key={update.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-4 bg-primary-container rounded-xl p-6 text-white flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <Star className="text-secondary-container" size={32} fill="currentColor" />
                <span className="bg-white/10 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Güncel Not</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-1">{update.subject}: {update.grade}</h3>
              <p className="text-white/60 text-sm">{update.description}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/60">Sınıf Ortalaması: {update.average}</p>
            </div>
          </motion.div>
        ))}

        {/* Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 md:col-span-7 bg-surface-container-low rounded-xl p-8"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-primary mb-1">Ders Bazlı Gelişim</h3>
                <p className="text-sm text-on-surface-variant">Son 4 Haftalık Performans Analizi</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Ali</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Sınıf</span>
                  </div>
                </div>
              </div>
            </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {chartData.map((data, i) => (
              <div key={data.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${data.sinif}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                    className="w-4 bg-outline-variant/30 rounded-t-sm" 
                  />
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${data.ali}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className="w-4 bg-secondary rounded-t-sm" 
                  />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">{data.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Messages for Parent */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 md:col-span-5 bg-surface-container-low rounded-xl p-6 flex flex-col"
        >
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <MessageSquare className="text-secondary" size={20} />
            Son Mesajlar
          </h3>
          <div className="space-y-4 mb-4">
            {messages.slice(0, 3).map((msg) => (
              <div key={msg.id} className="p-3 bg-white rounded-lg border border-outline-variant/10 shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-primary">{msg.sender}</span>
                  <span className="text-[10px] text-outline">{msg.time}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant line-clamp-1">{msg.content}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigate?.('messages')}
            className="mt-auto text-sm font-bold text-secondary flex items-center gap-1 hover:underline bg-transparent border-none"
          >
            Tüm Mesajları Gör <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Teacher Comments */}
        <div className="col-span-12 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-container-highest/30 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <MessageSquare className="text-secondary" size={20} />
              Öğretmen Görüşleri
            </h3>
            <div className="space-y-6">
              {TEACHER_COMMENTS.map((comment, i) => (
                <div key={comment.id} className="relative pl-6">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${i === 0 ? 'bg-secondary-container' : 'bg-primary-fixed-dim'}`}></div>
                  <p className="text-sm font-medium italic text-on-surface leading-relaxed mb-2">
                    "{comment.comment}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                      <img className="w-full h-full object-cover" src={comment.avatar} alt={comment.teacherName} referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[11px] font-bold text-on-surface-variant">{comment.teacherName}, {comment.subject}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary text-white rounded-xl p-6 flex items-center justify-between group cursor-pointer hover:bg-opacity-95 transition-all"
          >
            <div>
              <h4 className="font-bold text-lg">Veli Toplantısı</h4>
              <p className="text-white/60 text-xs">14 Aralık Perşembe, 18:30</p>
            </div>
            <Calendar className="opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
          </motion.div>
        </div>
      </div>

      {/* Detailed Recent Activities */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-10 border-t border-outline-variant/10"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold font-headline text-primary flex items-center gap-3">
            <Activity className="text-secondary" size={24} />
            Son Etkinlikler
          </h3>
          <button className="text-xs font-bold text-secondary tracking-widest uppercase hover:underline">Haftalık Döküm</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {activities.slice(0, 2).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/5 shadow-sm group hover:bg-white hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  {activity.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-primary">{activity.title}</h5>
                    <span className="text-[10px] font-medium text-outline">{activity.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {activities.slice(2, 4).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/5 shadow-sm group hover:bg-white hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  {activity.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-primary">{activity.title}</h5>
                    <span className="text-[10px] font-medium text-outline">{activity.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
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
