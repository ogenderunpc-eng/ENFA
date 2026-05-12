import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ClipboardList, Clock, Calendar, CheckCircle2, AlertCircle, Trash2, Send } from 'lucide-react';
import { Homework, Role, Student } from '../types';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, doc, deleteDoc, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { format, differenceInDays, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';
import { notificationService } from '../services/notificationService';

interface HomeworkPageProps {
  role: Role;
  students?: Student[];
}

export default function HomeworkPage({ role, students = [] }: HomeworkPageProps) {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    deadline: format(new Date(), 'yyyy-MM-dd'),
    classId: '9-A' // Default
  });

  const isTeacher = role === 'teacher';

  useEffect(() => {
    const q = query(collection(db, 'homework'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHomeworkList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Homework)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homework');
    });

    return () => unsubscribe();
  }, []);

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomework.title || !newHomework.description || !newHomework.deadline) return;

    setLoading(true);
    try {
      const homeworkData = {
        ...newHomework,
        teacherId: auth.currentUser?.uid || 'anonymous',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'homework'), homeworkData);

      // Notify all parents/students in that class
      // For simplicity, we notify all parents if class matches
      students.forEach(student => {
        if (student.class === newHomework.classId || !student.class) {
          notificationService.createNotification({
            userId: student.id,
            title: "Yeni Ödev Atandı! 📝",
            content: `${newHomework.title}: ${newHomework.description.substring(0, 50)}...`,
            type: 'performance',
            link: 'homework'
          });
        }
      });

      setShowAddModal(false);
      setNewHomework({
        title: '',
        description: '',
        deadline: format(new Date(), 'yyyy-MM-dd'),
        classId: '9-A'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'homework');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!window.confirm('Bu ödevi silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'homework', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `homework/${id}`);
    }
  };

  const getStatusColor = (deadline: string) => {
    const date = new Date(deadline);
    const today = new Date();
    const diff = differenceInDays(date, today);

    if (isPast(date) && diff < 0) return 'bg-error/10 text-error border-error/20';
    if (diff <= 2) return 'bg-accent/10 text-accent border-accent/20';
    return 'bg-green-500/10 text-green-600 border-green-500/20';
  };

  const getStatusText = (deadline: string) => {
    const date = new Date(deadline);
    const today = new Date();
    const diff = differenceInDays(date, today);

    if (isPast(date) && diff < 0) return 'Süresi Doldu';
    if (diff <= 2) return `Son ${diff < 0 ? 0 : diff} Gün!`;
    return `${diff} Gün Kaldı`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Ödev Takibi</h1>
          <p className="text-on-surface-variant font-medium">Eğitim gelişimini ve görevleri buradan takip edebilirsiniz.</p>
        </div>
        {isTeacher && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform active:scale-95"
          >
            <Plus size={20} />
            <span className="font-semibold">Yeni Ödev Ekle</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Homework List */}
        <div className="lg:col-span-2 space-y-4">
          {homeworkList.length === 0 ? (
            <div className="info-card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList size={32} className="text-outline-variant" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Henüz Ödev Yok</h3>
              <p className="text-on-surface-variant max-w-xs mx-auto">
                {isTeacher ? 'Öğrencilerinize ilk ödevini atamak için "Yeni Ödev Ekle" butonuna tıklayın.' : 'Henüz atanmış bir ödeviniz bulunmuyor.'}
              </p>
            </div>
          ) : (
            homeworkList.map((hw) => (
              <motion.div 
                layout
                key={hw.id}
                className="info-card flex flex-col gap-4 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase">
                        {hw.classId}
                      </span>
                      <div className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${getStatusColor(hw.deadline)}`}>
                        {getStatusText(hw.deadline)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{hw.title}</h3>
                  </div>
                  {isTeacher && (
                    <button 
                      onClick={() => handleDeleteHomework(hw.id)}
                      className="p-2 text-outline-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <p className="text-on-surface-variant leading-relaxed">
                  {hw.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-4 text-xs font-medium text-outline">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-accent" />
                      <span>{format(new Date(hw.deadline), 'd MMMM yyyy', { locale: tr })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-accent" />
                      <span>{format(new Date(hw.createdAt), 'HH:mm', { locale: tr })}</span>
                    </div>
                  </div>
                  {!isTeacher && (
                    <button className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
                      <CheckCircle2 size={14} />
                      <span>Tamamlandı Olarak İşaretle</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info/Stats Sidebar */}
        <div className="space-y-6">
          <div className="info-card">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-accent" />
              Sistem Durumu
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-container rounded-xl">
                <span className="text-sm font-medium">Bekleyen Ödevler</span>
                <span className="text-lg font-black text-accent">{homeworkList.filter(h => !isPast(new Date(h.deadline))).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-container rounded-xl">
                <span className="text-sm font-medium">Biten Ödevler</span>
                <span className="text-lg font-black text-outline">{homeworkList.filter(h => isPast(new Date(h.deadline))).length}</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-accent/5 rounded-xl border border-accent/10">
              <p className="text-[11px] leading-relaxed text-on-surface-variant italic">
                "Bilgi, paylaşılınca çoğalan tek hazinedir. Ödevlerinizi zamanında yaparak başarınızı taçlandırın."
              </p>
            </div>
          </div>

          <div className="info-card bg-black text-white border-none overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-secondary mb-2 uppercase tracking-wider">Enderun Notları</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                Ödevlerin takibi velilerimiz için de büyük önem taşımaktadır. Gelişim Atlası üzerinden her adımda yanınızdayız.
              </p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">
                    {i}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-black bg-secondary flex items-center justify-center text-[10px] font-bold text-black whitespace-nowrap px-4">
                  +66
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>
        </div>
      </div>

      {/* Add Homework Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-3xl font-black text-primary mb-2">Yeni Ödev Atama</h2>
                <p className="text-on-surface-variant mb-8 font-medium">Öğrencileriniz için yeni bir görev oluşturun.</p>
                
                <form onSubmit={handleAddHomework} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Ödev Başlığı</label>
                    <input 
                      type="text"
                      value={newHomework.title}
                      onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-accent transition-all font-medium"
                      placeholder="Örn: Hafta Sonu KTS Hazırlığı"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Bitiş Tarihi</label>
                      <input 
                        type="date"
                        value={newHomework.deadline}
                        onChange={(e) => setNewHomework({...newHomework, deadline: e.target.value})}
                        className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-accent transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Sınıf</label>
                      <select 
                        value={newHomework.classId}
                        onChange={(e) => setNewHomework({...newHomework, classId: e.target.value})}
                        className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-accent transition-all font-medium"
                      >
                        <option value="9-A">9-A</option>
                        <option value="9-B">9-B</option>
                        <option value="10-A">10-A</option>
                        <option value="11-A">11-A</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Detaylı Açıklama</label>
                    <textarea 
                      rows={4}
                      value={newHomework.description}
                      onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-accent transition-all font-medium resize-none"
                      placeholder="Ödev gereksinimlerini buraya yazın..."
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-grow py-4 bg-surface-container font-bold text-primary rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-grow py-4 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={18} />
                          Ödevi Gönder
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
    </div>
  );
}
