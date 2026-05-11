import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Download, ChevronRight, BarChart3, TrendingUp, Award, Clock, BookOpen, User, Users, Plus, X } from 'lucide-react';
import { Student, Role, KTSResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { notificationService } from '../services/notificationService';

interface KTSPageProps {
  students: Student[];
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
  role: Role;
}

export default function KTSPage({ students, setStudents, role }: KTSPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    role === 'parent' ? students[0] : null
  );
  const [selectedExam, setSelectedExam] = useState<KTSResult | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResult, setNewResult] = useState({
    examName: '',
    score: '',
    correct: '',
    wrong: '',
    empty: '',
    date: new Date().toLocaleDateString('tr-TR'),
    rankClass: '',
    rankSchool: '',
    rankGeneral: ''
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.number.includes(searchTerm)
  );

  const handleAddResult = async () => {
    if (!selectedStudent) return;

    const result: KTSResult = {
      id: Math.random().toString(36).substr(2, 9),
      examName: newResult.examName || `KTS Deneme ${allExams.length + 1}`,
      score: parseFloat(newResult.score) || 0,
      correct: parseInt(newResult.correct) || 0,
      wrong: parseInt(newResult.wrong) || 0,
      empty: parseInt(newResult.empty) || 0,
      date: newResult.date,
      rankClass: parseInt(newResult.rankClass) || 1,
      rankSchool: parseInt(newResult.rankSchool) || 1,
      rankGeneral: parseInt(newResult.rankGeneral) || 1
    };

    try {
      await updateDoc(doc(db, 'students', selectedStudent.id), {
        ktsResults: [result, ...(selectedStudent.ktsResults || [])]
      });
      
      // Notify student/parent about the new result
      await notificationService.createNotification({
        userId: selectedStudent.id,
        title: "Yeni Sınav Sonucu 📊",
        content: `${result.examName} sonucu açıklandı! Puanınız: ${result.score}`,
        type: 'performance',
        link: 'kts'
      });
      
      setShowAddModal(false);
      setNewResult({
        examName: '',
        score: '',
        correct: '',
        wrong: '',
        empty: '',
        date: new Date().toLocaleDateString('tr-TR'),
        rankClass: '',
        rankSchool: '',
        rankGeneral: ''
      });
      
      // Update local state briefly to show feedback before Firestore sync
      const updatedStudent = {
        ...selectedStudent,
        ktsResults: [result, ...(selectedStudent.ktsResults || [])]
      };
      setSelectedStudent(updatedStudent);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${selectedStudent.id}`);
    }
  };

  // Calculate General Overview Data
  const allExams = Array.from(new Set(students.flatMap(s => s.ktsResults?.map(r => r.examName) || [])));
  const classTrendData = allExams.map(examName => {
    const results = students.flatMap(s => s.ktsResults?.filter(r => r.examName === examName) || []);
    const avgScore = results.length > 0 ? (results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0;
    const maxScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
    return {
      name: examName.replace('KTS Deneme ', '#'),
      avgScore: parseFloat(avgScore.toFixed(1)),
      maxScore: parseFloat(maxScore.toFixed(1)),
      participants: results.length
    };
  });

  const chartData = selectedStudent?.ktsResults?.map(r => ({
    name: r.examName.replace('KTS Deneme ', '#'),
    score: r.score,
    correct: r.correct,
  })) || [];

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSelectedExam(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tight">KTS Denemeleri</h2>
          <p className="text-on-surface-variant font-medium mt-1">Talebe gelişim ve sınav başarı raporları.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {role === 'teacher' && selectedStudent && (
            <button 
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 bg-surface-container text-primary font-bold rounded-xl text-xs hover:bg-surface-container-high transition-colors"
            >
              Genel Bakışa Dön
            </button>
          )}
          {role === 'teacher' && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                type="text" 
                placeholder="Talebe veya No Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
          )}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar for Teachers */}
        {role === 'teacher' && (
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-primary uppercase tracking-widest">Talebe Listesi</h3>
                <span className="bg-primary/5 text-primary text-[10px] font-black px-2 py-1 rounded-md">{filteredStudents.length}</span>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStudents.map((student) => (
                  <button 
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedStudent?.id === student.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-surface-container'}`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                      <img src={student.avatar || `https://i.pravatar.cc/150?u=${student.name}`} alt={student.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-none mb-1">{student.name}</p>
                      <p className={`text-[10px] font-medium ${selectedStudent?.id === student.id ? 'text-white/70' : 'text-on-surface-variant'}`}>{student.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <button className="w-full py-4 bg-secondary/10 text-secondary font-black rounded-2xl border border-secondary/20 flex items-center justify-center gap-2 text-xs">
              <Download size={16} />
              TÜM LİSTEYİ İNDİR
            </button>
          </motion.aside>
        )}

        {/* Content Area */}
        <main className={`${role === 'teacher' ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-8`}>
          {selectedStudent ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Student Overview Header */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-surface shadow-xl">
                    <img src={selectedStudent.avatar || `https://i.pravatar.cc/150?u=${selectedStudent.name}`} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary">{selectedStudent.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-full uppercase tracking-widest">{selectedStudent.class}</span>
                      <span className="text-xs text-on-surface-variant font-bold">No: {selectedStudent.number}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Giriş Yapılan Deneme</p>
                    <p className="text-2xl font-black text-primary">{selectedStudent.ktsResults?.length || 0}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Ortalama Puan</p>
                    <p className="text-2xl font-black text-primary">
                      {selectedStudent.ktsResults && selectedStudent.ktsResults.length > 0 
                        ? (selectedStudent.ktsResults.reduce((acc, curr) => acc + curr.score, 0) / selectedStudent.ktsResults.length).toFixed(1)
                        : '0'}
                    </p>
                  </div>
                  <div className="text-center md:text-left hidden sm:block">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">En Yüksek Puan</p>
                    <p className="text-2xl font-black text-secondary">
                      {selectedStudent.ktsResults && selectedStudent.ktsResults.length > 0 
                        ? Math.max(...selectedStudent.ktsResults.map(r => r.score)).toFixed(1)
                        : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts & Table */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Chart */}
                <div className="xl:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/5">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-black text-primary flex items-center gap-2">
                       <TrendingUp className="text-secondary" size={20} />
                       Puan Gelişimi
                    </h4>
                    {role === 'teacher' && (
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black rounded-xl text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        <Plus size={16} />
                        DEĞER GİR
                      </button>
                    )}
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#001e40" 
                          strokeWidth={4} 
                          dot={{ fill: '#006b5e', strokeWidth: 2, r: 6, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="xl:col-span-2 flex flex-col gap-4">
                  <div className="bg-primary text-white rounded-3xl p-8 relative overflow-hidden flex-1">
                    <Award className="absolute top-0 right-0 m-4 opacity-10" size={80} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6">Genel Başarı Durumu</h4>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                         <span className="text-sm font-medium opacity-80">Sınıf Derecesi</span>
                         <span className="text-3xl font-black">{selectedStudent.ktsResults?.[0]?.rankClass || '-'}.</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                         <span className="text-sm font-medium opacity-80">Okul Derecesi</span>
                         <span className="text-2xl font-black">{selectedStudent.ktsResults?.[0]?.rankSchool || '-'}.</span>
                      </div>
                      <div className="flex justify-between items-end pb-2">
                         <span className="text-sm font-medium opacity-80">Genel Derece</span>
                         <span className="text-xl font-black">{selectedStudent.ktsResults?.[0]?.rankGeneral || '-'}.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/5 border border-secondary/20 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <h5 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Tahmini LGS Yüzdesi</h5>
                      <p className="text-2xl font-black text-primary">%2.4 - %3.8</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-sm">
                      <BarChart3 size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam History Table */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/5">
                <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between">
                  <h4 className="text-lg font-black text-primary flex items-center gap-2">
                     <Clock className="text-secondary" size={20} />
                     Deneme Geçmişi
                  </h4>
                  <button className="p-2 hover:bg-surface-container rounded-lg text-outline-variant transition-colors">
                    <Download size={20} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest">Deneme Adı</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Doğru</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Yanlış</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Boş</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Puan</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Gelişim</th>
                        <th className="px-8 py-5 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {selectedStudent.ktsResults?.map((kts, idx) => (
                        <tr key={kts.id} className="hover:bg-surface-container-lowest transition-colors group">
                          <td className="px-8 py-6">
                            <div>
                              <p className="text-sm font-black text-primary">{kts.examName}</p>
                              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{kts.date}</p>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-600 font-black text-xs">
                               {kts.correct}
                             </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 font-black text-xs">
                               {kts.wrong}
                             </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 font-black text-xs">
                               {kts.empty}
                             </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <p className="text-lg font-black text-primary">{kts.score}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <div className="flex items-center justify-center text-green-500 gap-1">
                               <TrendingUp size={14} />
                               <span className="text-[10px] font-black">+12.4</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => setSelectedExam(kts)}
                              className="p-2 text-outline-variant hover:bg-surface-container hover:text-primary rounded-xl transition-all"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            /* General Class Overview */
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest">Sınıf Mevcudu</h4>
                  </div>
                  <p className="text-3xl font-black text-primary">{students.length} Talebe</p>
                  <p className="text-[10px] text-on-surface-variant font-bold mt-1 tracking-widest">AKTİF KAYITLI</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-secondary/5 text-secondary rounded-xl flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest">Genel Puan Ort.</h4>
                  </div>
                  <p className="text-3xl font-black text-primary">378.4</p>
                  <p className="text-[10px] text-green-500 font-bold mt-1 tracking-widest">↑ %4.2 GELİŞİM</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest">Sınav Katılımı</h4>
                  </div>
                  <p className="text-3xl font-black text-primary">%{((classTrendData[0]?.participants / students.length) * 100).toFixed(0)}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold mt-1 tracking-widest">SON SINAV BAZLI</p>
                </div>
              </div>

              {/* Class Performance Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/5">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-lg font-black text-primary flex items-center gap-2">
                       <TrendingUp className="text-secondary" size={20} />
                       Sınıf Başarı Grafiği
                    </h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">Tüm denemelerin sınıf ortalaması ve en yüksek puanları.</p>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={classTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                        }} 
                      />
                      <Legend iconType="circle" />
                      <Line 
                        name="Ortalama Puan"
                        type="monotone" 
                        dataKey="avgScore" 
                        stroke="#001e40" 
                        strokeWidth={4} 
                        dot={{ fill: '#001e40', r: 5 }}
                      />
                      <Line 
                        name="Zirve Puan"
                        type="monotone" 
                        dataKey="maxScore" 
                        stroke="#006b5e" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={{ fill: '#006b5e', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* General Exam History Table */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/5">
                <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between">
                  <h4 className="text-lg font-black text-primary flex items-center gap-2">
                     <BookOpen className="text-secondary" size={20} />
                     Tüm Deneme Geçmişi
                  </h4>
                  <button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                    <Download size={16} /> PDF Rapor
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest">Sınav</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Katılımcı</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Ortalama</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">En Yüksek</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-primary uppercase tracking-widest">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {classTrendData.map((exam, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-primary font-black text-xs">
                                {exam.name}
                              </div>
                              <div>
                                <p className="text-sm font-black text-primary">KTS Deneme {exam.name}</p>
                                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">KURUMSAL DENEME</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex items-center justify-center -space-x-2">
                              {students.slice(0, 3).map((s, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                  <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.name}`} alt="Student" />
                                </div>
                              ))}
                              <div className="w-8 h-8 rounded-full bg-surface-container border-2 border-white flex items-center justify-center text-[10px] font-black text-on-surface-variant">
                                +{exam.participants - 3}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className="text-lg font-black text-primary">{exam.avgScore}</span>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg">
                               <Award size={14} />
                               <span className="text-xs font-black">{exam.maxScore}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-full uppercase tracking-widest italic">TAMAMLANDI</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Exam Details Modal */}
      <AnimatePresence>
        {selectedExam && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExam(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                    <BarChart3 size={28} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-primary">{selectedExam.examName}</h4>
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{selectedExam.date} • Detaylı Analiz</p>
                  </div>
                </div>
                <button onClick={() => setSelectedExam(null)} className="p-3 hover:bg-surface-container rounded-2xl transition-colors">
                  <Download size={24} className="text-outline-variant" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 text-center">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Toplam Puan</p>
                    <p className="text-6xl font-black text-primary tabular-nums">{selectedExam.score}</p>
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl">
                        <span className="text-xs font-black">{selectedExam.correct} Doğru</span>
                      </div>
                      <div className="px-4 py-2 bg-red-50 text-red-600 rounded-xl">
                        <span className="text-xs font-black">{selectedExam.wrong} Yanlış</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 space-y-4">
                     <h5 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Başarı Karşılaştırması</h5>
                     <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-on-surface-variant">Sınıf Ortalaması (320)</span>
                            <span className="text-primary">+{(selectedExam.score - 320).toFixed(1)}</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                             <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-on-surface-variant">Okul Ortalaması (295)</span>
                            <span className="text-primary">+{(selectedExam.score - 295).toFixed(1)}</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                             <div className="h-full bg-secondary rounded-full" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-white rounded-3xl p-6 border border-outline-variant/10">
                      <h5 className="text-xs font-black text-primary uppercase tracking-widest mb-6">Konu Analizi</h5>
                      <div className="space-y-4">
                         {[
                           { subject: 'Matematik', rate: 92, color: 'bg-blue-500' },
                           { subject: 'Fen Bilimleri', rate: 75, color: 'bg-green-500' },
                           { subject: 'Türkçe', rate: 88, color: 'bg-orange-500' },
                           { subject: 'Tarih', rate: 100, color: 'bg-purple-500' },
                           { subject: 'İngilizce', rate: 65, color: 'bg-red-500' },
                         ].map((item, idx) => (
                           <div key={idx} className="flex items-center gap-4">
                             <div className="flex-1">
                               <div className="flex justify-between text-[10px] font-bold mb-1">
                                 <span className="text-primary">{item.subject}</span>
                                 <span className="text-on-surface-variant">%{item.rate}</span>
                               </div>
                               <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                                 <div className={`h-full ${item.color}`} style={{ width: `${item.rate}%` }}></div>
                               </div>
                             </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-primary text-white rounded-3xl p-6">
                      <h5 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-80">Enderun Gelişim Tavsiyesi</h5>
                      <p className="text-xs leading-relaxed opacity-90">
                        Talebenin Fen Bilimleri dersinde "Madde ve Isı" ünitesindeki yanlış oranı dikkat çekiyor. Bir sonraki denemeye kadar bu ünite üzerindeki eksik kazanımlar tamamlanmalıdır.
                      </p>
                   </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-outline-variant/10 text-center">
                 <button 
                  onClick={() => setSelectedExam(null)}
                  className="px-10 py-4 bg-surface-container-high text-primary font-black rounded-2full hover:bg-slate-200 transition-all text-xs"
                 >
                   MODALİ KAPAT
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Result Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                    <Plus size={28} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-primary">Yeni Deneme Verisi</h4>
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{selectedStudent?.name} - Gelişim Girişi</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-surface-container rounded-2xl transition-colors">
                  <X size={24} className="text-outline-variant" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Deneme Adı</label>
                    <input 
                      type="text" 
                      placeholder="Örn: KTS Deneme 5"
                      value={newResult.examName}
                      onChange={(e) => setNewResult({...newResult, examName: e.target.value})}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Sınav Puanı</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newResult.score}
                      onChange={(e) => setNewResult({...newResult, score: e.target.value})}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Doğru</label>
                      <input 
                        type="number" 
                        value={newResult.correct}
                        onChange={(e) => setNewResult({...newResult, correct: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Yanlış</label>
                      <input 
                        type="number" 
                        value={newResult.wrong}
                        onChange={(e) => setNewResult({...newResult, wrong: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Boş</label>
                      <input 
                        type="number" 
                        value={newResult.empty}
                        onChange={(e) => setNewResult({...newResult, empty: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Sınav Tarihi</label>
                    <input 
                      type="text" 
                      value={newResult.date}
                      onChange={(e) => setNewResult({...newResult, date: e.target.value})}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Sınıf Der.</label>
                      <input 
                        type="number" 
                        value={newResult.rankClass}
                        onChange={(e) => setNewResult({...newResult, rankClass: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Okul Der.</label>
                      <input 
                        type="number" 
                        value={newResult.rankSchool}
                        onChange={(e) => setNewResult({...newResult, rankSchool: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2 px-1">Genel Der.</label>
                      <input 
                        type="number" 
                        value={newResult.rankGeneral}
                        onChange={(e) => setNewResult({...newResult, rankGeneral: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4">
                     <p className="text-[10px] text-secondary font-bold leading-relaxed">
                       * Girilen değerler öğrenci panelinde ve gelişim grafiklerinde anlık olarak güncellenecektir.
                     </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                 <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-surface-container text-on-surface-variant font-black rounded-2xl hover:bg-slate-200 transition-all text-xs"
                 >
                   İPTAL
                 </button>
                 <button 
                  onClick={handleAddResult}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all text-xs shadow-lg shadow-primary/20"
                 >
                   VERİLERİ KAYDET VE YAYINLA
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
