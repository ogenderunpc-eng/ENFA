import React, { useState } from 'react';
import { GraduationCap, Users, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Role } from '../types';

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      <main className="w-full max-w-7xl px-6 flex-1 flex items-center justify-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,30,64,0.06)] w-full"
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
                <p className="italic text-sm font-light leading-snug">
                  "Eğitim, bir kovanı doldurmak değil, bir ateşi yakmaktır."
                </p>
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
            <div className="max-w-md mx-auto w-full">
              <header className="mb-10">
                <h2 className="font-headline text-4xl font-bold text-primary mb-2 tracking-tight">Hoş Geldiniz</h2>
                <p className="text-on-surface-variant">Devam etmek için lütfen sistemdeki rolünüzü seçin.</p>
              </header>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setSelectedRole('teacher')}
                  className={`group flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all relative overflow-hidden ${
                    selectedRole === 'teacher' 
                      ? 'border-primary bg-surface-container-low' 
                      : 'border-transparent bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <GraduationCap className={`mb-3 ${selectedRole === 'teacher' ? 'text-primary' : 'text-on-surface-variant'}`} size={32} />
                  <span className={`font-headline font-bold text-sm ${selectedRole === 'teacher' ? 'text-primary' : 'text-on-surface-variant'}`}>Öğretmen</span>
                  {selectedRole === 'teacher' && (
                    <motion.div layoutId="check" className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </motion.div>
                  )}
                </button>

                <button 
                  onClick={() => setSelectedRole('parent')}
                  className={`group flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all relative overflow-hidden ${
                    selectedRole === 'parent' 
                      ? 'border-primary bg-surface-container-low' 
                      : 'border-transparent bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <Users className={`mb-3 ${selectedRole === 'parent' ? 'text-primary' : 'text-on-surface-variant'}`} size={32} />
                  <span className={`font-headline font-bold text-sm ${selectedRole === 'parent' ? 'text-primary' : 'text-on-surface-variant'}`}>Veli</span>
                  {selectedRole === 'parent' && (
                    <motion.div layoutId="check" className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </motion.div>
                  )}
                </button>
              </div>

              {/* Form */}
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(selectedRole); }}>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider ml-1">E-Posta Adresi</label>
                  <input 
                    className="w-full bg-surface-container-high border-none rounded-t-sm focus:ring-2 focus:ring-primary py-4 px-4 text-on-surface placeholder:text-outline-variant transition-all" 
                    type="email" 
                    placeholder="ornek@aeonacademy.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider">Parola</label>
                    <button type="button" className="text-xs font-medium text-secondary hover:underline">Şifremi Unuttum</button>
                  </div>
                  <input 
                    className="w-full bg-surface-container-high border-none rounded-t-sm focus:ring-2 focus:ring-primary py-4 px-4 text-on-surface placeholder:text-outline-variant transition-all" 
                    type="password" 
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3 py-2">
                  <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" id="remember" />
                  <label className="text-sm text-on-surface-variant cursor-pointer" htmlFor="remember">Beni hatırla</label>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    className="w-full bg-login-gradient text-white font-headline font-bold py-4 rounded-md shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                    type="submit"
                  >
                    Panele Giriş Yap
                    <ArrowRight size={18} />
                  </button>
                  <p className="text-center text-xs text-on-surface-variant mt-4">
                    Kaydınız yok mu? <button type="button" className="text-primary font-bold hover:underline">Kurumsal İletişim</button>
                  </p>
                </div>
              </form>
            </div>
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
