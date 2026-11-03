import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NeumorphicCard } from '../components/common/NeumorphicCard';
import { NeumorphicInput } from '../components/common/NeumorphicInput';
import { NeumorphicButton } from '../components/common/NeumorphicButton';
import { Lock, User, Eye, EyeOff, Sun, Moon, Shield, ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Iltimos, loginni kiriting.');
      return;
    }
    if (!password) {
      setError('Iltimos, parolni kiriting.');
      return;
    }

    setIsLoading(true);
    const res = await login(username, password);
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || 'Kirishda xatolik yuz berdi.');
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col justify-between px-4 py-3 sm:px-6 sm:py-4 bg-[#E9EDF2] dark:bg-[#171E2B] transition-colors duration-200 select-none">
      {/* Ambient Background with Official Renessans Emblem */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] dark:opacity-[0.14] scale-110 filter blur-[1px] transition-opacity duration-300"
          style={{ backgroundImage: `url('/renessans-logo.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E9EDF2]/40 to-[#E9EDF2]/90 dark:via-[#171E2B]/50 dark:to-[#171E2B]/95" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-[#D4AF37]/10 via-[#4361EE]/10 to-transparent rounded-full filter blur-3xl opacity-60 dark:opacity-40" />
      </div>

      {/* Top bar: Brand & Theme switch */}
      <header className="relative z-10 flex justify-between items-center max-w-5xl mx-auto w-full flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/renessans-logo.jpg"
            alt="Renessans"
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#D4AF37]/40 shadow-sm shadow-[#D4AF37]/20"
          />
          <span className="font-black text-lg tracking-tight text-day-accent dark:text-night-accent">
            Renessans
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="neu-icon-btn w-9 h-9 rounded-xl text-day-text dark:text-night-text"
          aria-label={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </header>

      {/* Center login card - strictly fitted without scroll */}
      <main className="relative z-10 w-full max-w-[420px] mx-auto my-auto flex-shrink-0">
        <NeumorphicCard className="p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-neu-card dark:shadow-neu-dark-card rounded-[26px] backdrop-blur-[2px]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto rounded-3xl neu-surface flex items-center justify-center p-1.5 mb-3 shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] ring-2 ring-[#D4AF37]/40 ring-offset-2 ring-offset-transparent">
              <img
                src="/renessans-logo.jpg"
                alt="Renessans"
                className="w-full h-full object-cover rounded-2xl shadow-inner"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-day-text dark:text-night-text tracking-tight">
              Renessans
            </h1>
            <p className="text-xs font-bold text-day-muted dark:text-night-muted mt-1 tracking-wide uppercase">
              O‘quv markazi boshqaruv tizimi
            </p>
            <div className="w-16 h-0.5 mx-auto mt-2 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <NeumorphicInput
              label="Foydalanuvchi logini"
              type="text"
              placeholder="Loginni kiriting"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <div className="relative">
              <NeumorphicInput
                label="Maxfiy parol"
                type={showPassword ? 'text' : 'password'}
                placeholder="Parolni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[35px] text-day-muted dark:text-night-muted hover:text-day-accent transition-colors"
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                group relative w-full h-14 mt-5 px-6 rounded-2xl select-none cursor-pointer
                flex items-center justify-center gap-3
                text-base font-extrabold tracking-wide
                text-white dark:text-[#0C121E]
                bg-gradient-to-r from-[#4361EE] via-[#4D6BF8] to-[#3B54EE]
                dark:from-[#8298FF] dark:via-[#8DA2FF] dark:to-[#738BFF]
                border border-white/35 dark:border-white/20
                shadow-[6px_8px_20px_rgba(67,97,238,0.36),-4px_-4px_14px_rgba(255,255,255,0.9)]
                dark:shadow-[6px_8px_22px_rgba(130,152,255,0.28),-4px_-4px_14px_rgba(255,255,255,0.04)]
                transition-all duration-200 ease-out
                hover:brightness-105 hover:scale-[1.01] hover:shadow-[7px_10px_24px_rgba(67,97,238,0.46),-5px_-5px_16px_rgba(255,255,255,0.95)]
                active:scale-[0.985] active:brightness-95 active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.28),inset_-2px_-2px_4px_rgba(255,255,255,0.2)]
                focus:outline-none focus:ring-2 focus:ring-day-accent dark:focus:ring-night-accent focus:ring-offset-2 dark:focus:ring-offset-[#1C2534]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
              "
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/20 dark:bg-black/15 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3)] transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  <span>Tizimga kirish</span>
                </>
              )}
            </button>
          </form>
        </NeumorphicCard>
      </main>

      {/* Official Legal Footer */}
      <footer className="text-center py-2 flex-shrink-0 text-xs text-day-muted dark:text-night-muted">
        <p className="font-bold text-day-text dark:text-night-text">“Sardoba language stars” MCHJ</p>
        <p className="text-[10px] opacity-75 mt-0.5">Barcha huquqlar himoyalangan &copy; 2026 Renessans</p>
      </footer>
    </div>
  );
};
