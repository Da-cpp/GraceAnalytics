import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ApprovalList() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    const { data } = await supabase.from('profiles').select('*').eq('is_approved', false);
    setPendingUsers(data || []);
  }

  async function approveUser(id: string, role: string) {
    const { error } = await supabase.from('profiles').update({ is_approved: true, role }).eq('id', id);
    if (!error) fetchPending();
  }

  return (
    <div className="mt-10">
      <h3 className="text-grace-grey border-b mb-4 pb-2">Pending Staff Approvals</h3>
      {pendingUsers.map(user => (
        <div key={user.id} className="flex justify-between items-center bg-grace-light p-4 mb-2 rounded">
          <span>{user.full_name} ({user.role})</span>
          <div className="flex gap-2">
             <button onClick={() => approveUser(user.id, 'staff')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve Staff</button>
             <button onClick={() => approveUser(user.id, 'manager')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Make Manager</button>
          </div>
        </div>
      ))}
    </div>
  );
}