import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ApprovalList() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    const { data } = await supabase.from('profiles').select('*').eq('is_approved', false);
    setPendingUsers(data || []);
  }

  async function approveUser(id: string, role: string) {
    // Set local state to trigger a "leaving" animation immediately for better UX
    setIsDeleting(id);
    
    const { error } = await supabase.from('profiles').update({ is_approved: true, role }).eq('id', id);
    if (!error) {
        // Wait briefly for the animation to finish before refreshing list
        setTimeout(() => {
            fetchPending();
            setIsDeleting(null);
        }, 300);
    } else {
        setIsDeleting(null);
    }
  }

  async function declineUser(id: string) {
    if (!confirm("Are you sure you want to decline and remove this user?")) return;
    
    setIsDeleting(id);
    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      console.error('Error deleting user:', error.message);
      alert('Failed to delete user.');
      setIsDeleting(null);
    } else {
      setTimeout(() => {
        fetchPending();
        setIsDeleting(null);
      }, 300);
    }
  }

  return (
    <div className="mt-4">
      <h3 className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] border-b border-gray-100 mb-6 pb-2">
        Pending Staff Approvals
      </h3>
      
      <div className="space-y-3">
        {pendingUsers.length === 0 ? (
          <p className="text-gray-400 italic text-sm py-8 text-center animate-pulse">
            No pending requests at this time.
          </p>
        ) : (
          pendingUsers.map(user => (
            <div 
              key={user.id} 
              className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 border border-gray-100 p-5 rounded-2xl transition-all duration-300 transform
                ${isDeleting === user.id ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100 animate-in slide-in-from-top-2 fade-in'}
                hover:shadow-md hover:bg-white hover:border-grace-red/10 group`}
            >
              <div className="mb-4 md:mb-0">
                <p className="font-bold text-gray-900 group-hover:text-grace-red transition-colors">{user.full_name}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{user.role || 'Staff Candidate'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => approveUser(user.id, 'staff')} 
                  className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter hover:bg-green-600 transition-all active:scale-95 shadow-sm"
                >
                  Approve Staff
                </button>
                <button 
                  onClick={() => approveUser(user.id, 'manager')} 
                  className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter hover:bg-blue-600 transition-all active:scale-95 shadow-sm"
                >
                  Promote to Manager
                </button>
                <button 
                  onClick={() => declineUser(user.id)} 
                  className="bg-white text-gray-400 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter hover:bg-grace-red hover:text-white hover:border-grace-red transition-all active:scale-95 shadow-sm"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}