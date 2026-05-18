import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Edit3, BarChart3, MessageSquare, ArrowRight, FileText, Clock, Plus, X, Bell, BellRing, BookOpen, CheckCircle2, Loader2, Sparkles, Send, ShieldCheck, UserMinus, UserPlus, Users, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ClassSession, Student, Announcement, Exam, ExamResult, CalendarEvent } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, deleteDoc, doc, writeBatch, onSnapshot, setDoc, limit } from 'firebase/firestore';
import StudentCard from '../components/StudentCard';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  classId: string;
}

interface TeacherDashboardProps {
  announcements: Announcement[];
  classes: ClassSession[];
  messages: Message[];
  students: Student[];
  setClasses: (classes: ClassSession[] | ((prev: ClassSession[]) => ClassSession[])) => void;
  onNavigate?: (tab: string) => void;
  activeTab?: string;
}

interface ExamResultCardProps {
  exam: Exam;
  key?: string;
}

function ExamResultCard({ exam }: ExamResultCardProps) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      const q = query(collection(db, 'talebe_sonuclari'), where('sinav_id', '==', exam.id), orderBy('net', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const resultsList: ExamResult[] = [];
        snapshot.forEach(doc => {
          resultsList.push({ id: doc.id, ...doc.data() } as ExamResult);
        });
        setResults(resultsList);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'talebe_sonuclari');
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isExpanded, exam.id]);

  return (
    <div className="bg-[#1A1C23] border border-[#2D2E33] rounded-[2rem] overflow-hidden transition-all hover:border-secondary/30">
      <div 
        className="p-8 cursor-pointer flex items-center justify-between group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#0E1117] rounded-2xl flex flex-col items-center justify-center border border-white/5 group-hover:border-secondary/20 transition-all">
            <span className="text-[10px] font-black text-secondary tracking-widest leading-none mb-1">PDF</span>
            <FileText size={24} className="text-white/60 group-hover:text-secondary transition-all" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="text-xl font-black text-white group-hover:text-secondary transition-colors">{exam.sinav_adi}</h4>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-[9px] font-black uppercase tracking-widest border border-secondary/20">{exam.ders}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#666] flex items-center gap-1.5">
                <Clock size={14} />
                {exam.tarih}
              </span>
              <span className="text-xs font-bold text-[#666] flex items-center gap-1.5">
                <BookOpen size={14} />
                {exam.toplam_soru} Soru
              </span>
              <span className="text-xs font-bold text-green-500/80 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                {results.length} Katılım
              </span>
            </div>
          </div>
        </div>
        <div className={`p-3 bg-[#0E1117] rounded-xl border border-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <Plus size={20} className="text-white/40" />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#2D2E33] bg-[#0E1117]/50"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h5 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-70">📊 Talebe Başarı Tablosu</h5>
                <button className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-all">Excel Olarak Al</button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-secondary" size={32} />
                </div>
              ) : results.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-white/5">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1A1C23]">
                      <tr>
                        <th className="py-4 px-6 text-[9px] font-black text-[#666] uppercase tracking-widest">Talebe</th>
                        <th className="py-4 px-6 text-[9px] font-black text-[#666] uppercase tracking-widest text-center">Doğru</th>
                        <th className="py-4 px-6 text-[9px] font-black text-[#666] uppercase tracking-widest text-center">Yanlış</th>
                        <th className="py-4 px-6 text-[9px] font-black text-[#666] uppercase tracking-widest text-center">Boş</th>
                        <th className="py-4 px-6 text-[9px] font-black text-secondary uppercase tracking-widest text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {results.map((result, idx) => (
                        <tr key={result.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-white/20 w-4">{idx + 1}</span>
                              <span className="text-sm font-bold text-white">{result.talebe_isim}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-green-500 text-sm">{result.dogru}</td>
                          <td className="py-4 px-6 text-center font-bold text-error text-sm">{result.yanlis}</td>
                          <td className="py-4 px-6 text-center font-bold text-[#666] text-sm">{result.bos}</td>
                          <td className="py-4 px-6 text-right">
                            <span className="px-4 py-1.5 bg-secondary text-primary rounded-xl text-xs font-black">{result.net.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-[#1A1C23] rounded-3xl border border-dashed border-[#2D2E33]">
                  <p className="text-xs font-bold text-[#444] uppercase tracking-widest">Henüz hiçbir talebe bu testi yanıtlamadı</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeacherDashboard({ announcements, classes, messages, students, setClasses, onNavigate, activeTab = 'home' }: TeacherDashboardProps) {
  const [activePanel, setActivePanel] = useState<'reports' | 'exams' | 'calendar'>('reports');
  const [isViewingReport, setIsViewingReport] = useState(false);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  const [isManagingAttendance, setIsManagingAttendance] = useState(false);
  const [isManagingAvatars, setIsManagingAvatars] = useState(false);
  const [isPublishingExam, setIsPublishingExam] = useState(false);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [newExam, setNewExam] = useState({ 
    sinav_adi: '', 
    ders: 'Matematik', 
    toplam_soru: 40,
    pdf_data: '',
    pdf_name: ''
  });
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarStudentId, setAvatarStudentId] = useState<string>('');
  
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [aiReportContent, setAiReportContent] = useState('');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [newClass, setNewClass] = useState({ title: '', time: '', location: '', classGroup: '' });
  const [isRinging, setIsRinging] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isSavingCalendarEvent, setIsSavingCalendarEvent] = useState(false);
  const [newCalendarEvent, setNewCalendarEvent] = useState({
    etkinlik_adi: '',
    tur: 'Sınav' as CalendarEvent['tur'],
    tarih: new Date().toISOString().split('T')[0]
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'takvim_etkinlikleri'), orderBy('tarih', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events: CalendarEvent[] = [];
      snapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() } as CalendarEvent);
      });
      setCalendarEvents(events);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'takvim_etkinlikleri');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'sinavlar'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const examList: Exam[] = [];
      snapshot.forEach(doc => {
        examList.push({ id: doc.id, ...doc.data() } as Exam);
      });
      setExams(examList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sinavlar');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Initialize attendance with everyone present by default
    const initial: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach(s => {
      initial[s.id] = 'present';
    });
    setAttendance(initial);
  }, [students]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'attendance'), where('date', '==', today));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: AttendanceRecord[] = [];
      snapshot.forEach(doc => {
        records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
      });
      setAttendanceHistory(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'attendance');
    });

    return () => unsubscribe();
  }, []);

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    class: '9-A',
    avatar: ''
  });
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    setIsSavingStudent(true);
    try {
      const studentData = {
        name: newStudent.name,
        number: `102${Math.floor(100 + Math.random() * 900)}`, // Required field for schema
        email: newStudent.email,
        class: newStudent.class,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudent.name)}&background=random`,
        role: 'parent', // In this app, parents and students are often synonymous for the portal
        grades: [],
        attendance: 100,
        ktsResults: [],
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'students'), studentData);
      
      setIsAddingStudent(false);
      setNewStudent({ name: '', email: '', class: '9-A', avatar: '' });
      setShowNotification(true);
      setToastMessage('Yeni talebe başarıyla kaydedildi!');
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
    } finally {
      setIsSavingStudent(false);
    }
  };

  const [isManagingStudent, setIsManagingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editMetrics, setEditMetrics] = useState({
    grade: 0,
    attendance: 0,
    status: 'present' as 'present' | 'absent' | 'late'
  });

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  const exportToExcel = async () => {
    try {
      const { utils, writeFile } = await import('xlsx');
      
      const exportData = students.map(student => ({
        'Talebe Adı': student.name,
        'Numarası': student.number,
        'Sınıfı': student.class,
        'Veli Adı': student.parentName,
        'Hız/KTS Ortalaması': student.ktsResults?.length 
          ? (student.ktsResults.reduce((acc, curr) => acc + curr.score, 0) / student.ktsResults.length).toFixed(1) 
          : 'Yok'
      }));

      const worksheet = utils.json_to_sheet(exportData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Enderun Talebe Raporu");
      
      const fileName = `Enderun_Talebe_Raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
      writeFile(workbook, fileName);
      
      setToastMessage('Rapor Excel olarak hazırlandı ve indiriliyor.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Excel dışa aktarma hatası:', error);
      setToastMessage('Rapor oluşturulurken bir hata oluştu.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Bu talebe kaydı kalıcı olarak silinecektir. Bu işlem geri alınamaz! Onaylıyor musunuz?')) return;
    
    setIsDeletingStudent(true);
    try {
      await deleteDoc(doc(db, 'students', id));
      setIsManagingStudent(false);
      setToastMessage('Talebe kaydı başarıyla silindi.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleBroadcastMessage = async () => {
    if (!messageText.trim()) return;
    
    setIsSendingMessage(true);
    try {
      const batch = writeBatch(db);
      students.forEach(student => {
        const msgRef = doc(collection(db, 'messages'));
        batch.set(msgRef, {
          sender: 'Muallim',
          senderRole: 'teacher',
          content: messageText,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          recipientId: student.id,
          createdAt: new Date().toISOString()
        });
      });
      
      await batch.commit();
      setMessageText('');
      setIsBroadcasting(false);
      setToastMessage('Duyuru tüm talebelere iletildi.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages/broadcast');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUpdateStudentMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSavingStudent(true);
    try {
      const studentDocRef = doc(db, 'students', editingStudent.id);
      
      // Update grades if changed
      const newGrades = [...(editingStudent.grades || [])];
      if (editMetrics.grade > 0) {
        newGrades.push({
          subject: 'Genel Değerlendirme',
          value: editMetrics.grade,
          date: new Date().toISOString().split('T')[0]
        });
      }

      await setDoc(studentDocRef, {
        ...editingStudent,
        grades: newGrades,
        status: editMetrics.status,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // If status changed, record it in attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceId = `${editingStudent.id}_${today}`;
      await setDoc(doc(db, 'attendance', attendanceId), {
        studentId: editingStudent.id,
        studentName: editingStudent.name,
        date: today,
        status: editMetrics.status,
        classId: editingStudent.class || '9-A',
        updatedAt: new Date().toISOString()
      });

      setToastMessage(`${editingStudent.name} verileri güncellendi.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setIsManagingStudent(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${editingStudent.id}`);
    } finally {
      setIsSavingStudent(false);
    }
  };

  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSendMessage = async (student: Student) => {
    if (!messageText.trim()) return;
    
    setIsSendingMessage(true);
    try {
      await addDoc(collection(db, 'messages'), {
        sender: 'Muallim',
        senderRole: 'teacher',
        content: messageText,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        recipientId: student.id,
        createdAt: new Date().toISOString()
      });
      
      setMessageText('');
      setToastMessage('Mesaj başarıyla gönderildi.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const toggleAttendance = (id: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const generateAIReport = () => {
    setIsGeneratingAIReport(true);
    setAiReportContent('');
    
    const text = "Bugünkü matematik dersinde talebelerin türev ve integral arasındaki ilişkiyi kavrama oranı oldukça yüksekti. Özellikle Ali ve Zeynep'in aktif katılımı dikkat çekti. Sınıfın %85'i verilen pratik problemleri başarıyla tamamladı. Gelecek ders için karmaşık sayılara giriş yapılması planlanmaktadır.";
    
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

  const handleUpdateAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarStudentId || !avatarPreview) return;

    setIsUpdatingAvatar(true);
    try {
      const studentDocRef = doc(db, 'students', avatarStudentId);
      await setDoc(studentDocRef, { avatar: avatarPreview }, { merge: true });
      
      setToastMessage('Profil resmi başarıyla güncellendi.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setIsManagingAvatars(false);
      setAvatarPreview(null);
      setAvatarStudentId('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${avatarStudentId}`);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Resize to max 400x400
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to 70% quality jpeg
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setAvatarPreview(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRingBell = () => {
    if (isRinging || isAudioLoading) {
      if (isRinging) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsRinging(false);
      }
      return;
    }
    
    setIsAudioLoading(true);
    const audio = new Audio();
    audio.src = '/api/bell-proxy';
    audio.preload = "auto";
    audioRef.current = audio;

    const playAudio = () => {
      setIsAudioLoading(false);
      setIsRinging(true);
      audio.play().catch(e => {
        console.error('Ses çalma başlatılamadı:', e);
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

    setTimeout(() => {
      if (isAudioLoading) playAudio();
    }, 3000);

    setTimeout(() => {
      if (audioRef.current === audio) {
        setIsRinging(false);
        audio.pause();
      }
    }, 20000);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setToastMessage('Duyuru silindi.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
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

    try {
      await addDoc(collection(db, 'classes'), session);
      setNewClass({ title: '', time: '', location: '', classGroup: '' });
      setIsAddingClass(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'classes');
    }
  };

  const handlePublishExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.sinav_adi || !newExam.pdf_data || !auth.currentUser) return;

    setIsSavingExam(true);
    try {
      const t_tarih = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
      
      await addDoc(collection(db, 'sinavlar'), {
        sinav_adi: newExam.sinav_adi,
        ders: newExam.ders,
        toplam_soru: Number(newExam.toplam_soru),
        tarih: t_tarih,
        pdf_data: newExam.pdf_data,
        pdf_name: newExam.pdf_name,
        teacherId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      setNewExam({ 
        sinav_adi: '', 
        ders: 'Matematik', 
        toplam_soru: 40,
        pdf_data: '',
        pdf_name: ''
      });
      setIsPublishingExam(false);
      setToastMessage('Test ve PDF başarıyla sınıfa dağıtıldı!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sinavlar');
    } finally {
      setIsSavingExam(false);
    }
  };

  const handlePDFFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setNewExam(prev => ({ ...prev, pdf_data: base64String, pdf_name: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    
    setIsSavingAttendance(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const batch = writeBatch(db);
      
      students.forEach(student => {
        const attendanceId = `${student.id}_${today}_${selectedClass.id}`;
        const ref = doc(db, 'attendance', attendanceId);
        batch.set(ref, {
          studentId: student.id,
          studentName: student.name,
          date: today,
          status: attendance[student.id] || 'present',
          classId: selectedClass.id
        });
      });
      
      await batch.commit();
      setIsTakingAttendance(false);
      setToastMessage('Yoklama başarıyla kaydedildi.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'attendance');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleDeleteAttendanceRecord = async (id: string) => {
    if (!window.confirm('Bu yoklama kaydını silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteDoc(doc(db, 'attendance', id));
      setToastMessage('Yoklama kaydı silindi.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `attendance/${id}`);
    }
  };

  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarEvent.etkinlik_adi || !auth.currentUser) return;

    setIsSavingCalendarEvent(true);
    try {
      await addDoc(collection(db, 'takvim_etkinlikleri'), {
        ...newCalendarEvent,
        teacherId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      setNewCalendarEvent({
        etkinlik_adi: '',
        tur: 'Sınav',
        tarih: new Date().toISOString().split('T')[0]
      });
      setToastMessage('Sınav takvime başarıyla eklendi!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'takvim_etkinlikleri');
    } finally {
      setIsSavingCalendarEvent(false);
    }
  };

  const handleDeleteCalendarEvent = async (id: string) => {
    if (!window.confirm('Bu sınavı takvimden silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteDoc(doc(db, 'takvim_etkinlikleri', id));
      setToastMessage('Sınav takvimden kaldırıldı.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `takvim_etkinlikleri/${id}`);
    }
  };

  return (
    <div className="space-y-12">
      {/* Welcome & Fast Actions */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-black text-primary leading-tight tracking-tighter">Öğretmen Paneli</h2>
          </motion.div>
          
          <div className="flex bg-[#1A1C23] p-1.5 rounded-2xl border border-[#2D2E33] shadow-lg">
            <button 
              onClick={() => setActivePanel('reports')}
              className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activePanel === 'reports' ? 'bg-secondary text-primary' : 'text-white/40 hover:text-white'}`}
            >
              Genel Rapor & Duyuru
            </button>
            <button 
              onClick={() => setActivePanel('exams')}
              className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activePanel === 'exams' ? 'bg-secondary text-primary' : 'text-white/40 hover:text-white'}`}
            >
              📚 Sınıf Test & PDF Odası
            </button>
            <button 
              onClick={() => setActivePanel('calendar')}
              className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activePanel === 'calendar' ? 'bg-secondary text-primary' : 'text-white/40 hover:text-white'}`}
            >
              📅 Sınav Takvimi
            </button>
          </div>
        </div>
      </section>

      {activePanel === 'reports' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="reports-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsViewingReport(true)}
                className="flex items-center gap-2 px-6 py-4 bg-primary text-secondary rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-primary/20 border-b-4 border-primary-dark"
              >
                <BarChart3 size={24} />
                <div className="text-left">
                  <span className="block text-sm font-black uppercase tracking-wider">Durum Raporu</span>
                  <span className="block text-[10px] opacity-70">Excel Al & Analiz Et</span>
                </div>
              </button>
              <button 
                onClick={() => setIsManagingAvatars(true)}
                className="flex items-center gap-2 px-6 py-4 bg-[#1A1C23] text-secondary rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg border border-[#2D2E33]"
              >
                <UserCheck size={20} />
                <span className="font-semibold">Profil Resimleri</span>
              </button>
              <button 
                onClick={() => setIsBroadcasting(true)}
                className="flex items-center gap-2 px-6 py-4 bg-surface-container-highest text-primary rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-md shadow-black/5"
              >
                <MessageSquare size={20} />
                <span className="font-semibold">Toplu Mesaj</span>
              </button>
              <button 
                onClick={() => setIsAddingStudent(true)}
                className="flex items-center gap-2 px-6 py-4 bg-primary text-secondary rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-primary/10"
              >
                <Plus size={20} />
                <span className="font-semibold">Talebe Ekle</span>
              </button>
              <button 
                onClick={() => setIsManagingAttendance(true)}
                className="flex items-center gap-2 px-6 py-4 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <Clock size={20} />
                <span className="font-semibold">Yoklama Yönetimi</span>
              </button>
              <button 
                onClick={() => setIsPublishingExam(true)}
                className="flex items-center gap-2 px-6 py-4 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform active:scale-95 border-b-4 border-accent-dark"
              >
                <BookOpen size={24} />
                <div className="text-left">
                  <span className="block text-sm font-black uppercase tracking-wider">Test Yayınla</span>
                  <span className="block text-[10px] opacity-70">PDF Kitapçığı Yükle</span>
                </div>
              </button>
            </div>

            {/* Muallim Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="info-card text-center border-b-4 border-secondary/20">
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 opacity-70">Toplam Kayıtlı Talebe</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-black text-primary">{students.length}</span>
              <div className="text-left leading-none">
                <span className="block text-[10px] font-bold text-green-500 uppercase tracking-widest">+2 Yeni</span>
                <span className="block text-[8px] text-[#888] font-bold uppercase tracking-widest mt-1">Bu Hafta</span>
              </div>
            </div>
          </div>
          <div className="info-card text-center border-b-4 border-secondary/20">
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 opacity-70">Ortalama Başarı Skoru</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-black text-primary">%84</span>
              <div className="text-left leading-none">
                <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest">Yüksek</span>
                <span className="block text-[8px] text-[#888] font-bold uppercase tracking-widest mt-1">Genel Ort.</span>
              </div>
            </div>
          </div>
          <div className="info-card text-center border-b-4 border-secondary/20">
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 opacity-70">Günlük Katılım Oranı</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-black text-primary">%98</span>
              <div className="text-left leading-none">
                <span className="block text-[10px] font-bold text-green-500 uppercase tracking-widest">Mükemmel</span>
                <span className="block text-[8px] text-[#888] font-bold uppercase tracking-widest mt-1">Bugün</span>
              </div>
            </div>
          </div>
        </div>

        {/* Öğrenci Güncel Durum Raporu (Main Dashboard Table) */}
        <div className="bg-[#1A1C23] p-10 rounded-[2.5rem] border border-[#2D2E33] shadow-2xl overflow-hidden mb-12 relative group/report">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/20 to-transparent opacity-50" />
          
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <BarChart3 size={24} className="text-secondary" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight">Öğrenci Güncel Durum Raporu</h3>
              </div>
              <p className="text-[#888] text-xs font-bold uppercase tracking-[0.2em] ml-12">Kayıtlı tüm talebelerin akademik ve idari gelişim karnesi</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-[#0E1117] p-1.5 rounded-xl border border-white/5">
                <button className="px-5 py-2 bg-secondary text-primary rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Tümü</button>
                <button className="px-5 py-2 text-white/40 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">9-A</button>
                <button className="px-5 py-2 text-white/40 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">10-B</button>
              </div>
              
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-3 px-8 py-4 bg-primary text-secondary rounded-2xl font-black hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-primary/30 border-b-4 border-primary-dark group/dl"
              >
                <FileText size={20} className="group-hover/dl:rotate-12 transition-transform" />
                <div className="text-left flex flex-col leading-tight">
                  <span className="text-[11px] uppercase tracking-widest">Excel Olarak Al</span>
                  <span className="text-[9px] opacity-60 font-bold">DETAYLI VERİ ÇIKTISI</span>
                </div>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar -mx-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0E1117]/50">
                  <th className="py-6 px-6 text-[10px] font-black text-secondary uppercase tracking-[0.2em] border-b border-white/5 rounded-tl-2xl">Talebe & Kimlik</th>
                  <th className="py-6 px-6 text-[10px] font-black text-[#888] uppercase tracking-[0.2em] border-b border-white/5">No</th>
                  <th className="py-6 px-6 text-[10px] font-black text-[#888] uppercase tracking-[0.2em] border-b border-white/5 text-center">Sınıf</th>
                  <th className="py-6 px-6 text-[10px] font-black text-[#888] uppercase tracking-[0.2em] border-b border-white/5">Veli / İletişim</th>
                  <th className="py-6 px-6 text-[10px] font-black text-[#888] uppercase tracking-[0.2em] border-b border-white/5 text-center">Başarı Oranı</th>
                  <th className="py-6 px-6 text-[10px] font-black text-[#888] uppercase tracking-[0.2em] border-b border-white/5 text-right rounded-tr-2xl">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {students.map((student) => {
                  const sGrades = student.grades || [];
                  const avg = sGrades.length > 0 
                    ? Math.round(sGrades.reduce((acc, curr) => acc + curr.value, 0) / sGrades.length) 
                    : 0;
                  
                  return (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-all group/row">
                      <td className="py-5 px-6 border-b border-white/[0.03]">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full border-2 border-secondary/20 overflow-hidden bg-[#0E1117] ring-4 ring-transparent group-hover/row:ring-secondary/10 transition-all shadow-lg p-0.5">
                            <img src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="" className="w-full h-full object-cover rounded-full" />
                          </div>
                          <div>
                            <span className="block font-black text-lg text-white group-hover/row:text-secondary transition-colors leading-tight">{student.name}</span>
                            <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">{student.status === 'present' ? 'SİSTEMDE AKTİF' : 'BEKLEMEDE'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 border-b border-white/[0.03] font-mono text-xs text-[#888] font-bold">{student.number}</td>
                      <td className="py-5 px-6 border-b border-white/[0.03] text-center">
                        <span className="px-4 py-1.5 bg-[#0E1117] text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">{student.class}</span>
                      </td>
                      <td className="py-5 px-6 border-b border-white/[0.03]">
                        <div className="text-white/60 font-bold text-xs">{student.parentName}</div>
                        <div className="text-[10px] text-[#666] font-medium mt-0.5">Kayıtlı Veli Bilgisi</div>
                      </td>
                      <td className="py-5 px-6 border-b border-white/[0.03] text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xl font-black ${avg >= 85 ? 'text-green-500' : avg >= 60 ? 'text-secondary' : 'text-error'}`}>
                            {avg > 0 ? `%${avg}` : 'N/A'}
                          </span>
                          <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${avg}%` }} className={`h-full ${avg >= 85 ? 'bg-green-500' : avg >= 60 ? 'bg-secondary' : 'bg-error'}`} />
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 border-b border-white/[0.03] text-right">
                        <div className="flex items-center justify-end gap-4">
                           <button 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-3 text-error/20 hover:text-error hover:bg-error/10 rounded-2xl transition-all opacity-0 group-hover/row:opacity-100"
                            title="Kaydı Tamamen Sil"
                          >
                            <Trash2 size={20} />
                          </button>
                          <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${student.status === 'present' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-[#888]'}`}>
                              {student.status === 'present' ? 'Mevcut' : 'Yok'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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
                <img src={c.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800'} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
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
                    className="absolute bottom-0 w-full bg-accent/20 rounded-t-lg transition-colors group-hover:bg-accent"
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
                src={nextClass.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800'} 
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

      {/* Student Overview Cards Section */}
      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Users className="text-accent" size={24} />
            Öğrenci Kartları
          </h3>
          <button 
            onClick={() => onNavigate?.('portal')}
            className="text-xs font-black text-accent tracking-widest uppercase hover:underline"
          >
            Tümünü Yönet
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map(student => (
            <StudentCard 
              key={student.id} 
              student={student} 
              attendanceStatus={attendance[student.id] || student.status || 'not-set'}
              onClick={() => {
                setEditingStudent(student);
                setEditMetrics({
                  grade: student.grades?.[0]?.value || 0,
                  attendance: 0, // Should be calculated
                  status: student.status || 'present'
                });
                setIsManagingStudent(true);
              }}
            />
          ))}
        </div>
      </section>

      {/* Daily Summary Action Cards */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
          <BookOpen className="text-secondary" size={24} />
          Günün Özeti & Görevler
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="info-card flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <FileText size={24} />
            </div>
            <div>
              <h5 className="font-bold text-primary mb-1">Ders Materyalleri</h5>
              <p className="text-xs text-on-surface-variant">Bugün için 3 yeni döküman eklendi.</p>
            </div>
            <button 
              onClick={() => setSelectedClass(classes[0])}
              className="mt-auto bg-accent/10 px-4 py-2 rounded-lg text-accent text-xs font-bold hover:bg-accent hover:text-white transition-all self-start"
            >
              Görüntüle
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="info-card flex flex-col gap-4"
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
              className="mt-auto bg-accent/10 px-4 py-2 rounded-lg text-accent text-xs font-bold hover:bg-accent hover:text-white transition-all self-start"
            >
              Takvime Ekle
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="info-card flex flex-col gap-4"
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
            className="info-card flex flex-col gap-4"
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
          </motion.div>
        </AnimatePresence>
      ) : activePanel === 'calendar' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="calendar-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* SOL TARAF: SINAVLARIN AKIŞ LİSTESİ */}
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Clock className="text-secondary" size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight">📋 Planlanan Sınavlar</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {calendarEvents.map(event => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={event.id} 
                      className="bg-[#1A1C23] border border-[#2D2E33] rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-secondary/30 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#0E1117] rounded-2xl flex flex-col items-center justify-center border border-white/5 group-hover:border-secondary/20 transition-all">
                          <span className="text-[10px] font-black text-secondary tracking-widest leading-none mb-1">{event.tur.toUpperCase()}</span>
                          <span className="text-xl font-black text-white">{new Date(event.tarih).getDate()}</span>
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-white group-hover:text-secondary transition-colors mb-1">{event.etkinlik_adi}</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-[#666] flex items-center gap-2">
                              <Clock size={14} />
                              {new Date(event.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteCalendarEvent(event.id)}
                        className="p-4 bg-[#0E1117] text-white/20 hover:text-error hover:bg-error/5 rounded-2xl border border-white/5 transition-all"
                      >
                        <Trash2 size={24} />
                      </button>
                    </motion.div>
                  ))}

                  {calendarEvents.length === 0 && (
                    <div className="bg-[#1A1C23] p-20 rounded-[3rem] border border-[#2D2E33] text-center">
                      <Clock size={64} className="mx-auto text-white/5 mb-6" />
                      <p className="text-xl font-bold text-white/40 uppercase tracking-widest">Planlanmış bir sınav bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SAĞ TARAF: YALNIZCA ÖĞRETMENE AÇIK SINAV EKLEME PANELİ */}
              <div className="lg:col-span-4">
                <div className="bg-[#1A1C23] p-10 rounded-[2.5rem] border border-[#2D2E33] shadow-2xl sticky top-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Plus className="text-secondary" size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">📌 Sınav Ekle</h3>
                  </div>

                  <form onSubmit={handleAddCalendarEvent} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-70">Sınav Adı</label>
                      <input 
                        type="text"
                        placeholder="Örn: TYT Deneme #14"
                        value={newCalendarEvent.etkinlik_adi}
                        onChange={(e) => setNewCalendarEvent(prev => ({ ...prev, etkinlik_adi: e.target.value }))}
                        className="w-full px-5 py-4 bg-[#0E1117] rounded-xl border border-[#2D2E33] text-white font-bold text-sm outline-none focus:ring-2 focus:ring-secondary transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-70">Tür</label>
                      <select 
                        value={newCalendarEvent.tur}
                        onChange={(e) => setNewCalendarEvent(prev => ({ ...prev, tur: e.target.value as any }))}
                        className="w-full px-5 py-4 bg-[#0E1117] rounded-xl border border-[#2D2E33] text-white font-bold text-sm outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none"
                      >
                        {['Deneme', 'Okul', 'Yazılı', 'Performans', 'Sınav'].map(tur => (
                          <option key={tur} value={tur}>{tur}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-70">Uygulama Tarihi</label>
                      <input 
                        type="date"
                        value={newCalendarEvent.tarih}
                        onChange={(e) => setNewCalendarEvent(prev => ({ ...prev, tarih: e.target.value }))}
                        className="w-full px-5 py-4 bg-[#0E1117] rounded-xl border border-[#2D2E33] text-white font-bold text-sm outline-none focus:ring-2 focus:ring-secondary transition-all"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingCalendarEvent || !newCalendarEvent.etkinlik_adi}
                      className="w-full py-5 bg-secondary text-primary font-black rounded-2xl shadow-xl shadow-secondary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {isSavingCalendarEvent ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      🚀 TAKVİME İŞLE
                    </button>
                  </form>
                </div>
              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-[#1A1C23] p-8 rounded-[2.5rem] border border-[#2D2E33] shadow-xl sticky top-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Plus className="text-secondary" size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">Yeni PDF'li Test Yayınla</h3>
                  </div>

                  <form onSubmit={handlePublishExam} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Sınav / Test Adı</label>
                      <input 
                        type="text"
                        value={newExam.sinav_adi}
                        onChange={(e) => setNewExam(prev => ({ ...prev, sinav_adi: e.target.value }))}
                        placeholder="Örn: Matematik Konu Testi"
                        className="w-full px-5 py-4 bg-[#0E1117] rounded-2xl border border-[#2D2E33] focus:ring-2 focus:ring-secondary transition-all font-bold text-sm text-white placeholder:text-white/10 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Ders Seçin</label>
                      <select 
                        value={newExam.ders}
                        onChange={(e) => setNewExam(prev => ({ ...prev, ders: e.target.value }))}
                        className="w-full px-5 py-4 bg-[#0E1117] rounded-2xl border border-[#2D2E33] focus:ring-2 focus:ring-secondary transition-all font-bold text-sm text-white appearance-none outline-none"
                        required
                      >
                        <option value="Matematik">Matematik</option>
                        <option value="Fizik">Fizik</option>
                        <option value="Kimya">Kimya</option>
                        <option value="Biyoloji">Biyoloji</option>
                        <option value="Edebiyat">Edebiyat</option>
                        <option value="Tarih">Tarih</option>
                        <option value="Genel Deneme">Genel Deneme</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Toplam Soru</label>
                      <input 
                        type="number"
                        value={newExam.toplam_soru}
                        onChange={(e) => setNewExam(prev => ({ ...prev, toplam_soru: Number(e.target.value) }))}
                        min="1"
                        className="w-full px-5 py-4 bg-[#0E1117] rounded-2xl border border-[#2D2E33] focus:ring-2 focus:ring-secondary transition-all font-bold text-sm text-white outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Sınav PDF Dosyası</label>
                      <input 
                        type="file"
                        accept="application/pdf"
                        onChange={handlePDFFileChange}
                        className="hidden"
                        id="pdf-upload-sidebar"
                      />
                      <label 
                        htmlFor="pdf-upload-sidebar"
                        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all group relative ${newExam.pdf_data ? 'border-secondary bg-secondary/5' : 'border-[#2D2E33] hover:bg-white/5'}`}
                      >
                        {newExam.pdf_data ? (
                          <div className="text-center">
                            <FileText size={32} className="text-secondary mx-auto mb-2" />
                            <span className="text-[10px] font-black text-white block truncate max-w-[150px]">{newExam.pdf_name}</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Plus size={32} className="text-secondary/40 mx-auto mb-1" />
                            <span className="text-[10px] font-black text-[#888] uppercase tracking-widest">PDF Yükle</span>
                          </div>
                        )}
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingExam || !newExam.sinav_adi || !newExam.pdf_data}
                      className="w-full py-5 bg-secondary text-primary font-black rounded-2xl shadow-xl shadow-secondary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {isSavingExam ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      TESTİ YAYINLA
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <BookOpen className="text-secondary" size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight">Yayındaki Testler</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {exams.map(exam => (
                    <ExamResultCard key={exam.id} exam={exam} />
                  ))}
                  {exams.length === 0 && (
                    <div className="bg-[#1A1C23] p-20 rounded-[3rem] border border-[#2D2E33] text-center">
                      <BookOpen size={64} className="mx-auto text-white/5 mb-6" />
                      <p className="text-xl font-bold text-white/40 uppercase tracking-widest">Yayında test bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

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
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl p-8 max-h-[85vh] flex flex-col overflow-hidden"
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

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar p-2">
                {students.map((student) => (
                  <StudentCard 
                    key={student.id}
                    student={student}
                    attendanceStatus={attendance[student.id]}
                    onStatusChange={(status) => toggleAttendance(student.id, status)}
                  />
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/10">
                <button 
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {isSavingAttendance ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  YOKLAMAYI KAYDET
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance Management Modal */}
      <AnimatePresence>
        {isManagingAttendance && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManagingAttendance(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl p-8 max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-2xl font-black text-primary">Yoklama Yönetimi</h4>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Bugünkü Kayıtlar ({attendanceHistory.length})</p>
                </div>
                <button onClick={() => setIsManagingAttendance(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {record.status === 'present' ? <CheckCircle2 size={20} /> : <X size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{record.studentName}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            {classes.find(c => c.id === record.classId)?.title || 'Genel Ders'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAttendanceRecord(record.id)}
                        className="p-2 text-error hover:bg-error/10 rounded-xl transition-all"
                      >
                        <UserMinus size={20} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-outline-variant mb-4" />
                    <p className="text-on-surface-variant font-medium">Bugün henüz yoklama kaydı bulunmuyor.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/10">
                <button 
                  onClick={() => setIsManagingAttendance(false)}
                  className="w-full py-4 bg-surface-container-high text-primary font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  KAPAT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Broadcast Message Modal */}
      <AnimatePresence>
        {isBroadcasting && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsBroadcasting(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-primary">Tüm Sınıfa Duyuru</h2>
                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">({students.length} Talebeye İletilecek)</p>
                  </div>
                  <button onClick={() => setIsBroadcasting(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                    <X size={24} className="text-outline" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Duyuru Metni</label>
                    <textarea 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Dersi takip etmeyi unutmayın..."
                      className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-medium text-sm min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsBroadcasting(false)}
                      className="flex-grow py-4 bg-surface-container font-bold text-primary rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      type="button"
                      onClick={handleBroadcastMessage}
                      disabled={isSendingMessage || !messageText.trim()}
                      className="flex-grow py-4 bg-secondary text-primary font-bold rounded-xl shadow-lg shadow-secondary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSendingMessage ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Send size={18} />
                          Duyuruyu Paylaş
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Management Modal */}
      <AnimatePresence>
        {isManagingStudent && editingStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsManagingStudent(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary/20 bg-surface-container flex items-center justify-center">
                      {editingStudent.avatar ? (
                        <img src={editingStudent.avatar} alt={editingStudent.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users size={24} className="text-secondary" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-primary">{editingStudent.name}</h2>
                      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{editingStudent.class || 'Sınıf Yok'} Yönetimi</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => handleDeleteStudent(editingStudent.id)}
                      disabled={isDeletingStudent}
                      className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                      title="Kaydı Sil"
                    >
                      {isDeletingStudent ? <Loader2 size={24} className="animate-spin" /> : <UserMinus size={24} />}
                    </button>
                    <button onClick={() => setIsManagingStudent(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                      <X size={24} className="text-outline" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleUpdateStudentMetrics} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Başarı Puanı</label>
                      <input 
                        type="number"
                        value={editMetrics.grade}
                        onChange={(e) => setEditMetrics({...editMetrics, grade: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-bold text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Devamsızlık</label>
                      <input 
                        type="number"
                        value={editMetrics.attendance}
                        onChange={(e) => setEditMetrics({...editMetrics, attendance: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-bold text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Bugünkü Durum</label>
                    <div className="flex gap-2">
                      {(['present', 'late', 'absent'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEditMetrics({...editMetrics, status: s})}
                          className={`flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            editMetrics.status === s 
                              ? 'bg-secondary text-primary shadow-lg shadow-secondary/20' 
                              : 'bg-surface-container text-outline hover:bg-surface-container-high'
                          }`}
                        >
                          {s === 'present' ? 'Geldi' : s === 'late' ? 'Geç' : 'Gelmedi'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/10">
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Özel Mesaj Gönder</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Talebeye notunuz..."
                        className="flex-grow px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-medium text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => handleSendMessage(editingStudent)}
                        disabled={isSendingMessage || !messageText.trim()}
                        className="p-3 bg-primary text-secondary rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                      >
                        {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsManagingStudent(false)}
                      className="flex-grow py-4 bg-surface-container font-bold text-primary rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingStudent}
                      className="flex-grow py-4 bg-secondary text-primary font-bold rounded-xl shadow-lg shadow-secondary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingStudent ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          Verileri Güncelle
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddingStudent(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-primary mb-1">Yeni Talebe Kaydı</h2>
                    <p className="text-on-surface-variant font-medium">Enderun sistemine yeni bir öğrenci ekleyin.</p>
                  </div>
                  <button onClick={() => setIsAddingStudent(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                    <X size={24} className="text-outline" />
                  </button>
                </div>
                
                <form onSubmit={handleAddStudent} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Talebe Adı Soyadı</label>
                    <input 
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-accent transition-all font-medium"
                      placeholder="Örn: Ahmet Faruk"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">E-posta Adresi (Veli/Öğrenci)</label>
                    <input 
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-accent transition-all font-medium"
                      placeholder="orn@eposta.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Sınıf Seçimi</label>
                    <select 
                      value={newStudent.class}
                      onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-accent transition-all font-medium"
                    >
                      <option value="9-A">9-A</option>
                      <option value="9-B">9-B</option>
                      <option value="10-A">10-A</option>
                      <option value="11-A">11-A</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsAddingStudent(false)}
                      className="flex-grow py-4 bg-surface-container font-bold text-primary rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingStudent}
                      className="flex-grow py-4 bg-primary text-secondary font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingStudent ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={18} />
                          Talebeyi Kaydet
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
              className="relative w-full max-w-4xl bg-surface-container-lowest rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
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
                    <div className="bg-surface-container border border-outline-variant/10 p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
                          <UserPlus size={18} />
                        </div>
                        <span className="text-sm font-bold text-primary">Katılım Oranı</span>
                      </div>
                      <p className="text-3xl font-black text-primary">%94</p>
                      <p className="text-xs text-on-surface-variant mt-1">Önceki güne göre +2%</p>
                    </div>
                    <div className="bg-surface-container border border-outline-variant/10 p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-secondary/10 dark:bg-secondary/20 text-secondary rounded-lg flex items-center justify-center">
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
                        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/10">
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
              className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl p-8"
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
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl p-8 overflow-hidden"
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
            {/* Avatar Management Modal */}
      <AnimatePresence>
        {isManagingAvatars && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsManagingAvatars(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0E1117] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#2D2E33]"
            >
              <div className="p-8 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-secondary">Öğrenci Profil Resmi Ayarları</h2>
                    <p className="text-[#888] text-xs font-bold uppercase tracking-widest">Görsel kimlik yönetimi merkezi</p>
                  </div>
                  <button onClick={() => setIsManagingAvatars(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={24} className="text-outline" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-8 custom-scrollbar">
                <form onSubmit={handleUpdateAvatar} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1 opacity-70">Öğrenci Seçin</label>
                    <select 
                      value={avatarStudentId}
                      onChange={(e) => {
                        setAvatarStudentId(e.target.value);
                        const student = students.find(s => s.id === e.target.value);
                        if (student?.avatar) setAvatarPreview(student.avatar);
                        else setAvatarPreview(null);
                      }}
                      className="w-full px-4 py-4 bg-[#1A1C23] rounded-xl border border-[#2D2E33] focus:ring-2 focus:ring-secondary transition-all font-bold text-sm text-white appearance-none"
                      required
                    >
                      <option value="" className="bg-[#1A1C23]">Öğrenci Listesini Aç...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#1A1C23]">{s.name} ({s.number})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col items-center gap-8 p-8 bg-[#1A1C23] rounded-3xl border border-[#2D2E33] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
                    
                    <motion.div 
                      className="relative w-40 h-40 rounded-full border-4 border-secondary overflow-hidden shadow-2xl shadow-secondary/20 bg-[#0E1117]"
                      whileHover={{ scale: 1.05 }}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#888]">
                          <Users size={48} className="opacity-20" />
                        </div>
                      )}
                    </motion.div>
                    
                    <div className="w-full">
                      <label className="flex flex-col items-center gap-3 px-4 py-8 bg-[#0E1117] text-secondary rounded-2xl font-bold cursor-pointer hover:bg-white/5 transition-all border-2 border-dashed border-[#2D2E33] group">
                        <Edit3 size={28} className="group-hover:scale-110 transition-transform text-secondary" />
                        <div className="text-center">
                          <span className="block text-xs uppercase tracking-[0.2em] mb-1">Yeni Fotoğraf Seç</span>
                          <span className="block text-[10px] text-[#888] font-medium tracking-normal italic">Format: PNG, JPG, JPEG</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isUpdatingAvatar || !avatarStudentId || !avatarPreview}
                    className="w-full py-4 bg-secondary text-primary font-black rounded-xl shadow-xl shadow-secondary/10 hover:shadow-secondary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isUpdatingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    SİSTEME İŞLE VE GÜNCELLE
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exam Publishing Modal */}
      <AnimatePresence>
        {isPublishingExam && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsPublishingExam(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#0E1117] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-[#2D2E33]"
            >
              <div className="p-10 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Yeni Test Yayınla</h2>
                    <p className="text-[#888] text-xs font-bold uppercase tracking-[0.2em] mt-1">Sınıfa PDF sınav dökümanı dağıtın</p>
                  </div>
                  <button onClick={() => setIsPublishingExam(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                    <X size={24} className="text-white/40" />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePublishExam} className="p-10 pt-0 space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Sınav / Test Adı</label>
                    <input 
                      type="text"
                      value={newExam.sinav_adi}
                      onChange={(e) => setNewExam(prev => ({ ...prev, sinav_adi: e.target.value }))}
                      placeholder="Örn: Matematik Konu Testi - Fonksiyonlar"
                      className="w-full px-6 py-4 bg-[#1A1C23] rounded-2xl border border-[#2D2E33] focus:ring-2 focus:ring-secondary transition-all font-bold text-sm text-white placeholder:text-white/10 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Ders Seçin</label>
                      <div className="relative">
                        <select 
                          value={newExam.ders}
                          onChange={(e) => setNewExam(prev => ({ ...prev, ders: e.target.value }))}
                          className="w-full px-6 py-4 bg-[#1A1C23] rounded-2xl border border-[#2D2E33] focus:ring-2 focus:ring-secondary transition-all font-bold text-sm text-white appearance-none outline-none"
                          required
                        >
                          <option value="Matematik">Matematik</option>
                          <option value="Fizik">Fizik</option>
                          <option value="Kimya">Kimya</option>
                          <option value="Biyoloji">Biyoloji</option>
                          <option value="Edebiyat">Edebiyat</option>
                          <option value="Tarih">Tarih</option>
                          <option value="Genel Deneme">Genel Deneme</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Toplam Soru</label>
                      <input 
                        type="number"
                        value={newExam.toplam_soru}
                        onChange={(e) => setNewExam(prev => ({ ...prev, toplam_soru: Number(e.target.value) }))}
                        min="1"
                        className="w-full px-6 py-4 bg-[#1A1C23] rounded-2xl border border-[#2D2E33] focus:ring-2 focus:ring-secondary transition-all font-bold text-sm text-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 ml-1 opacity-70">Sınav PDF Dosyası (Kitapçık/Optik)</label>
                    <input 
                      type="file"
                      accept="application/pdf"
                      onChange={handlePDFFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label 
                      htmlFor="pdf-upload"
                      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all group overflow-hidden relative ${newExam.pdf_data ? 'border-secondary bg-secondary/5' : 'border-[#2D2E33] hover:bg-white/5'}`}
                    >
                      {newExam.pdf_data ? (
                        <div className="text-center relative z-10">
                          <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                            <FileText size={40} className="text-secondary" />
                          </div>
                          <span className="text-sm font-black text-white block truncate max-w-[250px] mb-1">{newExam.pdf_name}</span>
                          <span className="text-[10px] font-black text-secondary uppercase tracking-widest">PDF YÜKLENDİ - YAYINA HAZIR</span>
                        </div>
                      ) : (
                        <div className="text-center relative z-10">
                          <div className="w-20 h-20 bg-[#1A1C23] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={40} className="text-secondary" />
                          </div>
                          <span className="text-xs font-black text-[#888] uppercase tracking-widest">Sınav PDF'ini Yükleyin</span>
                          <span className="block text-[10px] text-[#444] font-bold mt-2 uppercase">MAKSİMUM 10MB</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingExam || !newExam.sinav_adi || !newExam.pdf_data}
                  className="w-full py-6 bg-secondary text-primary font-black rounded-2xl shadow-2xl shadow-secondary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm disabled:opacity-50 disabled:grayscale"
                >
                  {isSavingExam ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                  TESTİ SINIFTA YAYINLA
                </button>
              </form>
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
            <span className="font-bold">{toastMessage || 'Etkinlik başarıyla takviminize eklendi!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
