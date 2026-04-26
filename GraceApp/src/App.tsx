import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import ApprovalList from './components/ApprovalList';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SpecialInsights = ({ content }: { content: string }) => {
  const isPayday = content.includes("PEAK PAYDAY") || content.includes("payday sensitivity");
  const isStrikeNow = content.includes("Strike Now");
  const isSaturated = content.includes("Market saturated");

  if (!isPayday && !isStrikeNow && !isSaturated) return null;

  return (
    <div className="mt-4 border-l-4 border-grace-red bg-red-50 p-4 rounded-r-xl animate-in slide-in-from-left-2 shadow-inner">
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
        <span className="text-[10px] font-black text-grace-red uppercase tracking-widest">Live Strategy Alert</span>
      </div>
      
      {isPayday && (
        <div className="mb-2">
          <p className="text-xs font-bold text-gray-900">💰 PAYDAY WINDOW ACTIVE</p>
          <p className="text-[11px] text-gray-600 italic">Consumer propensity is currently boosted by ~20% due to the monthly pay cycle.</p>
        </div>
      )}
      
      {isStrikeNow && (
        <div className="mt-2 pt-2 border-t border-red-100 flex items-start gap-2">
          <span className="text-lg">🚀</span>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight"> Recommendation</p>
            <p className="text-xs font-bold text-red-700">EXECUTE: STRIKE NOW</p>
            <p className="text-[11px] text-gray-600 leading-tight">High opportunity + high propensity. Prioritize immediate promotional deployment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

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
    setChatLog(prev => [...prev, { user: userQuery, bot: "🔄 Analyzing internal strategy documents..." }]);
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
        newLog[newLog.length - 1].bot = "❌ Error: The Intelligence Core is unreachable. Check your Python terminal.";
        return newLog;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F3F4F6]">
        <div className="text-grace-red animate-pulse font-black tracking-[0.3em] text-xl">
          GRACE SYSTEMS INITIALIZING
        </div>
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
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-grace-red tracking-tighter leading-none">GK Analytics</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enterprise Division 2026</p>
          </div>
          
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl ml-8">
            <button 
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ai' ? 'bg-white text-grace-red shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              INTELLIGENCE
            </button>
            {['manager', 'ceo'].includes(profile.role) && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'admin' ? 'bg-white text-grace-red shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ADMINISTRATION
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center">
            <div className="text-right hidden md:block mr-4">
              <p className="text-xs font-black text-gray-900 leading-none">{profile.full_name}</p>
              <p className="text-[9px] text-grace-red font-bold uppercase tracking-tighter mt-1">{profile.role}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold text-gray-400 hover:text-grace-red">LOG OUT</button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-tighter">Live Connection</span>
                </div>
              </div>

              <div className="bg-grace-red p-6 rounded-2xl shadow-xl text-white">
                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">Strategy 2026</h3>
                <p className="text-lg font-bold leading-tight italic">"Advancing Jamaica's productivity through AI-driven logistics."</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-[650px]">
              <div className="bg-gray-900 p-4 flex justify-between items-center">
                 <h3 className="text-white font-bold text-xs tracking-widest uppercase px-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-grace-red rounded-full animate-ping"></span>
                  Propensity Intelligence Terminal
                 </h3>
                 <span className="text-[9px] bg-white/10 text-white/50 px-2 py-1 rounded font-mono">MODEL-XG-01</span>
              </div>
              
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                {chatLog.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-400 text-sm italic">Analyze market penetration or specific parishes...</p>
                  </div>
                ) : (
                  chatLog.map((chat, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-end">
                        <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tr-none text-sm font-medium max-w-[80%] border border-gray-200 shadow-sm">
                          {chat.user}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border-l-4 border-grace-red p-5 rounded-2xl rounded-tl-none shadow-md text-gray-700 text-sm leading-relaxed max-w-[90%]">
                          <div className="markdown-content prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.bot}</ReactMarkdown>
                          </div>
                          
                          <SpecialInsights content={chat.bot} />
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
                    placeholder="Enter your question here..." 
                  />
                  <button onClick={handleAskAI} className="bg-grace-red text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-red-700 transition-all">
                    ANALYZE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8">
            <ApprovalList />
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
        GraceKennedy Ltd. © 2026
      </footer>
    </div>
  );
}

export default App;