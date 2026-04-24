import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) alert(error.message);
      else alert('Request submitted! Approval required.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 selection:bg-red-100">
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        
        <div className="h-1.5 w-full bg-[#E21F26]" />

        <div className="p-10">
          <div className="mb-10">
            <h1 className="text-2xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
              <span className="text-[#E21F26]">GK Analytics</span>
              <span className="font-light text-gray-400">|</span> 
              Portal
            </h1>
            <p className="text-gray-500 text-[13px] mt-1 font-medium">
              {isSignUp ? 'Apply for staff credentials' : 'Sign in to your dashboard'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div className="group">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-[#E21F26]">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E21F26]/20 focus:border-[#E21F26] focus:bg-white outline-none transition-all text-sm"
                  required
                />
              </div>
            )}

            <div className="group">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-[#E21F26]">
                Corporate Email
              </label>
              <input
                type="email"
                placeholder="name@grace.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E21F26]/20 focus:border-[#E21F26] focus:bg-white outline-none transition-all text-sm"
                required
              />
            </div>

            <div className="group">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-[#E21F26]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E21F26]/20 focus:border-[#E21F26] focus:bg-white outline-none transition-all text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-[#E21F26] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-red-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                {isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
              </span>
              
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[13px] text-gray-400 font-medium hover:text-gray-600 transition-colors"
            >
              {isSignUp ? (
                <>Already a member? <span className="text-[#E21F26] font-bold underline-offset-4 hover:underline">Log in</span></>
              ) : (
                <>New staff? <span className="text-[#E21F26] font-bold underline-offset-4 hover:underline">Request access</span></>
              )}
            </button>
          </div>
        </div>

        <div className="bg-gray-50/50 py-4 border-t border-gray-100 text-center">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            256-bit Encrypted Security System
          </p>
        </div>
      </div>
    </div>
  );
}