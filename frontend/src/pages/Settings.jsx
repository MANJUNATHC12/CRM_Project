import { Shield, ShieldAlert, User, Trash2, ShieldCheck, Mail, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5146/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
      });
      if (!response.ok) {
         if (response.status === 403) throw new Error('You do not have permission to view users.');
         throw new Error('Failed to fetch users');
      }
      setUsers(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
       fetchUsers();
    } else {
       setLoading(false);
    }
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    setProcessingId(userId);
    try {
      const response = await fetch('http://localhost:5146/api/users/assign-role', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}` 
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      
      if (!response.ok) throw new Error('Failed to assign role');
      
      // Update local state without fetching all again to be snappy
      setUsers(users.map(u => {
         if (u.id === userId) return { ...u, roles: [newRole] };
         return u;
      }));
      alert(`Role successfully updated to ${newRole}`);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    
    setProcessingId(userId);
    try {
      const response = await fetch(`http://localhost:5146/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (user?.role !== 'Admin') {
     return (
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="max-w-md w-full bg-white border border-red-100 rounded-lg shadow-sm p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
                <p className="text-slate-500 text-sm">Role-based access rules and preferences are managed here. Only Administrators can view, edit, and give permissions.</p>
                <div className="pt-4 border-t border-slate-100 mt-4 text-xs font-medium text-slate-400">
                   Current Role: <span className="text-slate-700 uppercase">{user?.role}</span>
                </div>
            </div>
        </div>
     )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Security & Access Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Role-based access rules and preferences are managed here. Only admins can view, edit and give permissions.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium border border-emerald-200">
           <ShieldCheck size={16} /> Admin Mode
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100 font-medium text-sm">{error}</div>
      ) : (
        <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2"><User size={16} className="text-blue-500"/> User Management</h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
             {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading user registry...</div>
             ) : (
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">User Details</th>
                            <th className="px-6 py-4 font-medium">System Role</th>
                            <th className="px-6 py-4 font-medium" width="200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => {
                            const isCurrentUser = user.email === u.email;
                            const currentRole = u.roles?.[0] || 'User';
                            return (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0 select-none">
                                                {u.fullName?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{u.fullName} {isCurrentUser && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-2 uppercase font-bold tracking-wider">You</span>}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className={currentRole === 'Admin' ? 'text-amber-500' : 'text-slate-400'}/>
                                            <select 
                                                value={currentRole} 
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                disabled={isCurrentUser || processingId === u.id}
                                                className={`bg-white border rounded px-2 py-1 text-sm outline-none transition-colors 
                                                    ${isCurrentUser ? 'opacity-50 cursor-not-allowed border-slate-100' : 'border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}
                                                    ${processingId === u.id ? 'animate-pulse' : ''}
                                                `}
                                            >
                                                <option value="Admin">Administrator</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Sales">Sales Rep</option>
                                                <option value="User">Read-Only User</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)}
                                            disabled={isCurrentUser || processingId === u.id}
                                            className={`text-slate-400 hover:text-red-600 p-1.5 rounded border border-transparent hover:border-red-100 hover:bg-red-50 transition-colors
                                                ${isCurrentUser ? 'opacity-30 cursor-not-allowed' : ''}
                                            `}
                                            title={isCurrentUser ? "Cannot delete yourself" : "Delete User"}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
