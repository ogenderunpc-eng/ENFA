import React, { useState, useEffect } from 'react';
import { Bell, Star, TrendingUp, MessageSquare, Calendar, ArrowRight, BookOpen, BarChart3, CheckCircle2, UserPlus, FileText, Activity, Megaphone, Download, Send, Loader2, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GRADE_UPDATES, TEACHER_COMMENTS } from '../constants';
import { Student, ClassSession, Message, Homework, Announcement, Exam, ExamResult, CalendarEvent } from '../types';
import { notificationService } from '../services/notificationService';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, where, doc, setDoc, getDoc, orderBy } from 'firebase/firestore';

interface ParentDashboardProps {
  announcements?: Announcement[];
  classes?: ClassSession[];
  messages: Message[];
  userName: string;
  onNavigate?: (tab: string) => void;
  students?: Student[];
  activeTab?: string;
}

export default function ParentDashboard({ onNavigate, announcements = [], messages, userName, classes = [], students = [], activeTab = 'home' }: ParentDashboardProps) {
  const [activePanel, setActivePanel] = useState<'home' | 'exams' | 'calendar'>('home');
  const [showNotification, setShowNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [studentResults, setStudentResults] = useState<Record<string, ExamResult>>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [opticalData, setOpticalData] = useState<Record<string, { d: number; y: number; b: number }>>({});
  
  // Real child data (assuming first student for demo context)
  const child = students.find(s => s.name === userName) || students[0] || null;

  useEffect(() => {
    const q = query(collection(db, 'homework'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHomeworkList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Homework)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homework');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch Exams
    const qExams = query(collection(db, 'sinavlar'), orderBy('createdAt', 'desc'));
    const unsubExams = onSnapshot(qExams, (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sinavlar');
    });

    // Fetch Calendar Events
    const qEvents = query(collection(db, 'takvim_etkinlikleri'), orderBy('tarih', 'asc'));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      setCalendarEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'takvim_etkinlikleri');
    });

    // Fetch Student Results if student is identified
    let unsubResults = () => {};
    if (child) {
      const qResults = query(collection(db, 'talebe_sonuclari'), where('talebe_isim', '==', child.name));
      unsubResults = onSnapshot(qResults, (snapshot) => {
        const results: Record<string, ExamResult> = {};
        snapshot.forEach(doc => {
          const data = doc.data() as ExamResult;
          results[data.sinav_id] = { id: doc.id, ...data };
        });
        setStudentResults(results);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'talebe_sonuclari');
      });
    }

    return () => {
      unsubExams();
      unsubEvents();
      unsubResults();
    };
  }, [child]);

  const handleDownloadPDF = (exam: Exam) => {
    try {
      const byteCharacters = atob(exam.pdf_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exam.sinav_adi}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download failed:", error);
      setToastMessage("PDF indirilemedi. Lütfen tekrar deneyin.");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleSaveResult = async (exam: Exam) => {
    const data = (opticalData && exam && opticalData[exam.id]) || { d: 0, y: 0, b: exam?.toplam_soru || 0 };
    if (exam && data.d + data.y + data.b !== exam.toplam_soru) {
      setToastMessage(`Toplam soru hatası! Test toplam ${exam.toplam_soru} soru olmalı.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    if (!exam) return;

    setIsSubmitting(exam.id);
    try {
      if (!child || !child.name) {
        throw new Error("Talebe bilgisi bulunamadı. Lütfen giriş yaptığınızdan emin olun.");
      }
      const net = data.d - (data.y * 0.25);
      const resultData = {
        sinav_id: exam.id,
        talebe_isim: child.name,
        talebe_id: child.id,
        dogru: data.d,
        yanlis: data.y,
        bos: data.b,
        net: net,
        createdAt: new Date().toISOString()
      };

      const docId = `${exam.id}_${child.name.replace(/\s+/g, '_')}`;
      await setDoc(doc(db, 'talebe_sonuclari', docId), resultData);
      
      setToastMessage('Sonucun başarıyla kaydedildi! 🚀');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'talebe_sonuclari');
    } finally {
      setIsSubmitting(null);
    }
  };

  useEffect(() => {
    if (!child || !auth.currentUser) return;

    // 1. Check for upcoming exams
    const upcomingExam = classes?.find(c => (c.title.includes('Sınav') || c.title.includes('KTS')) && c.status === 'next');
    if (upcomingExam) {
       const notifiedKey = `notified_exam_${upcomingExam.id}`;
       if (!sessionStorage.getItem(notifiedKey)) {
         notificationService.createNotification({
           userId: auth.currentUser.uid,
           title: "Yaklaşan Sınav 📝",
           content: `${upcomingExam.title} dersi yaklaşıyor. Hazırlanmayı unutmayın!`,
           type: 'exam',
           link: 'home'
         });
         sessionStorage.setItem(notifiedKey, 'true');
       }
    }

    // 2. Check for performance changes
    if (child.grades && child.grades.length > 0) {
      const lastGrade = child.grades[child.grades.length - 1];
      if (lastGrade.value >= 90) {
        const notifiedKey = `notified_perf_${lastGrade.subject}_${lastGrade.value}`;
        if (!sessionStorage.getItem(notifiedKey)) {
          notificationService.createNotification({
            userId: auth.currentUser.uid,
            title: "Yüksek Başarı! 🌟",
            content: `${child.name}, ${lastGrade.subject} dersinden ${lastGrade.value} alarak muazzam bir başarı gösterdi!`,
            type: 'performance',
            link: 'kts'
          });
          sessionStorage.setItem(notifiedKey, 'true');
        }
      }
    }
  }, [child, classes]);
  
  const realGrades = child?.grades || [];
  const avgGrade = realGrades.length > 0 
    ? Math.round(realGrades.reduce((acc, curr) => acc + curr.value, 0) / realGrades.length) 
    : 0;
  
  const [activities] = useState([
    { id: 1, type: 'attendance', title: 'Yoklama Girişi', description: `${child?.name || 'Öğrenci'} bugün Matematik dersine katıldı.`, time: '09:15', icon: <UserPlus className="text-green-500" size={18} /> },
    { id: 2, type: 'grade', title: 'Yeni Not Girildi', description: `Fizik laboratuvar raporu: 95/100`, time: '11:30', icon: <TrendingUp className="text-secondary" size={18} /> },
    { id: 3, type: 'material', title: 'Ders Materyali', description: 'Biyoloji: Hücre Bölünmesi dökümanı paylaşıldı.', time: '13:45', icon: <BookOpen className="text-primary" size={18} /> },
    { id: 4, type: 'behavior', title: 'Öğretmen Notu', description: `${child?.name || 'Öğrenci'} grup çalışmasında liderlik gösterdi.`, time: '15:20', icon: <Star className="text-orange-400" size={18} fill="currentColor" /> },
  ]);

  const chartData = realGrades.map(g => ({
    label: g.subject.substring(0, 4).toUpperCase(),
    value: g.value,
    target: 85
  }));

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
      >
        <div>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Talebe Portalı</h2>
          <p className="text-on-surface-variant font-bold uppercase tracking-[0.2em] text-xs opacity-70">
            {child ? `Hoş geldin ${userName}. Eğitim yolculuğun burada şekilleniyor.` : `Hoş geldin ${userName}. Talebe verileri yükleniyor...`}
          </p>
        </div>

        <div className="flex bg-[#1A1C23] p-1.5 rounded-2xl border border-[#2D2E33] shadow-lg">
          <button 
            onClick={() => setActivePanel('home')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activePanel === 'home' ? 'bg-secondary text-primary' : 'text-white/40 hover:text-white'}`}
          >
            🏠 Portal Ana Sayfa
          </button>
          <button 
            onClick={() => setActivePanel('exams')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activePanel === 'exams' ? 'bg-secondary text-primary' : 'text-white/40 hover:text-white'}`}
          >
            🎯 Sınıf Testleri & PDF Odası
          </button>
          <button 
            onClick={() => setActivePanel('calendar')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activePanel === 'calendar' ? 'bg-secondary text-primary' : 'text-white/40 hover:text-white'}`}
          >
            📅 Sınav Takvimi
          </button>
        </div>
      </motion.section>

      {activePanel === 'home' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="home-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {/* Talebe Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="info-card text-center">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Akademik Notun</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-secondary">{avgGrade}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${avgGrade >= 85 ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
              {avgGrade >= 85 ? 'Pekiyi' : 'İyi'}
            </span>
          </div>
        </div>
        <div className="info-card text-center">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Toplam Devamsızlık</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-secondary">2</span>
            <span className="text-xs font-bold text-primary bg-secondary/10 px-2 py-0.5 rounded-full">Gün</span>
          </div>
        </div>
        <div className="info-card text-center">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Bugünkü Yoklama</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-secondary">{child?.status === 'present' ? 'Geldi' : child?.status === 'absent' ? 'Gelmedi' : 'Bekliyor'}</span>
            <span className={`w-3 h-3 rounded-full animate-pulse ${child?.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Haftalık Başarı Grafiği */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10"
        >
          <h3 className="text-xl font-bold text-primary mb-8">Haftalık Başarı Grafiği</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[20, 35, 30, 58, 75, 94].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full group">
                <div className="w-full bg-accent/5 rounded-t-lg relative h-48 overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className="absolute bottom-0 w-full bg-accent/30 rounded-t-lg transition-colors group-hover:bg-accent"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    className="absolute inset-0 bg-accent"
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
          className="lg:col-span-1 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10"
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
                    className="h-full bg-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Talebe Kimlik Kartı (Student ID Card) */}
      {child && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1A1C23] p-8 rounded-3xl border border-[#2D2E33] shadow-2xl flex flex-col items-center mb-10 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary opacity-50" />
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-6 opacity-80">Talebe Kimlik Kartı</h3>
          
          <motion.div 
            className="relative mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-32 h-32 rounded-full border-4 border-secondary overflow-hidden shadow-2xl shadow-secondary/20 bg-[#0E1117]">
              <img 
                src={child.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`} 
                alt={child.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-2 -right-2 bg-secondary text-primary p-2 rounded-full shadow-lg"
            >
              <Star size={16} fill="currentColor" />
            </motion.div>
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2">{child.name}</h2>
          <div className="flex gap-3">
            <span className="px-4 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
              No: {child.number}
            </span>
            <span className="px-4 py-1 bg-[#2a2d37] text-white/60 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Sınıf: {child.class || 'Belirtilmedi'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Günün Akışı Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mb-12"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Calendar className="text-secondary" size={24} />
            <h3 className="text-2xl font-bold text-primary">Günün Ders Akışı</h3>
          </div>
          <span className="text-[10px] font-black text-outline uppercase tracking-widest bg-surface-container px-3 py-1 rounded-lg">
            Canlı Takip
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { saat: "08:30 - 09:10", ders: "Matematik" },
            { saat: "09:20 - 10:00", ders: "Fizik" },
            { saat: "11:00 - 11:40", ders: "Yazılım (Python)" },
            { saat: "13:30 - 14:10", ders: "Tarih" },
          ].map((d, i) => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const [start, end] = d.saat.split(" - ");
            const isActive = currentTime >= start && currentTime <= end;
            const isFinished = currentTime > end;
            const status = isActive ? "🟢 ŞİMDİ" : (isFinished ? "✅ Bitti" : "⚪ Bekliyor");

            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className={`flex flex-col p-5 rounded-2xl border-l-[6px] transition-all shadow-xl group ${
                  isActive 
                    ? "bg-[#1E2A2B] border-l-secondary shadow-secondary/10" 
                    : "bg-[#1A1C23] border-l-[#2D2E33] opacity-80"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-sm font-black tracking-tight ${isActive ? 'text-secondary' : 'text-[#888]'}`}>{d.saat}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-secondary/20 text-secondary' : 'text-[#888]'}`}>
                    {status}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-4 group-hover:text-secondary transition-colors">{d.ders}</h4>
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-secondary animate-pulse' : 'bg-[#2D2E33]'}`} />
                  <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Ders Durumu</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <Megaphone className="text-secondary" size={24} />
            <h3 className="text-2xl font-bold text-primary">Güncel Duyurular</h3>
          </div>
          <div className="flex flex-col gap-4">
            {announcements.map((ann) => (
              <motion.div 
                key={ann.id}
                whileHover={{ x: 4 }}
                className="bg-[#1A1C23] p-6 rounded-2xl border-r-[6px] border-r-secondary border border-[#2D2E33] shadow-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors" />
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-secondary">{ann.title}</h4>
                  <span className="text-[11px] text-[#888] font-bold bg-[#0E1117] px-3 py-1 rounded-full">{ann.date}</span>
                </div>
                <p className="text-sm text-white/80 font-medium leading-relaxed">{ann.content}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

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
            <div key={activity.id} className="info-card flex items-start gap-4">
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
          <div className="flex items-center gap-6 p-6 bg-accent/5 rounded-2xl group hover:bg-accent/10 transition-colors border border-accent/10">
            <div className="w-14 h-14 flex-shrink-0 bg-accent/10 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <BookOpen className="text-accent" size={28} />
            </div>
            <div className="flex-grow">
              <h5 className="font-bold text-primary text-lg">Ödev Takibi</h5>
              <p className="text-sm text-on-surface-variant font-medium">Bu hafta tamamlanması gereken {homeworkList.length} ödev var.</p>
            </div>
            <button 
              onClick={() => onNavigate?.('homework')}
              className="px-5 py-2 bg-accent text-white rounded-lg font-bold text-sm shadow-lg shadow-accent/20 hover:opacity-90 transition-all text-nowrap"
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
              className="px-5 py-2 bg-accent text-white rounded-lg font-bold text-sm shadow-lg shadow-accent/20 hover:opacity-90 transition-all text-nowrap"
            >
              Raporu Al
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  </AnimatePresence>
) : activePanel === 'calendar' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="calendar-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* ⚡ CANLI BİLDİRİM MANTIĞI */}
            {(() => {
              const bugun = new Date().toISOString().split('T')[0];
              const todaysExams = calendarEvents.filter(e => e.tarih === bugun);
              
              return (
                <div className="space-y-4">
                  {todaysExams.length > 0 ? (
                    todaysExams.map(e => (
                      <motion.div 
                        key={`alert-${e.id}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#2D2318] border-2 border-[#E1AD01] rounded-[10px] p-[15px] animate-pulse"
                      >
                        <h4 className="text-[#E1AD01] m-0 mb-1 font-[900]">⚠️ BUGÜN SINAVINIZ VAR!</h4>
                        <p className="m-0">
                          <span className="text-white font-bold">{e.etkinlik_adi}</span>{" "}
                          <span className="text-[#888] text-[13px]">({e.tur}) sınavı bugün uygulanacaktır. Başarılar dileriz cano!</span>
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tight mb-2">🗓️ Sınav Takvimi & Planlayıcı</h3>
                      <p className="text-sm text-white/40 font-bold uppercase tracking-widest leading-loose">
                        Gelecek günlerde yapılacak olan sınav ve deneme akışları cano.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="h-px bg-white/5 my-6" />

            <div className="flex flex-col gap-3">
              {calendarEvents.map(event => {
                const dateParts = event.tarih.split('-');
                const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
                
                // badge-yazili is the default blue one
                let badgeClass = "bg-[#16222F] text-[#4299E1] border-[#4299E1]";
                if (event.tur === 'Deneme') badgeClass = "bg-[#1E2A2B] text-[#0E8388] border-[#0E8388]";
                if (event.tur === 'Okul') badgeClass = "bg-[#2D2318] text-[#E1AD01] border-[#E1AD01]";

                return (
                  <motion.div 
                    key={event.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex justify-between items-center px-[20px] py-[16px] bg-[#141722] border border-[#222634] rounded-[8px] mb-[12px]"
                  >
                    <div>
                      <span className="text-white font-bold text-[16px] tracking-[0.5px] block mb-1">{event.etkinlik_adi}</span>
                      <span className="text-[#888] text-[13px] font-medium flex items-center gap-1.5">
                        📅 Tarih: {formattedDate}
                      </span>
                    </div>
                    <div className={`px-[10px] py-[4px] rounded-[6px] text-[12px] font-bold border ${badgeClass}`}>
                      {event.tur}
                    </div>
                  </motion.div>
                );
              })}

              {calendarEvents.length === 0 && (
                <div className="bg-[#1A1C23] p-16 rounded-[2rem] border border-[#2D2E33] text-center">
                  <p className="text-xl font-bold text-white/40 uppercase tracking-widest italic flex items-center justify-center gap-3">
                    <Clock className="opacity-20" />
                    Yaklaşan herhangi bir sınav kaydı bulunmuyor.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="exams-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-2">Sınıf Testleri & PDF Odası</h3>
              <p className="text-sm text-white/40 font-bold uppercase tracking-widest leading-loose">
                Öğretmenlerinizin yüklediği testleri indirin, çözün ve optik sonuçlarınızı girin cano.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {exams.map(exam => {
                const result = studentResults[exam.id];
                const optik = opticalData[exam.id] || { 
                  d: result?.dogru || 0, 
                  y: result?.yanlis || 0, 
                  b: result?.bos || exam.toplam_soru 
                };

                return (
                  <div key={exam.id} className="bg-[#1A1C23] border border-[#2D2E33] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-[#0E1117] rounded-[1.5rem] flex items-center justify-center border border-white/5 group-hover:border-secondary/20 transition-all">
                          <FileText size={32} className="text-secondary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-2xl font-black text-white">{exam.sinav_adi}</h4>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-[9px] font-black uppercase tracking-widest">{exam.ders}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs font-bold text-[#666] flex items-center gap-2"><Clock size={14} /> {exam.tarih}</span>
                            <span className="text-xs font-bold text-[#666] flex items-center gap-2"><BookOpen size={14} /> {exam.toplam_soru} Soru</span>
                          </div>
                        </div>
                      </div>

                      {result && (
                        <div className="flex items-center gap-8 px-8 py-4 bg-[#0E1117] rounded-3xl border border-white/5">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Doğru</p>
                            <span className="text-xl font-black text-white">{result.dogru}</span>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Yanlış</p>
                            <span className="text-xl font-black text-white">{result.yanlis}</span>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black text-[#666] uppercase tracking-widest mb-1">Boş</p>
                            <span className="text-xl font-black text-white">{result.bos}</span>
                          </div>
                          <div className="text-center pl-6 border-l border-white/5">
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Net</p>
                            <span className="text-2xl font-black text-secondary">{result.net.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleDownloadPDF(exam)}
                          className="p-4 bg-[#0E1117] text-white/60 hover:text-secondary hover:bg-secondary/5 rounded-2xl border border-white/5 transition-all flex items-center gap-3"
                          title="PDF İndir"
                        >
                          <Download size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">PDF İndir</span>
                        </button>

                        <button 
                          onClick={() => {
                            const details = document.getElementById(`optik-${exam.id}`);
                            details?.classList.toggle('hidden');
                          }}
                          className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${result ? 'bg-[#0E1117] text-white/40 border border-white/5' : 'bg-secondary text-primary shadow-lg shadow-secondary/10'}`}
                        >
                          {result ? 'Sonucu Düzenle' : 'Optik Giriş Yap'}
                        </button>
                      </div>
                    </div>

                    {/* Optical Entry Form */}
                    <div id={`optik-${exam.id}`} className="hidden mt-8 pt-8 border-t border-[#2D2E33]">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div>
                          <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-70">Doğru Sayısı</label>
                          <input 
                            type="number"
                            min="0"
                            max={exam.toplam_soru}
                            value={optik.d}
                            onChange={(e) => setOpticalData(prev => ({ ...prev, [exam.id]: { ...optik, d: Number(e.target.value) } }))}
                            className="w-full px-5 py-4 bg-[#0E1117] rounded-xl border border-[#2D2E33] text-white font-bold text-sm outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-70">Yanlış Sayısı</label>
                          <input 
                            type="number"
                            min="0"
                            max={exam.toplam_soru}
                            value={optik.y}
                            onChange={(e) => setOpticalData(prev => ({ ...prev, [exam.id]: { ...optik, y: Number(e.target.value) } }))}
                            className="w-full px-5 py-4 bg-[#0E1117] rounded-xl border border-[#2D2E33] text-white font-bold text-sm outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-70">Boş Sayısı</label>
                          <input 
                            type="number"
                            min="0"
                            max={exam.toplam_soru}
                            value={optik.b}
                            onChange={(e) => setOpticalData(prev => ({ ...prev, [exam.id]: { ...optik, b: Number(e.target.value) } }))}
                            className="w-full px-5 py-4 bg-[#0E1117] rounded-xl border border-[#2D2E33] text-white font-bold text-sm outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                        <button 
                          onClick={() => handleSaveResult(exam)}
                          disabled={isSubmitting === exam.id}
                          className="py-4 bg-secondary text-primary font-black rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                        >
                          {isSubmitting === exam.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {result ? 'GÜNCELLE' : 'KAYDET'}
                        </button>
                      </div>
                      <p className="mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">
                        Toplam {optik.d + optik.y + optik.b} / {exam.toplam_soru} soru girildi. (1 Yanlış = 0.25 Net götürür)
                      </p>
                    </div>
                  </div>
                );
              })}

              {exams.length === 0 && (
                <div className="bg-[#1A1C23] p-20 rounded-[3rem] border border-[#2D2E33] text-center">
                  <BookOpen size={64} className="mx-auto text-white/5 mb-6" />
                  <p className="text-xl font-bold text-white/40 uppercase tracking-widest">Henüz yayında bir sınav bulunmuyor</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className="fixed top-8 right-8 z-[200] bg-primary text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl"
          >
            <CheckCircle2 className="text-secondary" size={24} />
            <span className="font-bold">{toastMessage || 'Etkinlik başarıyla takviminize eklendi!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
