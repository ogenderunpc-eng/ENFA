import React from 'react';
import { Bell, Star, TrendingUp, MessageSquare, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { GRADE_UPDATES, TEACHER_COMMENTS } from '../constants';

export default function ParentDashboard() {
  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Hoş Geldiniz, Ahmet Bey</h2>
        <p className="text-on-surface-variant font-medium">Ali'nin bugünkü akademik durumu ve güncellemeleri aşağıdadır.</p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Notification Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden shadow-[0_12px_40px_rgba(0,30,64,0.06)] border-l-4 border-secondary"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-error relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              </span>
              <h3 className="text-lg font-bold text-primary">Yeni Duyuru</h3>
            </div>
            <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded">2 saat önce</span>
          </div>
          <p className="text-on-surface font-medium mb-4 leading-relaxed">
            Matematik öğretmeni Zeynep Hanım bir not paylaştı: "Ali'nin bugünkü trigonometri performansındaki artış takdire şayandı. Ödev takibini bu şekilde sürdürmesi başarısını sabitleyecektir."
          </p>
          <button className="text-sm font-bold text-secondary flex items-center gap-1 hover:gap-2 transition-all">
            Yanıtla <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* Grade Update Snapshot */}
        {GRADE_UPDATES.map((update) => (
          <motion.div 
            key={update.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-4 bg-primary-container rounded-xl p-6 text-white flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <Star className="text-secondary-container" size={32} fill="currentColor" />
                <span className="bg-white/10 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Güncel Not</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-1">{update.subject}: {update.grade}</h3>
              <p className="text-white/60 text-sm">{update.description}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/60">Sınıf Ortalaması: {update.average}</p>
            </div>
          </motion.div>
        ))}

        {/* Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 md:col-span-7 bg-surface-container-low rounded-xl p-8"
        >
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">Ders Bazlı Gelişim</h3>
              <p className="text-sm text-on-surface-variant">Son 4 Haftalık Performans Analizi</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Ali</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Sınıf</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[
              { label: 'MAT', ali: 85, sinif: 60 },
              { label: 'FİZ', ali: 90, sinif: 70 },
              { label: 'KİM', ali: 65, sinif: 55 },
              { label: 'EDEB', ali: 82, sinif: 80 },
              { label: 'TAR', ali: 75, sinif: 65 },
            ].map((data, i) => (
              <div key={data.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${data.sinif}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                    className="w-4 bg-outline-variant/30 rounded-t-sm" 
                  />
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${data.ali}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className="w-4 bg-secondary rounded-t-sm" 
                  />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">{data.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Teacher Comments */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-container-highest/30 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <MessageSquare className="text-secondary" size={20} />
              Öğretmen Görüşleri
            </h3>
            <div className="space-y-6">
              {TEACHER_COMMENTS.map((comment, i) => (
                <div key={comment.id} className="relative pl-6">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${i === 0 ? 'bg-secondary-container' : 'bg-primary-fixed-dim'}`}></div>
                  <p className="text-sm font-medium italic text-on-surface leading-relaxed mb-2">
                    "{comment.comment}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                      <img className="w-full h-full object-cover" src={comment.avatar} alt={comment.teacherName} referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[11px] font-bold text-on-surface-variant">{comment.teacherName}, {comment.subject}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary text-white rounded-xl p-6 flex items-center justify-between group cursor-pointer hover:bg-opacity-95 transition-all"
          >
            <div>
              <h4 className="font-bold text-lg">Veli Toplantısı</h4>
              <p className="text-white/60 text-xs">14 Aralık Perşembe, 18:30</p>
            </div>
            <Calendar className="opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
