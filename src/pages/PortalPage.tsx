import React, { useState } from 'react';
import { UserPlus, CheckCircle2, XCircle, Clock, Search, Filter, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STUDENTS, CLASSES } from '../constants';
import { Student } from '../types';

export default function PortalPage() {
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', number: '' });

  const handleAttendance = (id: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.number) return;
    
    const student: Student = {
      id: Date.now().toString(),
      name: newStudent.name,
      number: newStudent.number,
      avatar: `https://i.pravatar.cc/150?u=${newStudent.name}`,
    };
    
    setStudents(prev => [...prev, student]);
    setNewStudent({ name: '', number: '' });
    setIsAddingStudent(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.number.includes(searchTerm)
  );

  return (
    <div className="space-y-12">
      {/* Today's Lessons Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Clock className="text-secondary" size={24} />
            Günün Dersleri
          </h3>
          <button className="text-secondary font-bold text-sm hover:underline">Tümünü Gör</button>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {CLASSES.map((c, i) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[300px] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 group cursor-pointer"
            >
              <div className="h-32 relative">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{c.time}</span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-primary mb-1 truncate">{c.title}</h4>
                <p className="text-xs text-on-surface-variant font-medium">{c.classGroup} • {c.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Attendance Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-1">Öğrenci Listesi & Yoklama</h3>
            <p className="text-sm text-on-surface-variant font-medium">Bugünkü dersler için katılım durumunu işaretleyin.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                type="text" 
                placeholder="Öğrenci ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface-container-low border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <button 
              onClick={() => setIsAddingStudent(true)}
              className="bg-primary text-white p-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50">
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest">Öğrenci</th>
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest">Numara</th>
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest text-center">Durum</th>
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-high/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20">
                          <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="font-bold text-primary text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-on-surface-variant">{s.number}</td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleAttendance(s.id, 'present')}
                          className={`p-2 rounded-lg transition-all ${s.status === 'present' ? 'bg-secondary text-white shadow-md' : 'bg-white text-outline hover:text-secondary'}`}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleAttendance(s.id, 'absent')}
                          className={`p-2 rounded-lg transition-all ${s.status === 'absent' ? 'bg-error text-white shadow-md' : 'bg-white text-outline hover:text-error'}`}
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleAttendance(s.id, 'late')}
                          className={`p-2 rounded-lg transition-all ${s.status === 'late' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-outline hover:text-orange-500'}`}
                        >
                          <Clock size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button className="text-outline hover:text-primary transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingStudent(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h4 className="text-2xl font-bold text-primary mb-6">Yeni Öğrenci Ekle</h4>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Öğrenci Numarası</label>
                  <input 
                    type="text" 
                    value={newStudent.number}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Örn: 1050"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingStudent(false)}
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
