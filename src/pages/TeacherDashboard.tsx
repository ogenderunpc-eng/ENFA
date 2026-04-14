import React, { useState, useRef } from 'react';
import { UserCheck, Edit3, BarChart3, MessageSquare, ArrowRight, FileText, Clock, Plus, X, Bell, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RECENT_MESSAGES } from '../constants';
import { ClassSession } from '../types';

interface TeacherDashboardProps {
  classes: ClassSession[];
  setClasses: (classes: ClassSession[] | ((prev: ClassSession[]) => ClassSession[])) => void;
}

export default function TeacherDashboard({ classes, setClasses }: TeacherDashboardProps) {
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClass, setNewClass] = useState({ title: '', time: '', location: '', classGroup: '' });
  const [isRinging, setIsRinging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nextClass = classes.find(c => c.status === 'next') || classes[0];

  const handleRingBell = () => {
    if (isRinging) return;
    
    setIsRinging(true);
    if (!audioRef.current) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }
    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    
    setTimeout(() => {
      setIsRinging(false);
    }, 3000);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.title || !newClass.time) return;

    const session: ClassSession = {
      id: Date.now().toString(),
      title: newClass.title,
      time: newClass.time,
      location: newClass.location || 'Belirtilmedi',
      classGroup: newClass.classGroup || 'Genel',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    };

    setClasses(prev => [...prev, session]);
    setNewClass({ title: '', time: '', location: '', classGroup: '' });
    setIsAddingClass(false);
  };

  return (
    <div className="space-y-12">
      {/* Welcome & Fast Actions */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-secondary font-semibold tracking-wide uppercase text-xs mb-2">Hoş Geldiniz, Sayın Yılmaz</p>
            <h2 className="text-4xl font-extrabold text-primary leading-tight">Eğitim portalı bugün <br/>sizin için hazır.</h2>
          </motion.div>
          
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-transform active:scale-95">
              <UserCheck size={20} />
              <span className="font-semibold">Yoklama Başlat</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
              <Edit3 size={20} />
              <span className="font-semibold">Not Girişi Yap</span>
            </button>
          </div>
        </div>
      </section>

      {/* Today's Lessons Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Clock className="text-secondary" size={24} />
            Günün Ders Programı
          </h3>
          <button 
            onClick={() => setIsAddingClass(true)}
            className="flex items-center gap-2 bg-surface-container-high text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
          >
            <Plus size={18} />
            Ders Ekle
          </button>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {classes.map((c, i) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[280px] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 group cursor-pointer"
            >
              <div className="h-28 relative">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-4">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{c.time}</span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-primary mb-1 truncate">{c.title}</h4>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">{c.classGroup} • {c.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weekly Attendance Graph */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <BarChart3 className="text-secondary" size={24} />
              Haftalık Katılım Grafiği
            </h3>
            <div className="text-xs text-outline font-medium uppercase tracking-widest">Son 7 Gün</div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[85, 92, 78, 95, 88, 40, 20].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full group">
                <div className="w-full bg-surface-container-high rounded-t-lg relative h-48">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                    className="absolute bottom-0 w-full bg-secondary-container rounded-t-lg transition-colors group-hover:bg-secondary"
                  />
                </div>
                <span className="text-xs font-medium text-outline">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4 bg-surface-container-low rounded-2xl p-8 flex flex-col"
        >
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <MessageSquare className="text-secondary" size={24} />
            Son Mesajlar
          </h3>
          
          <div className="space-y-4 overflow-y-auto max-h-80 pr-2 custom-scrollbar">
            {RECENT_MESSAGES.map((msg, i) => (
              <div key={msg.id} className={`p-4 bg-surface-container-lowest rounded-xl border-l-4 shadow-sm hover:translate-x-1 transition-transform ${i === 0 ? 'border-secondary' : 'border-outline-variant'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-on-surface">{msg.sender} ({msg.senderRole})</span>
                  <span className="text-[10px] text-outline">{msg.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">{msg.content}</p>
              </div>
            ))}
          </div>
          
          <button className="mt-auto pt-4 text-secondary text-sm font-bold flex items-center justify-center gap-1 hover:underline">
            Tüm Mesajları Gör
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Schedule Highlight */}
        {nextClass && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-12 bg-primary rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 text-white overflow-hidden relative"
          >
            <div className="z-10 flex-1">
              <span className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">Sıradaki Ders</span>
              <h3 className="text-3xl md:text-5xl font-black mb-2 font-headline">{nextClass.title}</h3>
              <p className="text-primary-fixed-dim text-lg mb-6">{nextClass.classGroup} • {nextClass.time} • {nextClass.location}</p>
              
              <div className="flex gap-4">
                <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all">
                  <FileText size={20} />
                  Ders Planını Aç
                </button>
                <button 
                  onClick={handleRingBell}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    isRinging 
                      ? 'bg-secondary text-white scale-105 shadow-lg shadow-secondary/40' 
                      : 'bg-white/10 border border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  <motion.div
                    animate={isRinging ? { rotate: [0, -20, 20, -20, 20, 0] } : {}}
                    transition={{ repeat: isRinging ? Infinity : 0, duration: 0.5 }}
                  >
                    {isRinging ? <BellRing size={20} /> : <Bell size={20} />}
                  </motion.div>
                  {isRinging ? 'Zil Çalıyor...' : 'Ders Zilini Çal'}
                </button>
              </div>
            </div>
            
            <div className="relative w-full md:w-1/3 aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                className="w-full h-full object-cover" 
                src={nextClass.image} 
                alt={nextClass.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
          </motion.div>
        )}
      </div>

      {/* Add Class Modal */}
      <AnimatePresence>
        {isAddingClass && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingClass(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-primary">Yeni Ders Ekle</h4>
                <button onClick={() => setIsAddingClass(false)} className="text-outline hover:text-primary transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Ders Başlığı</label>
                  <input 
                    type="text" 
                    value={newClass.title}
                    onChange={(e) => setNewClass(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Örn: Fizik: Optik"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Saat Aralığı</label>
                  <input 
                    type="text" 
                    value={newClass.time}
                    onChange={(e) => setNewClass(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Örn: 10:00 - 11:30"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Sınıf</label>
                    <input 
                      type="text" 
                      value={newClass.classGroup}
                      onChange={(e) => setNewClass(prev => ({ ...prev, classGroup: e.target.value }))}
                      className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Örn: 11-A"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Konum</label>
                    <input 
                      type="text" 
                      value={newClass.location}
                      onChange={(e) => setNewClass(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Örn: Amfi 1"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingClass(false)}
                    className="flex-1 py-3 bg-surface-container-high text-primary font-bold rounded-xl hover:bg-surface-container-highest transition-all"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
