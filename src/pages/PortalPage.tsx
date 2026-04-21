import React, { useState } from 'react';
import { UserPlus, CheckCircle2, XCircle, Clock, Search, Filter, MoreHorizontal, GraduationCap, Plus, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, ClassSession, Grade } from '../types';

interface PortalPageProps {
  students: Student[];
  setStudents: (students: Student[] | ((prev: Student[]) => Student[])) => void;
  classes: ClassSession[];
}

export default function PortalPage({ students, setStudents, classes }: PortalPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isEnteringGrade, setIsEnteringGrade] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', number: '' });
  const [newGrade, setNewGrade] = useState({ subject: 'Matematik', value: '' });

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
      grades: []
    };
    
    setStudents(prev => [...prev, student]);
    setNewStudent({ name: '', number: '' });
    setIsAddingStudent(false);
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEnteringGrade || !newGrade.value) return;

    const grade: Grade = {
      subject: newGrade.subject,
      value: Number(newGrade.value),
      date: new Date().toLocaleDateString('tr-TR')
    };

    setStudents(prev => prev.map(s => 
      s.id === isEnteringGrade 
        ? { ...s, grades: [...(s.grades || []), grade] } 
        : s
    ));

    setNewGrade({ subject: 'Matematik', value: '' });
    setIsEnteringGrade(null);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setSelectedStudents(prev => prev.filter(sid => sid !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) return;
    if (window.confirm(`${selectedStudents.length} öğrenciyi silmek istediğinize emin misiniz?`)) {
      setStudents(prev => prev.filter(s => !selectedStudents.includes(s.id)));
      setSelectedStudents([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
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
          {classes.map((c, i) => (
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
            <p className="text-sm text-on-surface-variant font-medium">Bugünkü dersler için katılım durumunu işaretleyin ve not girişi yapın.</p>
          </div>
          
          <div className="flex gap-3">
            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedStudents([])}
                  className="px-4 py-2.5 rounded-xl text-outline hover:bg-surface-container-high transition-all text-xs font-bold"
                >
                  Seçimi Temizle
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="bg-error text-white px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-error/20"
                >
                  <Trash2 size={18} />
                  <span className="font-bold text-xs">Seçimleri Sil ({selectedStudents.length})</span>
                </button>
              </div>
            )}
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
                  <th className="p-5 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest">Öğrenci</th>
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest">Numara</th>
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest text-center">Yoklama</th>
                  <th className="p-5 text-xs font-bold text-primary uppercase tracking-widest text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className={`hover:bg-surface-container-high/30 transition-colors group ${selectedStudents.includes(s.id) ? 'bg-primary/5' : ''}`}>
                    <td className="p-5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary"
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => toggleSelectStudent(s.id)}
                      />
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => setViewingStudent(s)}
                        >
                          <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="cursor-pointer" onClick={() => setViewingStudent(s)}>
                          <span className="font-bold text-primary text-sm block hover:text-secondary transition-colors">{s.name}</span>
                          {s.grades && s.grades.length > 0 && (
                            <span className="text-[10px] text-secondary font-bold">Son Not: {s.grades[s.grades.length - 1].value}</span>
                          )}
                        </div>
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
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setIsEnteringGrade(s.id)}
                          className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Not Gir"
                        >
                          <GraduationCap size={20} />
                        </button>
                        <button 
                          onClick={() => setEditingStudent(s)}
                          className="p-2 text-outline hover:text-primary transition-colors"
                          title="Düzenle"
                        >
                          <Filter size={20} /> {/* Using Filter as edit for now or just generic icon if Edit is missing */}
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-2 text-outline hover:text-error transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
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

      {/* Edit Student Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingStudent(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h4 className="text-2xl font-bold text-primary mb-6">Öğrenciyi Düzenle</h4>
              <form onSubmit={handleEditStudent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Öğrenci Numarası</label>
                  <input 
                    type="text" 
                    value={editingStudent.number}
                    onChange={(e) => setEditingStudent({ ...editingStudent, number: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="flex-1 py-3 bg-surface-container-high text-primary font-bold rounded-xl hover:bg-surface-container-highest transition-all"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                  >
                    Güncelle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Details Modal */}
      <AnimatePresence>
        {viewingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingStudent(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container">
                    <img src={viewingStudent.avatar} alt={viewingStudent.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-extrabold text-primary">{viewingStudent.name}</h4>
                    <p className="text-on-surface-variant font-bold">No: {viewingStudent.number}</p>
                    <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      viewingStudent.status === 'present' ? 'bg-secondary/10 text-secondary' :
                      viewingStudent.status === 'absent' ? 'bg-error/10 text-error' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {viewingStudent.status === 'present' ? 'Derste' : viewingStudent.status === 'absent' ? 'Yok' : 'Geç Kaldı'}
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewingStudent(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h5 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <GraduationCap className="text-secondary" size={20} />
                    Akademik Başarılar & Notlar
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {viewingStudent.grades && viewingStudent.grades.length > 0 ? viewingStudent.grades.map((g, i) => (
                      <div key={i} className="bg-surface-container-low p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-tight">{g.subject}</p>
                          <p className="text-[10px] text-on-surface-variant">{g.date}</p>
                        </div>
                        <div className="text-2xl font-black text-secondary">{g.value}</div>
                      </div>
                    )) : (
                      <div className="col-span-2 py-8 text-center bg-surface-container-low rounded-2xl">
                        <p className="text-on-surface-variant text-sm font-medium">Henüz not girişi yapılmamış.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl">
                  <h5 className="text-sm font-bold text-primary mb-2">Öğretmen Görüşü</h5>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Öğrenci genel olarak derslere ilgili ve katılımı yüksek. Matematik alanındaki gelişimini son sınavlarda net bir şekilde görebiliyoruz.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grade Entry Modal */}
      <AnimatePresence>
        {isEnteringGrade && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnteringGrade(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-primary">Not Girişi</h4>
                <button onClick={() => setIsEnteringGrade(null)} className="text-outline hover:text-primary transition-colors">
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">
                <span className="font-bold text-primary">{students.find(s => s.id === isEnteringGrade)?.name}</span> için yeni not girişi yapın.
              </p>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Ders</label>
                  <select 
                    value={newGrade.subject}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option>Matematik</option>
                    <option>Fizik</option>
                    <option>Kimya</option>
                    <option>Biyoloji</option>
                    <option>Edebiyat</option>
                    <option>Tarih</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Not Değeri (0-100)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={newGrade.value}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Örn: 85"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEnteringGrade(null)}
                    className="flex-1 py-3 bg-surface-container-high text-primary font-bold rounded-xl hover:bg-surface-container-highest transition-all"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl shadow-lg shadow-secondary/20 hover:opacity-90 transition-all"
                  >
                    Notu Kaydet
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
