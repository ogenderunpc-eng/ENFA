import React from 'react';
import { Settings, LogOut, Shield, Bell, CreditCard, Award, Book, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { USER_STATS } from '../constants';
import { Role } from '../types';

interface ProfilePageProps {
  role: Role;
  userAvatar: string;
  onLogout: () => void;
}

export default function ProfilePage({ role, userAvatar, onLogout }: ProfilePageProps) {
  const [activeSetting, setActiveSetting] = React.useState<string | null>(null);

  const menuItems = [
    { id: 'security', icon: Shield, label: 'Güvenlik ve Gizlilik', color: 'text-blue-500' },
    { id: 'notifications', icon: Bell, label: 'Bildirim Ayarları', color: 'text-orange-500' },
    { id: 'payment', icon: CreditCard, label: 'Ödeme ve Abonelik', color: 'text-green-500' },
    { id: 'settings', icon: Settings, label: 'Genel Ayarlar', color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-10">
      <AnimatePresence mode="wait">
        {!activeSetting ? (
          <motion.div 
            key="profile-main"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-10"
          >
            {/* Profile Header */}
            <section className="flex flex-col items-center text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary">
                  <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-surface-container">
                    <img 
                      src={userAvatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <CheckCircle2 size={16} />
                </div>
              </motion.div>

              <div>
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                  {role === 'teacher' ? 'Ahmet Yılmaz' : 'Ahmet Demir'}
                </h2>
                <p className="text-on-surface-variant font-medium">
                  {role === 'teacher' ? 'Matematik Bölüm Başkanı' : 'Ali Demir\'in Velisi'}
                </p>
              </div>
            </section>

            {/* Menu List */}
            <section className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
              {menuItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={i}
                    onClick={() => setActiveSetting(item.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors border-b border-outline-variant/10 last:border-none group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className={item.color} size={20} />
                      </div>
                      <span className="font-bold text-primary text-sm">{item.label}</span>
                    </div>
                    <ArrowRight className="text-outline-variant" size={18} />
                  </button>
                );
              })}
            </section>

            {/* Logout */}
            <button 
              onClick={onLogout}
              className="w-full py-4 flex items-center justify-center gap-2 text-error font-bold hover:bg-error/5 rounded-2xl transition-colors"
            >
              <LogOut size={20} />
              Oturumu Kapat
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="setting-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-outline-variant/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setActiveSetting(null)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <ArrowLeft className="text-primary" size={24} />
              </button>
              <h3 className="text-2xl font-black text-primary">
                {menuItems.find(m => m.id === activeSetting)?.label}
              </h3>
            </div>

            {activeSetting === 'notifications' && (
              <div className="space-y-6">
                {[
                  { label: 'Yeni Mesaj Bildirimi', desc: 'Bir veli mesaj gönderdiğinde bildirim al.' },
                  { label: 'Ders Hatırlatıcıları', desc: 'Dersinize 15 dakika kala hatırlatıcı al.' },
                  { label: 'Sistem Güncellemeleri', desc: 'Aeon Academy yeniliklerinden haberdar ol.' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                    <div>
                      <p className="font-bold text-primary text-sm">{s.label}</p>
                      <p className="text-xs text-on-surface-variant">{s.desc}</p>
                    </div>
                    <div className="w-12 h-6 bg-secondary rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSetting === 'settings' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">E-posta Adresi</label>
                  <input type="email" placeholder="yılmaz@aeon.edu" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Dil Tercihi</label>
                  <select className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4">
                    <option>Türkçe (TR)</option>
                    <option>English (US)</option>
                  </select>
                </div>
                <button className="w-full py-4 bg-primary text-white font-bold rounded-xl mt-4">Değişiklikleri Kaydet</button>
              </div>
            )}

            {activeSetting !== 'notifications' && activeSetting !== 'settings' && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto">
                  <Settings size={40} className="text-outline-variant" />
                </div>
                <p className="text-on-surface-variant font-medium">Bu bölüm yakında aktif edilecek.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
