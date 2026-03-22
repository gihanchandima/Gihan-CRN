import { useState, type FormEvent } from 'react';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthMode = 'login' | 'register';

const DEMO_ACCOUNTS = [
  { email: 'alex@nexacrm.com', password: 'demo123', role: 'Admin' },
  { email: 'sarah@nexacrm.com', password: 'demo123', role: 'Manager' },
];

export default function AuthScreen() {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Enter your name');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        await register(name, email, password);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Unable to create account');
      }
      return;
    }

    try {
      await login(email, password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <LockKeyhole className="h-4 w-4" />
              Secure CRM workspace
            </div>

            <h1 className="mt-6 max-w-2xl font-serif text-5xl tracking-tight text-white sm:text-6xl">
              Sign in to manage leads, contacts, and accounts.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
              Existing users can log in. New users can create an account and start with the CRM immediately.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map(account => (
                <div
                  key={account.email}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-sm font-medium text-white">{account.role} demo</p>
                  <p className="mt-2 text-sm text-slate-300">{account.email}</p>
                  <p className="text-sm text-slate-400">Password: {account.password}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md border-white/10 bg-white/95 text-slate-900 shadow-2xl">
              <CardHeader className="space-y-3">
                <div className="inline-flex rounded-full bg-slate-900 p-2 text-white">
                  {mode === 'login' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {mode === 'login' ? 'Login' : 'Create Account'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {mode === 'login'
                      ? 'Use your account to enter the CRM.'
                      : 'Create a new user account for this device.'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                  >
                    New User
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={event => setConfirmPassword(event.target.value)}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                      : (mode === 'login' ? 'Login' : 'Create Account')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
