import React, { useState, useEffect } from 'react';
import { Bell, Star, TrendingUp, MessageSquare, Calendar, ArrowRight, BookOpen, BarChart3, CheckCircle2, UserPlus, FileText, Activity, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GRADE_UPDATES, TEACHER_COMMENTS } from '../constants';
import { Student, ClassSession, Message, Homework, Announcement } from '../types';
import { notificationService } from '../services/notificationService';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

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
  const [showNotification, setShowNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  
  // Real child data (assuming first student for demo context)
  const child = students.find(s => s.name === userName) || students[0];

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">📊 Talebe Paneli / {activeTab === 'kts' ? 'Notlarım' : activeTab === 'schedule' ? 'İstatistikler' : 'Ana Sayfa'}</h2>
        <p className="text-on-surface-variant font-medium">Hoş Geldiniz, {userName}. {child?.name || 'Evladınızın'} akademik durumu aşağıdadır.</p>
      </motion.section>

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

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="text-secondary" size={24} />
            <h3 className="text-2xl font-bold text-primary">Güncel Duyurular</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <motion.div 
                key={ann.id}
                whileHover={{ y: -2 }}
                className="bg-surface-container-low p-5 rounded-2xl border-l-4 border-l-secondary border-t border-r border-b border-outline-variant/10 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-primary">{ann.title}</h4>
                  <span className="text-[10px] font-black text-outline uppercase tracking-widest">{ann.date}</span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{ann.content}</p>
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
