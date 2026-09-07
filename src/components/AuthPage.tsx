import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface AuthPageProps {
  onAuth: (token: string, username: string) => void;
  onGuest: () => void;
}

const API_URL = '/api';

export default function AuthPage({ onAuth, onGuest }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isSignUp ? `${API_URL}/signup` : `${API_URL}/signin`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onAuth(data.token, data.username);
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl mb-2 text-amber-900 text-center">🏴‍☠️ Treasure Hunt 🏴‍☠️</h1>
        <p className="text-amber-700 text-center mb-8">Sign in to save your scores</p>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-300 p-6">
          <div className="flex mb-6 rounded-lg overflow-hidden border border-amber-300">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                !isSignUp ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 hover:bg-amber-50'
              }`}
              onClick={() => { setIsSignUp(false); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                isSignUp ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 hover:bg-amber-50'
              }`}
              onClick={() => { setIsSignUp(true); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-amber-800 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-amber-800 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
                minLength={4}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onGuest}
            className="text-amber-600 hover:text-amber-800 underline text-sm transition-colors"
          >
            Play as Guest (scores won't be saved)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
