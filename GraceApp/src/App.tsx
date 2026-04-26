import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import ApprovalList from './components/ApprovalList';
import ReactMarkdown from 'react-markdown';

function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<{user: string, bot: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'admin' | 'metrics'>('ai');  

  const chatContainerRef = useRef<HTMLDivElement>(null);

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


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatLog]);

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

    const userQuery = query;
    setChatLog(prev => [...prev, { user: userQuery, bot: "🔄 Analyzing internal documents..." }]);
    setQuery('');

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userQuery }),
      });

      if (!response.ok) throw new Error("API Connection Failed");

      const data = await response.json();

      setChatLog(prev => {
        const newLog = [...prev];
        newLog[newLog.length - 1].bot = data.answer;
        return newLog;
      });

    } catch (error) {
      console.error("AI Error:", error);
      setChatLog(prev => {
        const newLog = [...prev];
        newLog[newLog.length - 1].bot = "❌ Error: The Intelligence Core is unreachable. Please ensure the Python API is running.";
        return newLog;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-grace-light transition-opacity duration-1000">
        <div className="text-grace-red animate-pulse font-black tracking-[0.3em] text-xl scale-110">
          GRACE SYSTEMS INITIALIZING
        </div>
      </div>
    );
  }

  if (!session) return <Auth />;

  if (!profile || profile.is_approved === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border-b-[12px] border-grace-red max-w-lg">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">CLEARANCE REQUIRED</h1>
          <p className="text-gray-500 text-lg mb-8">Greetings, {profile?.full_name || 'Staff'}. Your credentials are valid, but your access level is currently <span className="text-grace-red font-bold underline">PENDING</span>.</p>
          <button onClick={() => supabase.auth.signOut()} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-grace-red transition-all active:scale-95 shadow-lg">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-grace-red tracking-tighter leading-none">GK Analytics</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enterprise Division 2026</p>
          </div>
          
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl ml-8">
            <button 
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'ai' ? 'bg-white text-grace-red shadow-md scale-105' : 'text-gray-500 hover:text-gray-700'}`}
            >
              INTELLIGENCE
            </button>


            {['manager', 'ceo'].includes(profile.role) && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'admin' ? 'bg-white text-grace-red shadow-md scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ADMINISTRATION
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center">
          <div className="relative group flex items-center gap-3 pl-4 border-l border-gray-100">
            
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-gray-900 leading-none">{profile.full_name}</p>
              <p className="text-[9px] text-grace-red font-bold uppercase tracking-tighter mt-1">{profile.role}</p>
            </div>

            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all group-hover:ring-4 ring-gray-50">
              <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-sm overflow-hidden">
                {profile.full_name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              
              <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] origin-top-right scale-95 group-hover:scale-100">
              <div className="p-2">
                <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                  <p className="text-xs font-black text-gray-900 leading-none">{profile.full_name}</p>
                  <p className="text-[9px] text-grace-red font-bold uppercase mt-1">{profile.role}</p>
                </div>
                
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="w-full text-left px-4 py-3 text-[11px] font-bold text-gray-400 hover:text-grace-red hover:bg-red-50 rounded-xl transition-all flex items-center justify-between group/item"
                >
                  LOG OUT
                  <svg className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-left-6 duration-500 fade-in">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-transform hover:scale-[1.02]">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-tighter">Live Connection</span>
                </div>
              </div>
              <div className="bg-grace-red p-6 rounded-2xl shadow-xl text-white overflow-hidden relative group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-2 relative z-10">Our 2030 Focus</h3>
                <p className="text-xl font-bold leading-tight italic relative z-10">"Advancing Jamaica's productivity through AI-driven logistics."</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-500">
              <div className="bg-gray-900 p-4 flex justify-between items-center">
                 <h3 className="text-white font-bold text-xs tracking-widest uppercase px-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-grace-red rounded-full animate-ping"></span>
                  Assistant Terminal
                 </h3>
                 <span className="text-[9px] bg-white/10 text-white/50 px-2 py-1 rounded font-mono">V.4.2.1-STABLE</span>
              </div>
              
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/50">
                {chatLog.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
                    <div className="w-16 h-16 bg-gray-50 rounded-full mb-4 flex items-center justify-center border border-gray-100 shadow-inner">
                      <span className="text-2xl">🇯🇲</span>
                    </div>
                    <p className="text-gray-400 text-sm italic">Enter a query to begin analysis.</p>
                  </div>
                ) : (
                  chatLog.map((chat, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-end animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tr-none text-sm font-medium max-w-[80%] border border-gray-200 shadow-sm">
                          {chat.user}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border-l-4 border-grace-red p-5 rounded-2xl rounded-tl-none shadow-md text-gray-700 text-sm leading-relaxed max-w-[90%]">

                          <div className="markdown-content">
                            <ReactMarkdown>
                              {chat.bot}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-3 p-2 bg-white rounded-2xl border-2 border-gray-100 focus-within:border-grace-red focus-within:ring-4 focus-within:ring-red-50 transition-all shadow-inner">
                  <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium text-gray-900" 
                    placeholder="Analyze metrics..." 
                  />
                  <button onClick={handleAskAI} className="bg-grace-red text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-red-700 hover:shadow-red-200 hover:shadow-lg active:scale-95 transition-all">
                    ANALYZE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-right-6 fade-in duration-500">
             <div className="flex justify-between items-end mb-8">
               <div>
                 <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Administration</h2>
                 <p className="text-gray-500 font-medium uppercase text-xs tracking-widest mt-1">Access Authorization Panel</p>
               </div>
               <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-[10px] font-black text-green-500 uppercase tracking-widest shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 Security Level: High
               </div>
             </div>
             
             <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 transition-all hover:shadow-2xl">
                <ApprovalList />
             </div>
          </div>
        )}

      
      </main>

      <footer className="p-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
        GraceKennedy Ltd. © 2026
      </footer>

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default App;