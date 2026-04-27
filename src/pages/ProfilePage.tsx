import React, { useEffect, useRef } from 'react';
import { Settings, LogOut, Shield, Bell, CreditCard, Award, Book, CheckCircle2, ArrowRight, ArrowLeft, Lock, Plus, History, FileText, CreditCard as CardIcon, Smartphone, Camera, Upload, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { USER_STATS } from '../constants';
import { Role } from '../types';

interface ProfilePageProps {
  role: Role;
  userAvatar: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  isDeviceLinked: boolean;
  setIsDeviceLinked: (val: boolean) => void;
  onLogout: () => void;
  onUpdateAvatar: (url: string) => void;
  onUpdateProfile: (data: { avatar?: string; name?: string; email?: string; phone?: string }) => void;
}

export default function ProfilePage({ role, userAvatar, userName, userEmail, userPhone, isDeviceLinked, setIsDeviceLinked, onLogout, onUpdateAvatar, onUpdateProfile }: ProfilePageProps) {
  const [activeSetting, setActiveSetting] = React.useState<string | null>(null);
  const [showToast, setShowToast] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState('Aeon Pro Plus');
  
  // Local form states
  const [tempAvatarUrl, setTempAvatarUrl] = React.useState(userAvatar);
  const [tempName, setTempName] = React.useState(userName);
  const [tempEmail, setTempEmail] = React.useState(userEmail);
  const [tempPhone, setTempPhone] = React.useState(userPhone);

  const [isLinkingDevice, setIsLinkingDevice] = React.useState(false);
  const [linkStep, setLinkStep] = React.useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with props when they change (e.g. role switch)
  useEffect(() => {
    setTempAvatarUrl(userAvatar);
    setTempName(userName);
    setTempEmail(userEmail);
    setTempPhone(userPhone);
  }, [userAvatar, userName, userEmail, userPhone]);
  
  // Password Change States
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordStep, setPasswordStep] = React.useState<'verify' | 'new'>('verify');
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pwdError, setPwdError] = React.useState<string | null>(null);

  // 2FA States
  const [faMethods, setFaMethods] = React.useState({
    sms: localStorage.getItem('2fa_sms') === 'true',
    authenticator: localStorage.getItem('2fa_authenticator') === 'true'
  });
  const [isVerifyingFA, setIsVerifyingFA] = React.useState<string | null>(null);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [faError, setFaError] = React.useState<string | null>(null);

  const startToggle2FA = (method: 'sms' | 'authenticator') => {
    if (!faMethods[method]) {
      // Enabling - show verification
      setIsVerifyingFA(method);
      setVerificationCode('');
      setFaError(null);
    } else {
      // Disabling - direct
      const newState = { ...faMethods, [method]: false };
      setFaMethods(newState);
      localStorage.setItem(`2fa_${method}`, 'false');
      toastSuccess(`${method === 'sms' ? 'SMS' : 'Authenticator'} doğrulaması devre dışı bırakıldı.`);
    }
  };

  const verifyAndEnable = () => {
    if (verificationCode === '123456') { // Mock verification code
      const method = isVerifyingFA as 'sms' | 'authenticator';
      const newState = { ...faMethods, [method]: true };
      setFaMethods(newState);
      localStorage.setItem(`2fa_${method}`, 'true');
      setIsVerifyingFA(null);
      toastSuccess(`${method === 'sms' ? 'SMS' : 'Authenticator'} doğrulaması başarıyla aktif edildi.`);
    } else {
      setFaError('Hatalı doğrulama kodu. (İpucu: 123456)');
    }
  };

  const toastSuccess = (msg: string) => {
    console.log(msg); // Placeholder for actual toast message usage if needed
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const menuItems = [
    { id: 'security', icon: Shield, label: 'Güvenlik ve Gizlilik', color: 'text-blue-500' },
    { id: 'mobile', icon: Smartphone, label: 'Mobil Uygulama Bağla', color: 'text-purple-500' },
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
                  {userName}
                </h2>
                <p className="text-on-surface-variant font-medium">
                  {role === 'teacher' ? 'Matematik Bölüm Başkanı' : 'Veli'}
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

                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-wider">İki Adımlı Doğrulama</h4>
                      
                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Smartphone size={18} className="text-outline" />
                          <div className="flex flex-col">
                            <span className="font-bold text-primary text-sm">SMS ile Doğrulama</span>
                            <span className="text-[10px] text-on-surface-variant">Telefonunuza gelen kod ile giriş yapın</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => startToggle2FA('sms')}
                          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${faMethods.sms ? 'bg-secondary' : 'bg-outline-variant/30'}`}
                        >
                          <motion.div 
                            animate={{ x: faMethods.sms ? 26 : 2 }}
                            initial={false}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Shield size={18} className="text-outline" />
                          <div className="flex flex-col">
                            <span className="font-bold text-primary text-sm">Authenticator Uygulaması</span>
                            <span className="text-[10px] text-on-surface-variant">Google veya Microsoft Authenticator kullanın</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => startToggle2FA('authenticator')}
                          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${faMethods.authenticator ? 'bg-secondary' : 'bg-outline-variant/30'}`}
                        >
                          <motion.div 
                            animate={{ x: faMethods.authenticator ? 26 : 2 }}
                            initial={false}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
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

            {activeSetting === 'mobile' && (
              <div className="space-y-8">
                <div className="text-center space-y-4 max-w-md mx-auto">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-sm transition-colors ${isDeviceLinked ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                    {isDeviceLinked ? <ShieldCheck size={40} /> : <Smartphone size={40} />}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-primary">
                      {isDeviceLinked ? 'Cihaz Bağlandı' : 'Aeon Academy Mobil'}
                    </h4>
                    <p className="text-sm text-on-surface-variant">
                      {isDeviceLinked 
                        ? 'iPhone 15 Pro cihazınız başarıyla hesabınızla eşleştirildi.' 
                        : 'Aeon Academy deneyimini telefonunuza taşıyın ve anlık bildirimlerle her şeyden haberdar olun.'}
                    </p>
                  </div>
                </div>

                {isDeviceLinked ? (
                  <div className="space-y-6">
                    <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-outline-variant/10">
                             <Smartphone className="text-primary" size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">Ahmet's iPhone</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">Son senkronizasyon: Az önce</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                           <span className="text-[10px] font-bold text-green-600 uppercase">Aktif</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setIsDeviceLinked(false);
                        toastSuccess('Cihaz bağlantısı kesildi.');
                      }}
                      className="w-full py-4 text-error font-bold text-sm bg-error/10 rounded-2xl hover:bg-error/20 transition-all"
                    >
                      Cihazın Bağlantısını Kes
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
                    {isLinkingDevice ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                        {linkStep === 1 ? (
                          <>
                            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                            <div>
                               <p className="text-sm font-bold text-primary">QR Kod Okundu!</p>
                               <p className="text-xs text-on-surface-variant mt-1">Cihaz doğrulanıyor...</p>
                            </div>
                          </>
                        ) : (
                          <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-4"
                          >
                             <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200">
                                <CheckCircle2 size={32} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-primary">Bağlantı Başarılı!</p>
                                <p className="text-xs text-on-surface-variant mt-1">Bildirimler otomatik olarak aktif edildi.</p>
                             </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6">
                        <div className="p-4 bg-white rounded-2xl shadow-md border border-outline-variant/10">
                        <div 
                            onClick={() => {
                              setIsLinkingDevice(true);
                              setLinkStep(1);
                              setTimeout(() => setLinkStep(2), 2000);
                              setTimeout(() => {
                                setIsDeviceLinked(true);
                                setIsLinkingDevice(false);
                                toastSuccess('Mobil cihaz başarıyla bağlandı!');
                              }, 4000);
                            }}
                            className="w-48 h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden rounded-xl border border-dashed border-slate-300 cursor-pointer group"
                          >
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '?magic_link=true&role=' + role)}`} 
                              alt="QR Code" 
                              className="w-full h-full p-2 group-hover:blur-sm transition-all"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80">
                               <Sparkles className="text-secondary mb-2" size={32} />
                               <p className="text-[10px] font-bold text-primary text-center px-4 uppercase tracking-widest text-balance">Gerçek Cihazla Tarat veya Simüle Et</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-4">
                          <p className="text-xs font-bold text-primary uppercase tracking-widest">Nasıl Bağlanırım?</p>
                          <div className="space-y-3 text-left">
                            {[
                              "Aeon Academy uygulamasını App Store veya Play Store'dan indirin.",
                              "Uygulamayı açın ve 'Cihaz Eşle' seçeneğine dokunun.",
                              "Ekranda gördüğünüz QR kodu taratın."
                            ].map((step, i) => (
                              <div key={i} className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] flex-shrink-0 flex items-center justify-center font-bold">{i+1}</span>
                                <p className="text-xs text-on-surface-variant font-medium">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => toastSuccess('Doğrulama kodu SMS olarak gönderildi.')}
                          className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                          KOD GÖNDER (SMS)
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Profil Fotoğrafı</label>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                        <img 
                          src={tempAvatarUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                          onError={() => setTempAvatarUrl('https://ui-avatars.com/api/?name=User')}
                        />
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Camera size={16} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTempAvatarUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-3 w-full">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Fotoğraf Bağlantısı</p>
                        <input 
                          type="text" 
                          value={tempAvatarUrl} 
                          onChange={(e) => setTempAvatarUrl(e.target.value)}
                          placeholder="URL yapıştırın..." 
                          className="w-full bg-white border border-outline-variant/20 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-outline-variant/20 text-primary text-[10px] font-bold rounded-xl hover:bg-surface-container transition-colors shadow-sm"
                        >
                          <Upload size={14} /> Dosya Seç
                        </button>
                        <button 
                          onClick={() => setTempAvatarUrl(userAvatar)}
                          className="px-4 py-2 bg-surface-container-high text-primary text-[10px] font-bold rounded-xl"
                        >
                          Geri Al
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Ad Soyad</label>
                    <input 
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Adınız Soyadınız" 
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">E-posta Adresi</label>
                    <input 
                      type="email" 
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      placeholder="eposta@aeon.edu" 
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Telefon Numarası</label>
                    <input 
                      type="tel" 
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      placeholder="+90 5XX XXX XX XX" 
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Dil Tercihi</label>
                    <div className="relative">
                      <select className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm appearance-none outline-none">
                        <option>Türkçe (TR)</option>
                        <option>English (US)</option>
                        <option>Deutsch (DE)</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight className="rotate-90 text-outline-variant" size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onUpdateProfile({
                      avatar: tempAvatarUrl,
                      name: tempName,
                      email: tempEmail,
                      phone: tempPhone
                    });
                    toastSuccess('Değişiklikler başarıyla kaydedildi.');
                  }}
                  className="w-full py-5 bg-primary text-white font-black text-sm rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all mt-4"
                >
                  DEĞİŞİKLİKLERİ KAYDET
                </motion.button>
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

      {/* 2FA Verification Modal */}
      <AnimatePresence>
        {isVerifyingFA && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVerifyingFA(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto">
                  <Lock size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-primary">Doğrulama Kodu</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    {isVerifyingFA === 'sms' ? 'Telefonunuza gönderilen' : 'Authenticator uygulamanızdaki'} 6 haneli kodu girin.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className={`w-full text-center text-2xl font-black tracking-[0.5em] bg-surface-container-low border ${faError ? 'border-error' : 'border-outline-variant/20'} rounded-2xl py-4 focus:ring-2 focus:ring-primary/10 outline-none`}
                  />
                  {faError && <p className="text-xs font-bold text-error">{faError}</p>}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setIsVerifyingFA(null)}
                      className="py-4 bg-surface-container-high text-primary font-bold rounded-2xl text-sm"
                    >
                      İptal
                    </button>
                    <button 
                      onClick={verifyAndEnable}
                      className="py-4 bg-primary text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary/20"
                    >
                      Onayla
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
