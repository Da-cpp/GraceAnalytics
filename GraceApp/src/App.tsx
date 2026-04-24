import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import ApprovalList from './components/ApprovalList';

function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<{user: string, bot: string}[]>([]);
  
  const [activeTab, setActiveTab] = useState<'ai' | 'admin'>('ai');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid: string) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Critical Profile Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAskAI = async () => {
    if (!query.trim()) return;
    const mockResponse = `Analysis for "${query}": Based on 2026 data, the St. Catherine region shows optimal growth. I suggest looking at the Ewarton distribution hub for improvements.`;
    setChatLog([...chatLog, { user: query, bot: mockResponse }]);
    setQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-grace-light">
        <div className="text-grace-red animate-pulse font-black tracking-[0.3em] text-xl">GRACE SYSTEMS INITIALIZING</div>
      </div>
    );
  }

  if (!session) return <Auth />;

  if (!profile || profile.is_approved === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border-b-[12px] border-grace-red max-w-lg">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">CLEARANCE REQUIRED</h1>
          <p className="text-gray-500 text-lg mb-8">Greetings, {profile?.full_name || 'Staff'}. Your credentials are valid, but your access level is currently <span className="text-grace-red font-bold underline">PENDING</span>.</p>
          <button onClick={() => supabase.auth.signOut()} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-grace-red transition-all">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-grace-red tracking-tighter leading-none">GK Analytics</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enterprise Division 2026</p>
          </div>
          
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl ml-8">
            <button 
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ai' ? 'bg-white text-grace-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              INTELLIGENCE
            </button>
            {['manager', 'ceo'].includes(profile.role) && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'admin' ? 'bg-white text-grace-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ADMINISTRATION
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-gray-900 leading-none">{profile.full_name}</p>
            <p className="text-[10px] text-grace-red font-bold uppercase">{profile.role}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="bg-gray-900 text-white w-15 h-8 rounded flex items-center justify-center hover:bg-black transition-all shadow-md">
            <span className="text-[10px] font-bold">Log Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-900 uppercase">Live Connection</span>
                </div>
              </div>
              <div className="bg-grace-red p-6 rounded-2xl shadow-xl text-white">
                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">Vision 2030 Focus</h3>
                <p className="text-xl font-bold leading-tight italic">"Advancing Jamaica's productivity through AI-driven logistics."</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-[600px]">
              <div className="bg-gray-900 p-4 flex justify-between items-center">
                 <h3 className="text-white font-bold text-xs tracking-widest uppercase px-2">Assistant Terminal</h3>
                 <span className="text-[9px] bg-white/10 text-white/50 px-2 py-1 rounded">V.4.2.1-STABLE</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                {chatLog.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full mb-4 flex items-center justify-center border border-gray-100">
                      <span className="text-2xl">🇯🇲</span>
                    </div>
                    <p className="text-gray-400 text-sm italic">System standby. Enter a query to begin analysis.</p>
                  </div>
                ) : (
                  chatLog.map((chat, i) => (
                    <div key={i} className="space-y-4 animate-in slide-in-from-bottom-2">
                      <div className="flex justify-end">
                        <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tr-none text-sm font-medium max-w-[80%] border border-gray-200">
                          {chat.user}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border-l-4 border-grace-red p-5 rounded-2xl rounded-tl-none shadow-md text-gray-700 text-sm leading-relaxed max-w-[90%]">
                          {chat.bot}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-3 p-2 bg-white rounded-2xl border-2 border-gray-100 focus-within:border-grace-red transition-all shadow-inner">
                  <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium text-gray-900" 
                    placeholder="Analyze distribution center metrics..." 
                  />
                  <button onClick={handleAskAI} className="bg-grace-red text-white px-6 py-2 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg">
                    ANALYZE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ADMINISTRATION */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500">
             <div className="flex justify-between items-end mb-8">
               <div>
                 <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Administration</h2>
                 <p className="text-gray-500 font-medium">Review and authorize staff access requests.</p>
               </div>
               <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-[10px] font-black text-green-400 uppercase tracking-widest shadow-sm">
                 Security Level: High
               </div>
             </div>
             
             <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8">
                <ApprovalList />
             </div>
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
        GraceKennedy
      </footer>
    </div>
  );
}

export default App;