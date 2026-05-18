import { BookOpen, MapPin, Clock, User, MoreVertical, Lock, CheckCircle, BarChart3, Bell, X, Calendar, FileText, Download, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CLASSES } from '../constants';
import { ClassSession, Role } from '../types';
import { useEffect, useState } from 'react';

interface SchedulePageProps {
  role?: Role;
  classes?: ClassSession[];
}

export default function SchedulePage({ role = 'teacher', classes = CLASSES }: SchedulePageProps) {
  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const scheduleData: Record<string, ClassSession[]> = {
    'Pazartesi': [
      { id: 'd1', title: 'Matematik', time: '08:30 - 09:10', location: 'Derslik 1', classGroup: 'Enes Hoca', status: 'next' as const, image: '' },
      { id: 'd2', title: 'Fizik', time: '09:20 - 10:00', location: 'Lab 1', classGroup: 'Ahmet Hoca', status: 'next' as const, image: '' },
      { id: 'd3', title: 'Edebiyat', time: '10:10 - 10:50', location: 'Derslik 4', classGroup: 'Selin Hoca', status: 'next' as const, image: '' },
      { id: 'd4', title: 'Yazılım (Python)', time: '11:00 - 11:40', location: 'Bilişim Lab', classGroup: 'AFD', status: 'next' as const, image: '' },
      { id: 'd5', title: 'Tarih', time: '13:30 - 14:10', location: 'Derslik 2', classGroup: 'Mehmet Hoca', status: 'next' as const, image: '' },
    ],
    'Salı': [
      { id: 's1', title: 'Biyoloji', time: '09:00 - 10:30', location: 'Laboratuvar 1', classGroup: 'Zeynep Hoca', image: '' },
      { id: 's2', title: 'Coğrafya', time: '11:00 - 12:30', location: 'Derslik 5', classGroup: 'Fatma Hoca', image: '' }
    ],
    'Çarşamba': [
      { id: 'c1', title: 'İngilizce', time: '10:00 - 11:30', location: 'Dil Lab', classGroup: 'John Doe', image: '' }
    ],
    'Perşembe': [
      { id: 'p1', title: 'Felsefe', time: '09:00 - 10:30', location: 'Derslik 12', classGroup: 'Can Hoca', image: '' }
    ],
    'Cuma': [
      { id: 'cu1', title: 'Kimya', time: '14:00 - 15:30', location: 'Lab 2', classGroup: 'Merve Hoca', image: '' }
    ]
  };

  const getLessonStatus = (timeRange: string) => {
    const [start, end] = timeRange.split(' - ');
    if (currentTime < start) return { text: '⚪ Bekliyor', active: false, done: false };
    if (currentTime >= start && currentTime <= end) return { text: '🟢 ŞİMDİ', active: true, done: false };
    return { text: '✅ Tamamlandı', active: false, done: true };
  };

  const currentClasses = scheduleData[selectedDay] || [];
  
  // Find next lesson
  const nextLesson = currentClasses.find(c => {
    const [start] = c.time.split(' - ');
    return currentTime < start;
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-secondary font-semibold tracking-widest text-xs uppercase mb-2 block">AKADEMİK TAKVİM</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter leading-tight">
              Günün Akışı ve <br/>Ders Programı
            </h2>
          </div>
          
          <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-full overflow-x-auto no-scrollbar border border-outline-variant/10">
            {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].map((day) => (
              <button 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedDay === day ? 'bg-primary text-secondary shadow-lg' : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Flow (Günün Akışı) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-primary flex items-center gap-3">
              <Calendar className="text-secondary" size={24} />
              Günün Akışı
            </h3>
            <div className="px-3 py-1 bg-surface-container rounded-lg border border-outline-variant/10 shadow-sm">
              <span className="text-xs font-bold text-secondary font-mono">{currentTime}</span>
            </div>
          </div>

          <div className="space-y-3">
            {currentClasses.length > 0 ? (
              currentClasses.map((item) => {
                const status = getLessonStatus(item.time);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedClass(item)}
                    className={`flex justify-between items-center p-5 rounded-2xl border-l-[5px] transition-all cursor-pointer group shadow-sm ${
                      status.active 
                        ? 'bg-accent/10 border-l-accent shadow-[0_0_20px_rgba(14,131,136,0.2)]' 
                        : status.done
                        ? 'bg-surface-container-low border-l-outline/20 opacity-70'
                        : 'bg-surface-container-lowest border-l-outline-variant/20 hover:border-l-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/30 group-hover:bg-secondary" />
                      <div>
                        <span className="text-secondary font-mono font-bold text-sm tracking-tighter">{item.time}</span>
                        <h4 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">{item.title}</h4>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">{item.classGroup}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        status.active ? 'bg-accent/20 text-accent' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {status.text}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-surface-container-lowest rounded-[2rem] border-2 border-dashed border-outline-variant/20">
                <p className="text-on-surface-variant font-medium">Bugün programda ders bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Announcements */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
              <Bell className="text-secondary" size={22} />
              Duyurular
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl relative overflow-hidden group hover:bg-accent/10 transition-colors">
                <div className="flex gap-3">
                  <Info className="text-accent shrink-0" size={18} />
                  <div>
                    <h5 className="text-xs font-bold text-primary mb-1">Kulüp Toplantısı</h5>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">Bugün saat 16:00'da S.O.F.T Kulübü toplantısı vardır.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/10 hover:border-secondary/20 transition-all">
                <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">Yarınki deneme sınavı giriş belgeleri portal üzerinden yayınlanmıştır.</p>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-surface-container text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-surface-container-high transition-all flex items-center justify-center gap-2">
              Tüm Duyuruları Gör
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Next Lesson Pulse */}
          <div className="bg-primary p-8 rounded-[2rem] text-secondary shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-6">SIRADAKİ DERS</h4>
            {nextLesson ? (
              <>
                <h5 className="text-3xl font-black text-white mb-2 leading-tight">{nextLesson.title}</h5>
                <div className="flex items-center gap-2 text-white/70 font-bold mb-8">
                  <Clock size={16} />
                  <span>{nextLesson.time.split(' - ')[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-black/20">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full text-white">HAZIRLANIN</span>
                </div>
              </>
            ) : (
              <p className="text-white font-bold">Bugünlük dersler bitti!</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Progress (Moved to bottom or replaced) */}
      <div className="bg-surface-container-lowest p-10 rounded-[3rem] border border-outline-variant/10 shadow-sm flex flex-col md:flex-row items-center gap-12">
        <div className="w-24 h-24 shrink-0 bg-primary-container rounded-3xl flex items-center justify-center shadow-xl rotate-3">
          <CheckCircle className="text-secondary-container" size={48} />
        </div>
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h4 className="text-2xl font-black text-primary tracking-tighter">Haftalık Akademik İlerleme</h4>
            <span className="px-4 py-1.5 bg-secondary text-primary rounded-full text-xs font-black uppercase tracking-widest shadow-sm">%84.5</span>
          </div>
          <p className="text-sm text-on-surface-variant font-medium max-w-2xl mb-6">Bu hafta toplam 12 saat derse katılım sağladın. Matematik ve Fizik konularındaki performansın hedefin üzerinde seyrediyor.</p>
          <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '84.5%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-accent h-full rounded-full shadow-[0_0_10px_rgba(51,187,197,0.4)]" 
            />
          </div>
        </div>
        <button className="px-8 py-4 bg-primary text-secondary font-black rounded-2xl text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all whitespace-nowrap">
          DETAYLI ANALİZ
        </button>
      </div>

      {/* Lesson Detail Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClass(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-md"
            />
            <motion.div 
              layoutId={selectedClass.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="h-48 relative">
                <img 
                  src={selectedClass.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'} 
                  alt={selectedClass.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedClass(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent" />
              </div>

              <div className="p-8 -mt-12 relative bg-surface-container-lowest">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-secondary text-primary text-[10px] font-black uppercase tracking-tighter rounded-full">
                    DERS BİLGİSİ
                  </span>
                  <div className="flex items-center gap-2 text-outline font-bold text-xs">
                    <Clock size={14} />
                    {selectedClass.time}
                  </div>
                </div>

                <h3 className="text-3xl font-black text-primary leading-tight mb-2">{selectedClass.title}</h3>
                <p className="text-on-surface-variant font-medium flex items-center gap-2 mb-8">
                  <MapPin size={18} className="text-secondary" />
                  {selectedClass.location} • {selectedClass.classGroup}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h5 className="font-bold text-primary flex items-center gap-2">
                       <FileText size={18} className="text-secondary" />
                       Ders İçeriği
                    </h5>
                    <ul className="space-y-3">
                      {['Konu Anlatımı', 'Pratik Sorular', 'Haftalık Ödev'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-on-surface-variant font-medium">
                          <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h5 className="font-bold text-primary flex items-center gap-2">
                       <Calendar size={18} className="text-secondary" />
                       Önemli Tarihler
                    </h5>
                    <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                      <p className="text-xs font-bold text-primary">Konu Sonu Testi</p>
                      <p className="text-[10px] text-on-surface-variant">24 Nisan Cuma</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-primary text-secondary font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    <Download size={18} />
                    Materyali İndir
                  </button>
                  {role === 'teacher' && (
                    <button className="flex-1 py-4 bg-surface-container-high text-primary font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                      <BookOpen size={18} />
                      Dersi Başlat
                    </button>
                  )}
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
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className="fixed top-8 right-8 z-[200] bg-primary text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl"
          >
            <CheckCircle2 className="text-secondary" size={24} />
            <span className="font-bold">Etkinlik başarıyla takviminize eklendi!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
