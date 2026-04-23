// import { useState } from 'react';
// import { supabase } from '../supabaseClient';

// export default function Auth() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { full_name: fullName } // This maps to the trigger we wrote earlier
//       }
//     });
//     if (error) alert(error.message);
//     else alert("Check your email! A manager will need to approve your account.");
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-8 border-t-4 border-grace-red shadow-lg bg-white rounded">
//       <h2 className="text-grace-red mb-6">Staff Access Request</h2>
//       <form onSubmit={handleSignUp} className="flex flex-col gap-4">
//         <input className="border p-2" type="text" placeholder="Full Name" onChange={e => setFullName(e.target.value)} />
//         <input className="border p-2" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
//         <input className="border p-2" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
//         <button className="btn-primary">Request Access</button>
//       </form>
//     </div>
//   );
// }

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
      // request access / sign u[]
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Access request submitted! Wait for manager approval.');
      }
    } else {
      //exsiting users
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-[#E21F26]">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#E21F26] mb-2 uppercase">GraceApp</h1>
            <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">
              {isSignUp ? 'Request Staff Access' : 'Secure Portal Login'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E21F26] outline-none transition-all text-black"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Corporate Email</label>
              <input
                type="email"
                placeholder="email@grace.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E21F26] outline-none transition-all text-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E21F26] outline-none transition-all text-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E21F26] text-white p-3 rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'SUBMIT REQUEST' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have credentials?' : 'New GraceKennedy staff?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-[#E21F26] font-bold hover:underline"
              >
                {isSignUp ? 'Log in here' : 'Request Access'}
              </button>
            </p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-[10px] text-gray-400 font-mono">AUTHORIZED PERSONNEL ONLY - 2026 SYSTEMS</p>
        </div>
      </div>
    </div>
  );
}