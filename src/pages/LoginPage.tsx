import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role } from '../types';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<'selection' | 'login'>('selection');
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillTeacherCredentials = () => {
    setErrorMessage(null);
    setEmail('ogretmen@example.com');
    setPassword('password123');
    setSelectedRole('teacher');
  };

  const fillStudentCredentials = () => {
    setErrorMessage(null);
    setEmail('ogrenci@example.com');
    setPassword('password123');
    setSelectedRole('student');
  };
  const [error, setError] = useState(false);
  const [faCode, setFaCode] = useState('');
  const [faError, setFaError] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError(false);
    setErrorMessage(null);
    setView('login');
  };

  useEffect(() => {
    // Check for magic link auto-login (from QR scan)
    const params = new URLSearchParams(window.location.search);
    const magicLink = params.get('magic_link');
    const roleParam = params.get('role') as Role;
    
    if (magicLink === 'true' && roleParam) {
      // Clear params and login
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const performMagicLogin = async () => {
        try {
          if (roleParam === 'teacher') {
            await signInWithEmailAndPassword(auth, 'ogretmen@example.com', 'password123');
          } else {
            // No student test account by default, sign in anonymously or just trust the role
            await signInAnonymously(auth);
          }
          onLogin(roleParam);
        } catch (err) {
          console.error('Magic link login failed:', err);
          // Fallback to manual login
          onLogin(roleParam);
        }
      };
      
      performMagicLogin();
    }
  }, [onLogin]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage(null);
    
    try {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        if (signInError.code === 'auth/operation-not-allowed') {
          throw signInError;
        }
        
        // Check if we should try to create a new user (auto-registration)
        const isUserNotFound = [
          'auth/user-not-found', 
          'auth/invalid-credential', 
          'auth/invalid-login-credentials'
        ].includes(signInError.code);

        if (isUserNotFound) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (selectedRole === 'teacher') {
              await setDoc(doc(db, 'teachers', user.uid), {
                name: email.split('@')[0],
                role: 'teacher',
                email: email
              });
            } else {
              await setDoc(doc(db, 'students', user.uid), {
                name: email.split('@')[0],
                role: 'parent',
                email: email,
                number: Math.floor(Math.random() * 9000 + 1000).toString(),
                grades: []
              });
            }
            await updateProfile(user, { displayName: email.split('@')[0] });
          } catch (signUpError: any) {
            // If email is already in use, it means the first sign-in failed due to wrong password
            if (signUpError.code === 'auth/email-already-in-use') {
              setErrorMessage('Hatalı şifre. Lütfen tekrar deneyin.');
              setError(true);
            } else {
              throw signUpError;
            }
          }
        } else {
          throw signInError;
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage('Firebase Konsolu üzerinden "Email/Password" giriş yöntemini etkinleştirmeniz gerekmektedir.');
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
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
              <h1 className="font-headline text-3xl font-extrabold tracking-tight mb-4">OGE Academy</h1>
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
              ) : (
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
                        placeholder={selectedRole === 'teacher' ? 'ogretmen@ogeacademy.com' : 'veli@ogeacademy.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      {errorMessage && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold text-error mt-2 ml-1 bg-error/5 p-3 rounded-lg border border-error/10"
                        >
                          {errorMessage}
                        </motion.p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={fillTeacherCredentials}
                          type="button"
                          className="bg-surface-container-low text-primary text-[10px] font-bold py-2 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
                        >
                          Öğretmen Test Hesabı
                        </button>
                        <button 
                          onClick={fillStudentCredentials}
                          type="button"
                          className="bg-surface-container-low text-primary text-[10px] font-bold py-2 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
                        >
                          Öğrenci Test Hesabı
                        </button>
                      </div>

                      <button 
                        className={`w-full ${selectedRole === 'teacher' ? 'bg-primary' : 'bg-secondary'} text-white font-headline font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50`} 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
                        {!loading && <ArrowRight size={18} />}
                      </button>
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
          © 2024 OGE Academy Bilgi Sistemleri. Tüm hakları saklıdır.
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
