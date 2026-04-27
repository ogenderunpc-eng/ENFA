import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Edit3, BarChart3, MessageSquare, ArrowRight, FileText, Clock, Plus, X, Bell, BellRing, BookOpen, CheckCircle2, Loader2, Sparkles, Send, ShieldCheck, UserMinus, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ClassSession, Student } from '../types';

interface TeacherDashboardProps {
  classes: ClassSession[];
  messages: Message[];
  students: Student[];
  setClasses: (classes: ClassSession[] | ((prev: ClassSession[]) => ClassSession[])) => void;
  onNavigate?: (tab: string) => void;
}

export default function TeacherDashboard({ classes, messages, students, setClasses, onNavigate }: TeacherDashboardProps) {
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isViewingReport, setIsViewingReport] = useState(false);
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [aiReportContent, setAiReportContent] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [newClass, setNewClass] = useState({ title: '', time: '', location: '', classGroup: '' });
  const [isRinging, setIsRinging] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize attendance with everyone present by default
    const initial = {};
    students.forEach(s => {
      // @ts-ignore
      initial[s.id] = true;
    });
    setAttendance(initial);
  }, [students]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generateAIReport = () => {
    setIsGeneratingAIReport(true);
    setAiReportContent('');
    
    const text = "Bugünkü matematik dersinde öğrencilerin türev ve integral arasındaki ilişkiyi kavrama oranı oldukça yüksekti. Özellikle Ali ve Zeynep'in aktif katılımı dikkat çekti. Sınıfın %85'i verilen pratik problemleri başarıyla tamamladı. Gelecek ders için karmaşık sayılara giriş yapılması planlanmaktadır.";
    
    let i = 0;
    const interval = setInterval(() => {
      setAiReportContent(prev => prev + text[i]);
      i++;
      if (i === text.length) {
        clearInterval(interval);
        setIsGeneratingAIReport(false);
      }
    }, 30);
  };

  const nextClass = classes.find(c => c.status === 'next') || classes[0];

  const handleRingBell = () => {
    if (isRinging || isAudioLoading) {
      if (isRinging) {
        // Allow stopping if already playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsRinging(false);
      }
      return;
    }
    
    setIsAudioLoading(true);
    
    // Using the local server proxy to bypass CORS and network restrictions
    const audio = new Audio();
    audio.src = '/api/bell-proxy';
    audio.preload = "auto";
    audioRef.current = audio;

    const playAudio = () => {
      setIsAudioLoading(false);
      setIsRinging(true);
      audio.play().catch(e => {
        console.error('Ses çalma başlatılamadı:', e);
        // Final desperate fallback if even the local proxy fails (user interaction might be lost)
        setIsRinging(false);
      });
    };

    audio.oncanplaythrough = () => {
      if (isAudioLoading) playAudio();
    };

    audio.onerror = (e) => {
      console.warn('Proxy kaynak hatası:', e);
      setIsAudioLoading(false);
      setIsRinging(false);
    };

    // If it takes too long to load, try to play anyway
    setTimeout(() => {
      if (isAudioLoading) playAudio();
    }, 3000);

    // Auto-stop after 20 seconds
    setTimeout(() => {
      if (audioRef.current === audio) {
        setIsRinging(false);
        audio.pause();
      }
    }, 20000);
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
            <button 
              onClick={() => setSelectedClass(classes.find(c => c.status === 'ongoing') || classes.find(c => c.status === 'next') || classes[0])}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-transform active:scale-95"
            >
              <FileText size={20} />
              <span className="font-semibold">Ders Planını Aç</span>
            </button>
            <button 
              onClick={() => onNavigate?.('portal')}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
            >
              <Edit3 size={20} />
              <span className="font-semibold">Not Girişi Yap</span>
            </button>
            <button 
              onClick={() => {
                setIsViewingReport(true);
                generateAIReport();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-secondary border border-secondary rounded-xl shadow-sm hover:bg-secondary/5 transition-all active:scale-95"
            >
              <Sparkles size={20} className="text-secondary" />
              <span className="font-semibold">Hızlı Rapor Oluştur</span>
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
              onClick={() => setSelectedClass(c)}
              className="min-w-[280px] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 group cursor-pointer hover:shadow-md transition-shadow"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <BarChart3 className="text-secondary" size={24} />
              Ders Bazlı Performans & Gelişim
            </h3>
            <button className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">
              Detaylı Analizi Gör
            </button>
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
            {messages.slice(0, 5).map((msg, i) => (
              <div key={msg.id} className={`p-4 bg-surface-container-lowest rounded-xl border-l-4 shadow-sm hover:translate-x-1 transition-transform ${i === 0 ? 'border-secondary' : 'border-outline-variant'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-on-surface">{msg.sender} ({msg.senderRole})</span>
                  <span className="text-[10px] text-outline">{msg.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">{msg.content}</p>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => onNavigate?.('messages')}
            className="mt-auto pt-4 text-secondary text-sm font-bold flex items-center justify-center gap-1 hover:underline border-none bg-transparent"
          >
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
                <button 
                  onClick={() => setSelectedClass(nextClass)}
                  className="bg-white text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all"
                >
                  <FileText size={20} />
                  Ders Planını Aç
                </button>
                <button 
                  onClick={handleRingBell}
                  disabled={isAudioLoading}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all relative overflow-hidden ${
                    isRinging 
                      ? 'bg-secondary text-white scale-105 shadow-lg shadow-secondary/40 ring-4 ring-secondary/20' 
                      : isAudioLoading
                      ? 'bg-white/20 text-white cursor-wait'
                      : 'bg-white/10 border border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  {(isRinging || isAudioLoading) && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-white/30 rounded-full"
                    />
                  )}
                  <motion.div
                    animate={isRinging ? { 
                      rotate: [-25, 25, -25, 25, 0],
                      scale: [1, 1.2, 1.2, 1, 1],
                    } : isAudioLoading ? {
                      rotate: 360
                    } : {}}
                    transition={isAudioLoading ? {
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear"
                    } : { 
                      repeat: isRinging ? Infinity : 0, 
                      duration: 0.6,
                      ease: "easeInOut"
                    }}
                  >
                    {isRinging ? <BellRing size={20} /> : isAudioLoading ? <Loader2 className="animate-spin" size={20} /> : <Bell size={20} />}
                  </motion.div>
                  {isRinging ? 'Zil Çalıyor...' : isAudioLoading ? 'Yükleniyor...' : 'Ders Zilini Çal'}
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

      {/* Daily Summary Action Cards */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
          <BookOpen className="text-secondary" size={24} />
          Günün Özeti & Görevler
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <FileText size={24} />
            </div>
            <div>
              <h5 className="font-bold text-primary mb-1">Ders Materyalleri</h5>
              <p className="text-xs text-on-surface-variant">Bugün için 3 yeni döküman eklendi.</p>
            </div>
            <button 
              onClick={() => setSelectedClass(classes[0])}
              className="mt-auto bg-white/50 px-4 py-2 rounded-lg text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all self-start"
            >
              Görüntüle
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <Clock size={24} />
            </div>
            <div>
              <h5 className="font-bold text-primary mb-1">Hatırlatıcılar</h5>
              <p className="text-xs text-on-surface-variant">Veli toplantısı için hazırlık yap.</p>
            </div>
            <button 
              onClick={() => {
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
              }}
              className="mt-auto bg-white/50 px-4 py-2 rounded-lg text-secondary text-xs font-bold hover:bg-secondary hover:text-white transition-all self-start"
            >
              Takvime Ekle
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
              <Edit3 size={24} />
            </div>
            <div>
              <h5 className="font-bold text-primary mb-1">Eksik Notlar</h5>
              <p className="text-xs text-on-surface-variant">12-A sınıfı için performans notu girilmedi.</p>
            </div>
            <button 
              onClick={() => onNavigate?.('portal')}
              className="mt-auto text-orange-500 text-xs font-bold hover:underline self-start"
            >
              Hemen Gir
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h5 className="font-bold text-primary mb-1">Tamamlananlar</h5>
              <p className="text-xs text-on-surface-variant">Bugünkü 4 dersten 2'si tamamlandı.</p>
            </div>
            <div className="mt-auto h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[50%]"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Attendance Modal */}
      <AnimatePresence>
        {isTakingAttendance && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTakingAttendance(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-2xl font-black text-primary">Yoklama Al</h4>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{selectedClass?.title || 'Ders Seçilmedi'}</p>
                </div>
                <button onClick={() => setIsTakingAttendance(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${attendance[student.id] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/10">
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{student.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Öğrenci No: #102{student.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleAttendance(student.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${attendance[student.id] ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-red-500 text-white shadow-lg shadow-red-200'}`}
                    >
                      {attendance[student.id] ? <UserPlus size={20} /> : <UserMinus size={20} />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/10">
                <button 
                  onClick={() => {
                    setIsTakingAttendance(false);
                    setToastMessage('Yoklama başarıyla kaydedildi.');
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 3000);
                  }}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={20} />
                  YOKLAMAYI KAYDET
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lesson Plan Report Modal */}
      <AnimatePresence>
        {isViewingReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewingReport(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-primary">Akıllı Eğitim Raporu</h4>
                    <p className="text-on-surface-variant font-bold mt-1 text-sm uppercase tracking-widest">AI Destekli Günlük Analiz • {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <button onClick={() => setIsViewingReport(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                       <Sparkles className="text-secondary/20" size={64} />
                    </div>
                    <h5 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Üretilen Özet</h5>
                    <div className="text-lg text-primary leading-relaxed font-medium min-h-[150px]">
                      {aiReportContent}
                      {isGeneratingAIReport && <span className="inline-block w-2 h-6 bg-secondary ml-1 animate-pulse" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-outline-variant/10 p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                          <UserPlus size={18} />
                        </div>
                        <span className="text-sm font-bold text-primary">Katılım Oranı</span>
                      </div>
                      <p className="text-3xl font-black text-primary">%94</p>
                      <p className="text-xs text-on-surface-variant mt-1">Önceki güne göre +2%</p>
                    </div>
                    <div className="bg-white border border-outline-variant/10 p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
                          <BarChart3 size={18} />
                        </div>
                        <span className="text-sm font-bold text-primary">Anlaşılma Oranı</span>
                      </div>
                      <p className="text-3xl font-black text-primary">%88</p>
                      <p className="text-xs text-on-surface-variant mt-1">Haftalık ortalamanın üzerinde</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-primary text-white p-6 rounded-3xl">
                      <h5 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-80">Alınması Gereken Aksiyonlar</h5>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold">1</span>
                          </div>
                          <p className="text-xs leading-relaxed">Veli mesajlarına yanıt ver (3 beklemede)</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold">2</span>
                          </div>
                          <p className="text-xs leading-relaxed">Yarınki laboratuvar deneyi için malzemeleri kontrol et.</p>
                        </div>
                      </div>
                   </div>

                   <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10">
                      <h5 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Sınıf Dosyaları</h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-outline-variant/10">
                          <FileText className="text-secondary" size={18} />
                          <span className="text-[10px] font-bold text-primary truncate">Ders_Plani_Mat.pdf</span>
                        </div>
                        <button className="w-full py-3 bg-surface-container text-primary text-[10px] font-black rounded-xl hover:bg-surface-container-high transition-colors">
                           TÜM DOSYALARI GÖR
                        </button>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Clock size={16} />
                  <span className="text-xs font-medium">Son güncelleme: Az önce</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button className="flex-1 px-6 py-3 bg-surface-container-high text-primary font-bold rounded-xl hover:bg-slate-200 transition-all text-xs text-nowrap">PDF İndir</button>
                  <button className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-xs flex items-center justify-center gap-2 text-nowrap">
                    <Send size={16} /> Velilerle Paylaş
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Class Modal (unchanged but keeping structure) */}
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

      {/* Class Detail & Lesson Plan Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClass(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-1">{selectedClass.time}</span>
                  <h4 className="text-3xl font-black text-primary leading-tight">{selectedClass.title}</h4>
                  <p className="text-on-surface-variant font-bold mt-1">{selectedClass.classGroup} • {selectedClass.location}</p>
                </div>
                <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText size={14} className="text-secondary" />
                      Ders Planı
                    </h5>
                    <ul className="text-sm text-on-surface-variant space-y-2 list-disc list-inside">
                      <li>Konu Girişi ve Temel Kavramlar</li>
                      <li>Örnek Problem Çözümleri</li>
                      <li>Etkileşimli Soru-Cevap</li>
                      <li>Haftalık Ödev Dağıtımı</li>
                    </ul>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Clock size={14} className="text-secondary" />
                      Önemli Tarihler
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">Vize Sınavı</span>
                        <span className="font-bold text-primary underline">12 Mayıs</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">Proje Teslimi</span>
                        <span className="font-bold text-primary underline">25 Mayıs</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden shadow-inner border border-outline-variant/20">
                  <img src={selectedClass.image} alt={selectedClass.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Materyal Ekle
                  </button>
                  <button 
                    onClick={() => setIsTakingAttendance(true)}
                    className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl shadow-lg shadow-secondary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck size={18} />
                    Yoklama Al
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
