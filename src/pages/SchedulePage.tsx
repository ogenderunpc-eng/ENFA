import React from 'react';
import { BookOpen, MapPin, Clock, User, MoreVertical, Lock, CheckCircle, BarChart3, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { CLASSES } from '../constants';

export default function SchedulePage() {
  const ongoingClass = CLASSES.find(c => c.status === 'ongoing');
  const otherClasses = CLASSES.filter(c => c.status !== 'ongoing');

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-secondary font-semibold tracking-widest text-xs uppercase mb-2 block">AKADEMİK TAKVİM</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter leading-tight">
              Haftalık Ders <br/>Programı
            </h2>
          </div>
          
          <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-full overflow-x-auto no-scrollbar">
            {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].map((day, i) => (
              <button 
                key={day}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  i === 0 ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Featured Class */}
        {ongoingClass && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-8 group relative overflow-hidden bg-primary-container rounded-xl aspect-[16/9] md:aspect-auto md:h-[450px] flex flex-col justify-end p-8 text-white"
          >
            <div className="absolute inset-0 z-0">
              <img 
                className="w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105" 
                src={ongoingClass.image} 
                alt={ongoingClass.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/40 to-transparent"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full uppercase tracking-widest">Şu An</span>
                <span className="text-white/60 text-sm font-medium">{ongoingClass.time}</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold font-headline mb-3">{ongoingClass.title}</h3>
              <p className="text-white/70 max-w-md mb-8">Veri yapıları ve karmaşıklık analizi üzerine derinlemesine bir bakış. Lab 4B salonunda devam ediyor.</p>
              
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all hover:opacity-90 active:scale-95">
                  <BookOpen size={18} />
                  Materyalleri Hazırla
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg font-bold transition-all hover:bg-white/20">
                  Ders Detayı
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Classes */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {otherClasses.map((c) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container-lowest p-6 rounded-xl relative group cursor-pointer transition-all hover:shadow-[0_12px_40px_rgba(0,30,64,0.06)]"
            >
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-secondary rounded-r-full"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-outline uppercase tracking-widest">{c.time}</span>
                <MoreVertical className="text-outline-variant" size={18} />
              </div>
              <h4 className="text-xl font-bold text-primary mb-1">{c.title}</h4>
              <p className="text-sm text-on-surface-variant mb-4">Dr. Aras Bulut • Amfi 2</p>
              
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Student" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+24</div>
              </div>
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container-lowest p-6 rounded-xl relative group cursor-pointer transition-all hover:shadow-[0_12px_40px_rgba(0,30,64,0.06)]"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-outline uppercase tracking-widest">13:30 - 15:00</span>
              <Lock className="text-outline-variant" size={18} />
            </div>
            <h4 className="text-xl font-bold text-primary mb-1">Kreatif Yazarlık</h4>
            <p className="text-sm text-on-surface-variant mb-4">Elif Şafak • Atölye 1</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">Ödev Teslimi</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-bold font-headline text-primary mb-6 flex items-center gap-3">
            <BarChart3 className="text-secondary" size={24} />
            Günün Özeti
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-6 p-5 bg-surface-container-low rounded-xl">
              <div className="w-12 h-12 flex-shrink-0 bg-primary/5 rounded-lg flex items-center justify-center">
                <BookOpen className="text-primary" size={24} />
              </div>
              <div className="flex-grow">
                <h5 className="font-bold text-primary">3 Yeni Okuma Materyali</h5>
                <p className="text-sm text-on-surface-variant">Siyaset Bilimi dersi için ek kaynaklar paylaşıldı.</p>
              </div>
              <button className="text-primary font-bold text-sm">Görüntüle</button>
            </div>
            <div className="flex items-center gap-6 p-5 bg-surface-container-low rounded-xl">
              <div className="w-12 h-12 flex-shrink-0 bg-secondary/5 rounded-lg flex items-center justify-center">
                <Bell className="text-secondary" size={24} />
              </div>
              <div className="flex-grow">
                <h5 className="font-bold text-primary">Sınav Hatırlatması</h5>
                <p className="text-sm text-on-surface-variant">Lineer Cebir vizesi için son 4 gün.</p>
              </div>
              <button className="text-primary font-bold text-sm">Takvime Ekle</button>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-high p-8 rounded-xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-6 shadow-xl">
            <CheckCircle className="text-secondary-container" size={40} />
          </div>
          <h4 className="text-xl font-bold text-primary mb-2">Haftalık İlerleme</h4>
          <p className="text-sm text-on-surface-variant mb-6">Bu hafta toplam 12 saat derse katılım sağladın. Hedefine çok yakınsın!</p>
          <div className="w-full bg-surface-container-highest h-2 rounded-full mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ duration: 1.5 }}
              className="bg-secondary h-full rounded-full" 
            />
          </div>
          <button className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-container transition-all">Analizi Gör</button>
        </div>
      </div>
    </div>
  );
}
