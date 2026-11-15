import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { AccountRole, AuthAccount } from '../../types';

interface AuthPageProps {
  initialMode: AuthMode;
  initialRole?: AccountRole;
  onAuthenticated: (account: AuthAccount) => void;
}

type AuthMode = 'login' | 'signup';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export const AuthPage = ({ initialMode, initialRole = 'user', onAuthenticated }: AuthPageProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<AccountRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchRole = (nextRole: AccountRole) => {
    setRole(nextRole);
    setMessage('');
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const accountType = role === 'user' ? 'user' : 'food-partner';
      const response = await fetch(`${API_BASE_URL}/auth/${accountType}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          mode === 'login'
            ? { email, password }
            : { [role === 'user' ? 'fullName' : 'name']: fullName, email, password }
        ),
      });
      const data: { message?: string; account?: AuthAccount } = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Something went wrong. Please try again.');
      }

      if (!data.account) {
        throw new Error('Your account was created, but the session could not be started. Please log in.');
      }

      onAuthenticated(data.account);
      navigate('/', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 min-h-screen overflow-y-auto bg-[#080808]"
    >
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=2200&q=85"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/70" />
      </div>

      <button
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:text-[#C5A059] md:left-12 md:top-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Savora
      </button>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-24 md:px-12">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_480px]">
          <section className="hidden max-w-xl lg:block">
            <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[#C5A059]">
              <span className="h-px w-10 bg-[#C5A059]" />
              The Dining Atelier
            </p>
            <h1 className="font-serif text-7xl font-light leading-[0.9] text-white xl:text-9xl">
              A seat at
              <span className="gold-gradient-text block italic">our table.</span>
            </h1>
            <p className="mt-8 max-w-md text-base font-light leading-relaxed text-zinc-400">
              Keep your favourite moments, reservations, and seasonal discoveries together in one
              place.
            </p>
          </section>

          <section className="mx-auto w-full max-w-[480px] rounded-[2px] border border-white/10 bg-[#111113]/85 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#C5A059]">
                Savora account access
              </p>
              <h2 className="font-serif text-4xl font-light text-white">
                {mode === 'login' ? 'Welcome back.' : 'Join the table.'}
              </h2>
              <p className="mt-3 text-sm text-zinc-500">
                {mode === 'login'
                  ? 'Enter your details to continue your evening.'
                  : 'Create an account for a more personal Savora experience.'}
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-black/20 p-1">
              {([
                ['user', 'Guest'],
                ['foodPartner', 'Food partner'],
              ] as const).map(([accountRole, label]) => (
                <button
                  key={accountRole}
                  type="button"
                  onClick={() => switchRole(accountRole)}
                  className={`rounded-full py-3 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    role === accountRole
                      ? 'bg-[#C5A059] font-semibold text-[#080808]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mb-8 grid grid-cols-2 border-b border-white/10">
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchMode(tab)}
                  className={`relative pb-4 text-[10px] uppercase tracking-[0.25em] transition-colors ${
                    mode === tab ? 'text-[#C5A059]' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'login' ? 'Sign in' : 'Create account'}
                  {mode === tab && <span className="absolute inset-x-0 -bottom-px h-px bg-[#C5A059]" />}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {role === 'user' ? 'Full name' : 'Food partner name'}
                  </span>
                  <span className="relative block">
                    <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#C5A059]/70"
                      placeholder={role === 'user' ? 'Your name' : 'Restaurant or partner name'}
                    />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Email address
                </span>
                <span className="relative block">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#C5A059]/70"
                    placeholder="you@example.com"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Password
                </span>
                <span className="relative block">
                  <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#C5A059]/70"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              {message && (
                <p className="text-sm text-red-300">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 bg-[#C5A059] py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#080808] transition-colors hover:bg-[#d6b46b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Opening...' : mode === 'login' ? 'Enter Savora' : 'Create account'}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-7 text-center text-[10px] leading-relaxed text-zinc-600">
              By continuing, you agree to receive occasional notes about Savora&apos;s menus and
              experiences.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
