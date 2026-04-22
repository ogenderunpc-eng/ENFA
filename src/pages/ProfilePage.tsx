import React from 'react';
import { Settings, LogOut, Shield, Bell, CreditCard, Award, Book, CheckCircle2, ArrowRight, ArrowLeft, Lock, Plus, History, FileText, CreditCard as CardIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { USER_STATS } from '../constants';
import { Role } from '../types';

interface ProfilePageProps {
  role: Role;
  userAvatar: string;
  onLogout: () => void;
  onUpdateAvatar: (url: string) => void;
}

export default function ProfilePage({ role, userAvatar, onLogout, onUpdateAvatar }: ProfilePageProps) {
  const [activeSetting, setActiveSetting] = React.useState<string | null>(null);
  const [showToast, setShowToast] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState('Aeon Pro Plus');
  const [tempAvatarUrl, setTempAvatarUrl] = React.useState(userAvatar);
  
  // Password Change States
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordStep, setPasswordStep] = React.useState<'verify' | 'new'>('verify');
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pwdError, setPwdError] = React.useState<string | null>(null);

  const toastSuccess = (msg: string) => {
    console.log(msg); // Placeholder for actual toast message usage if needed
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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

            {activeSetting === 'security' && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900 text-sm">Hesap Güvenliği: Orta</h5>
                    <p className="text-xs text-blue-700">İki faktörlü doğrulamayı açarak hesabınızı daha güvenli hale getirin.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Oturum İşlemleri</h4>
                    {isChangingPassword && (
                      <button 
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordStep('verify');
                          setOldPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPwdError(null);
                        }}
                        className="text-xs font-bold text-error"
                      >
                        İptal Et
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {!isChangingPassword ? (
                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Lock size={18} className="text-outline" />
                          <span className="font-bold text-primary text-sm">Şifre Değiştir</span>
                        </div>
                        <button 
                          onClick={() => setIsChangingPassword(true)} 
                          className="text-xs font-bold text-secondary"
                        >
                          Düzenle
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 bg-surface-container-low rounded-2xl space-y-4">
                        {passwordStep === 'verify' ? (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-primary">MEVCUT ŞİFREYİ DOĞRULA</p>
                            <input 
                              type="password" 
                              placeholder="Mevcut Şifreniz" 
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              className={`w-full bg-white border ${pwdError ? 'border-error' : 'border-outline-variant/20'} rounded-xl py-3 px-4 text-sm`}
                            />
                            {pwdError && <p className="text-[10px] font-bold text-error">{pwdError}</p>}
                            <button 
                              onClick={() => {
                                const current = localStorage.getItem('systemPassword') || '1212';
                                if (oldPassword === current) {
                                  setPasswordStep('new');
                                  setPwdError(null);
                                } else {
                                  setPwdError('Mevcut şifre hatalı!');
                                }
                              }}
                              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs"
                            >
                              Şifreyi Doğrula
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-primary">YENİ ŞİFRE BELİRLE</p>
                            <input 
                              type="password" 
                              placeholder="Yeni Şifre" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-white border border-outline-variant/20 rounded-xl py-3 px-4 text-sm"
                            />
                            <input 
                              type="password" 
                              placeholder="Yeni Şifre Tekrar" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`w-full bg-white border ${pwdError ? 'border-error' : 'border-outline-variant/20'} rounded-xl py-3 px-4 text-sm`}
                            />
                            {pwdError && <p className="text-[10px] font-bold text-error">{pwdError}</p>}
                            <button 
                              onClick={() => {
                                if (newPassword.length < 4) {
                                  setPwdError('Şifre en az 4 karakter olmalıdır!');
                                  return;
                                }
                                if (newPassword !== confirmPassword) {
                                  setPwdError('Şifreler eşleşmiyor!');
                                  return;
                                }
                                localStorage.setItem('systemPassword', newPassword);
                                setIsChangingPassword(false);
                                setPasswordStep('verify');
                                setOldPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                                setPwdError(null);
                                toastSuccess('Şifreniz başarıyla değiştirildi.');
                              }}
                              className="w-full py-3 bg-secondary text-white font-bold rounded-xl text-xs"
                            >
                              Yeni Şifreyi Kaydet
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Shield size={18} className="text-outline" />
                        <span className="font-bold text-primary text-sm">İki Faktörlü Doğrulama (2FA)</span>
                      </div>
                      <div className="w-12 h-6 bg-surface-container-high rounded-full relative p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Son Girişler</h4>
                  <div className="space-y-3">
                    {[
                      { device: 'iPhone 15 Pro - Chrome', location: 'İstanbul, TR', time: 'Şu an aktif' },
                      { device: 'MacBook Pro - Safari', location: 'Ankara, TR', time: '2 saat önce' }
                    ].map((login, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border border-outline-variant/10 rounded-2xl">
                        <History size={18} className="text-outline-variant" />
                        <div>
                          <p className="text-sm font-bold text-primary">{login.device}</p>
                          <p className="text-[10px] text-on-surface-variant">{login.location} • {login.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSetting === 'payment' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Mevcut Plan</p>
                        <h4 className="text-2xl font-black italic">{currentPlan}</h4>
                      </div>
                      <Award className="text-secondary" size={32} />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Sonraki Ödeme</p>
                        <p className="font-bold">12 Mayıs 2026</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Tutar</p>
                        <p className="text-xl font-black">₺249.00<span className="text-xs font-normal text-white/50">/ay</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                </div>

                <div className="flex gap-4 p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
                  <div className="flex-1">
                    <h5 className="font-bold text-primary text-sm">Planınızı Güncelleyin</h5>
                    <p className="text-xs text-on-surface-variant">Yıllık ödeme planına geçerek %20 tasarruf edin.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentPlan(currentPlan === 'Aeon Pro Plus' ? 'Aeon Kurumsal' : 'Aeon Pro Plus');
                      toastSuccess('Planınız başarıyla güncellendi.');
                    }}
                    className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all"
                  >
                    Detayları Gör
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Kayıtlı Kartlar</h4>
                    <button 
                      onClick={() => toastSuccess('Ödeme sistemleri şu an demo modundadır.')}
                      className="flex items-center gap-1 text-xs font-bold text-secondary bg-transparent border-none"
                    >
                      <Plus size={16} /> Yeni Ekle
                    </button>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center border border-outline-variant/10">
                        <CardIcon size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">•••• •••• •••• 4492</p>
                        <p className="text-[10px] text-on-surface-variant">Vadelik: 08/28</p>
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-secondary" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Fatura Geçmişi</h4>
                  <div className="space-y-2">
                    {[
                      { date: '12 Nisan 2026', amount: '₺249.00', status: 'Ödendi' },
                      { date: '12 Mart 2026', amount: '₺249.00', status: 'Ödendi' },
                      { date: '12 Şubat 2026', amount: '₺199.00', status: 'Ödendi' }
                    ].map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border-b border-outline-variant/5 last:border-none">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-outline-variant" />
                          <span className="text-sm font-medium text-primary">{invoice.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-primary">{invoice.amount}</span>
                          <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">{invoice.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                <div className="space-y-4">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Profil Fotoğrafı</label>
                  <div className="flex items-center gap-6 p-4 bg-surface-container-low rounded-2xl">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                      <img src={tempAvatarUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={tempAvatarUrl} 
                        onChange={(e) => setTempAvatarUrl(e.target.value)}
                        placeholder="Fotoğraf URL'si yapıştırın..." 
                        className="w-full bg-white border border-outline-variant/20 rounded-xl py-2 px-3 text-xs"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            onUpdateAvatar(tempAvatarUrl);
                            toastSuccess('Profil fotoğrafı güncellendi.');
                          }}
                          className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm"
                        >
                          Güncelle
                        </button>
                        <button 
                          onClick={() => setTempAvatarUrl(userAvatar)}
                          className="px-3 py-1.5 bg-surface-container text-primary text-[10px] font-bold rounded-lg"
                        >
                          Sıfırla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">E-posta Adresi</label>
                  <input type="email" placeholder="yılmaz@aeon.edu" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm" />
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

            {activeSetting !== 'notifications' && activeSetting !== 'settings' && activeSetting !== 'security' && activeSetting !== 'payment' && (
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

      {/* Profile Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[200] bg-primary text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl"
          >
            <CheckCircle2 className="text-secondary" size={24} />
            <span className="font-bold">İşlem başarıyla gerçekleştirildi!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
