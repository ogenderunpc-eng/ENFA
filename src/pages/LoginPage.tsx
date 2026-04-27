import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role } from '../types';

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<'selection' | 'login' | '2fa'>('selection');
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [faCode, setFaCode] = useState('');
  const [faError, setFaError] = useState(false);

  useEffect(() => {
    // Check for magic link auto-login (from QR scan)
    const params = new URLSearchParams(window.location.search);
    const magicLink = params.get('magic_link');
    const roleParam = params.get('role') as Role;
    
    if (magicLink === 'true' && roleParam) {
      // Clear params and login
      window.history.replaceState({}, document.title, window.location.pathname);
      onLogin(roleParam);
    }
  }, [onLogin]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError(false);
    setView('login');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('systemPassword') || '1212';
    if (password === storedPassword) {
      const isSmsEnabled = localStorage.getItem('2fa_sms') === 'true';
      const isAuthEnabled = localStorage.getItem('2fa_authenticator') === 'true';
      
      if (isSmsEnabled || isAuthEnabled) {
        setView('2fa');
      } else {
        onLogin(selectedRole);
      }
    } else {
      setError(true);
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default verification code is 123456
    if (faCode === '123456') {
      onLogin(selectedRole);
    } else {
      setFaError(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      <main className="w-full max-w-7xl px-6 flex-1 flex items-center justify-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,30,64,0.06)] w-full max-w-5xl"
        >
          {/* Left Side: Visual & Branding */}
          <div className="lg:col-span-5 bg-login-gradient relative p-12 flex flex-col justify-between text-white">
            <div className="z-10">
              <h1 className="font-headline text-3xl font-extrabold tracking-tight mb-4">Aeon Academy</h1>
              <p className="text-white/80 text-lg font-light leading-relaxed max-w-xs">
                Geleceğin eğitim vizyonuyla, akademik mükemmelliği ve kişisel gelişimi tek bir çatı altında buluşturuyoruz.
              </p>
            </div>
            
            <div className="z-10 mt-12">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/10">
                <Sparkles className="text-secondary-container mb-2" size={24} />
                <div className="space-y-3">
                  <p className="italic text-sm font-light leading-snug">
                    "Okul, geleceğin temeli"
                  </p>
                  <p className="italic text-sm font-light leading-snug">
                    "Bilgi en büyük hazinedir"
                  </p>
                  <p className="italic text-sm font-light leading-snug">
                    "Eğitimdir ki bir milleti hür yaşatır"
                  </p>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/60">Kurumsal Vizyon</p>
              </div>
            </div>

            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <img 
                className="w-full h-full object-cover mix-blend-overlay" 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200" 
                alt="Academy Background"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Right Side: Interaction & Form */}
          <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {view === 'selection' ? (
                <motion.div 
                  key="selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <header className="mb-10">
                    <h2 className="font-headline text-4xl font-bold text-primary mb-2 tracking-tight">Giriş Yapın</h2>
                    <p className="text-on-surface-variant">Lütfen devam etmek için giriş türünüzü seçin.</p>
                  </header>

                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => handleRoleSelect('teacher')}
                      className="group flex items-center p-6 rounded-2xl bg-surface-container-low border-2 border-transparent hover:border-primary hover:bg-surface-container-high transition-all text-left"
                    >
                      <div className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                        <GraduationCap size={32} />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-primary text-xl">Öğretmen Girişi</h4>
                        <p className="text-sm text-on-surface-variant">Ders yönetimi ve yoklama paneli</p>
                      </div>
                      <ArrowRight className="ml-auto text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" size={24} />
                    </button>

                    <button 
                      onClick={() => handleRoleSelect('parent')}
                      className="group flex items-center p-6 rounded-2xl bg-surface-container-low border-2 border-transparent hover:border-secondary hover:bg-surface-container-high transition-all text-left"
                    >
                      <div className="w-16 h-16 rounded-xl bg-secondary text-white flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                        <Users size={32} />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-primary text-xl">Veli Girişi</h4>
                        <p className="text-sm text-on-surface-variant">Öğrenci takibi ve performans raporları</p>
                      </div>
                      <ArrowRight className="ml-auto text-outline group-hover:text-secondary group-hover:translate-x-1 transition-all" size={24} />
                    </button>
                  </div>
                </motion.div>
              ) : view === 'login' ? (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <button 
                    onClick={() => setView('selection')}
                    className="flex items-center gap-2 text-sm font-bold text-secondary mb-8 hover:underline"
                  >
                    <ArrowRight className="rotate-180" size={16} />
                    Geri Dön
                  </button>

                  <header className="mb-10">
                    <h2 className="font-headline text-4xl font-bold text-primary mb-2 tracking-tight">
                      {selectedRole === 'teacher' ? 'Öğretmen Girişi' : 'Veli Girişi'}
                    </h2>
                    <p className="text-on-surface-variant">Lütfen kimlik bilgilerinizle giriş yapın.</p>
                  </header>

                  {/* Form */}
                  <form className="space-y-6" onSubmit={handleLoginSubmit}>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider ml-1">E-Posta Adresi</label>
                      <input 
                        className="w-full bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary py-4 px-4 text-on-surface placeholder:text-outline-variant transition-all" 
                        type="email" 
                        placeholder={selectedRole === 'teacher' ? 'ogretmen@aeonacademy.com' : 'veli@aeonacademy.com'}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider">Parola</label>
                        <button type="button" className="text-xs font-medium text-secondary hover:underline">Şifremi Unuttum</button>
                      </div>
                      <input 
                        className={`w-full bg-surface-container-high border-none rounded-xl focus:ring-2 ${error ? 'focus:ring-error ring-2 ring-error' : 'focus:ring-primary'} py-4 px-4 text-on-surface placeholder:text-outline-variant transition-all`} 
                        type="password" 
                        placeholder="••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(false);
                        }}
                        required
                      />
                      {error && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold text-error mt-2 ml-1"
                        >
                          Hatalı şifre. Lütfen tekrar deneyin.
                        </motion.p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                      <button 
                        className={`w-full ${selectedRole === 'teacher' ? 'bg-primary' : 'bg-secondary'} text-white font-headline font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2`} 
                        type="submit"
                      >
                        Sisteme Giriş Yap
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="2fa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <button 
                    onClick={() => {
                      setView('login');
                      setFaCode('');
                      setFaError(false);
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-secondary mb-8 hover:underline"
                  >
                    <ArrowRight className="rotate-180" size={16} />
                    Geri Dön
                  </button>

                  <header className="mb-10 text-center">
                    <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles size={40} />
                    </div>
                    <h2 className="font-headline text-4xl font-bold text-primary mb-2 tracking-tight">
                      İki Adımlı Doğrulama
                    </h2>
                    <p className="text-on-surface-variant">
                      Hesabınızı korumak için 2FA kodu gereklidir.
                    </p>
                  </header>

                  {/* 2FA Form */}
                  <form className="space-y-6" onSubmit={handle2FASubmit}>
                    <div className="space-y-4">
                      <p className="text-center text-xs font-bold text-primary uppercase tracking-widest bg-surface-container-high py-2 rounded-lg">
                        {localStorage.getItem('2fa_sms') === 'true' ? 'SMS KODUNU GİRİN' : 'AUTHENTICATOR KODUNU GİRİN'}
                      </p>
                      <input 
                        className={`w-full bg-surface-container-high border-none rounded-2xl focus:ring-2 ${faError ? 'focus:ring-error ring-2 ring-error' : 'focus:ring-primary'} py-5 text-center text-3xl font-black tracking-[0.5em] text-primary placeholder:text-outline-variant/30 transition-all outline-none`} 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        value={faCode}
                        onChange={(e) => {
                          setFaCode(e.target.value.replace(/[^0-9]/g, ''));
                          if (faError) setFaError(false);
                        }}
                        autoFocus
                        required
                      />
                      {faError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center text-xs font-bold text-error mt-2"
                        >
                          Hatalı doğrulama kodu. (İpucu: 123456)
                        </motion.p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                      <button 
                        className="w-full bg-primary text-white font-headline font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                        type="submit"
                      >
                        Doğrula ve Giriş Yap
                        <ArrowRight size={20} />
                      </button>
                      <p className="text-center text-[10px] text-on-surface-variant font-medium mt-4">
                        Sorun mu yaşıyorsunuz? <button type="button" className="text-secondary font-bold hover:underline">Destek ekibiyle iletişime geçin</button>
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-8 text-center border-t border-outline-variant/15">
        <p className="text-xs text-on-surface-variant/60 font-medium tracking-wide">
          © 2024 Aeon Academy Bilgi Sistemleri. Tüm hakları saklıdır.
        </p>
      </footer>

      {/* Floating Help */}
      <div className="fixed bottom-8 right-8 z-40 hidden md:flex items-center gap-3 bg-surface-container-lowest p-3 pr-5 rounded-full shadow-xl border border-outline-variant/10">
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
          <HelpCircle className="text-on-secondary-container" size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter leading-none">Yardım Masası</p>
          <p className="text-sm font-bold text-primary">Destek Alın</p>
        </div>
      </div>
    </div>
  );
}
