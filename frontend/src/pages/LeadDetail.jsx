import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building2, Mail, Phone, Calendar, 
  DollarSign, CheckCircle2, Clock, MessageSquare, 
  Activity, UserCircle2, Send, Plus, X, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  const [newNote, setNewNote] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', company: '', value: 0, stage: '', email: '', phone: '', deadline: '', endDate: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenEditModal = () => {
    if (!lead) return;
    setEditForm({
      title: lead.title || '',
      company: lead.company || '',
      value: lead.value || 0,
      stage: lead.stage || 'New',
      email: lead.email || '',
      phone: lead.phone || '',
      deadline: lead.deadline ? new Date(lead.deadline).toISOString().slice(0,10) : '',
      endDate: lead.endDate ? new Date(lead.endDate).toISOString().slice(0,10) : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
        },
        body: JSON.stringify({ ...editForm, value: parseFloat(editForm.value) || 0 })
      });
      if (response.status === 401) {
        localStorage.removeItem('crm_token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Failed to update lead');
      
      const updatedLead = await response.json();
      setLead(updatedLead);
      setIsEditModalOpen(false);
      showToast('Lead profile updated successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mocking the extra data since the backend model doesn't fully support these yet.
  // In a real app, these would come attached to the GET /api/leads/{id} response.
  const [notes, setNotes] = useState([
    { id: 1, content: 'Had a great initial discovery call. They are very interested in our premium tier.', author: 'Admin', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, content: 'Sent over the pricing brochure.', author: 'Admin', date: new Date(Date.now() - 172800000).toISOString() }
  ]);
  
  const [activities] = useState([
    { id: 1, action: 'Stage Changed', details: 'Moved from New to Contacted', date: new Date(Date.now() - 40000000).toISOString(), icon: Activity, color: 'text-blue-500 bg-blue-50' },
    { id: 2, action: 'Email Sent', details: 'Introductory email delivered', date: new Date(Date.now() - 100000000).toISOString(), icon: Send, color: 'text-purple-500 bg-purple-50' },
    { id: 3, action: 'Lead Created', details: 'Added via web form', date: new Date(Date.now() - 200000000).toISOString(), icon: Plus, color: 'text-emerald-500 bg-emerald-50' }
  ]);

  const [followups] = useState([
    { id: 1, title: 'Follow up on pricing', due: new Date(Date.now() + 86400000).toISOString(), type: 'Call' }
  ]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLead(data);
        } else {
          // If not found, maybe redirect
          navigate('/leads');
        }
      } catch (err) {
        console.error('Failed to fetch lead', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id, navigate]);

  const handleStageChange = async (e) => {
    const newStage = e.target.value;
    setLead(prev => ({ ...prev, stage: newStage }));
    
    try {
      await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
        },
        body: JSON.stringify({ ...lead, stage: newStage })
      });
    } catch (err) {
      console.error('Failed to update stage', err);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      content: newNote,
      author: user?.fullName || 'User',
      date: new Date().toISOString()
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
  };

  if (loading) return <div className="flex-1 p-8 flex justify-center items-center text-slate-400">Loading Lead Details...</div>;
  if (!lead) return <div className="flex-1 p-8 flex justify-center items-center text-slate-400">Lead not found</div>;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50 -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8 overflow-y-auto">
      
      {/* ─── HEADER ─── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{lead.title || 'Unnamed Lead'}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
              <Building2 size={14} />
              <span>{lead.company || 'Unknown Company'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={lead.stage || 'New'} 
            onChange={handleStageChange}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-medium"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
          <button 
            onClick={handleOpenEditModal} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        
        {/* ─── LEFT COLUMN: PROFILE OVERVIEW ─── */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Lead Overview</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 flex items-center gap-2"><DollarSign size={16}/> Value</span>
                <span className="font-semibold text-emerald-600">${(lead.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Calendar size={16}/> Created</span>
                <span className="text-sm font-medium text-slate-800">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
  <span className="text-sm text-slate-500 flex items-center gap-2"><UserCircle2 size={16}/> Assignee</span>
  <span className="text-sm font-medium text-blue-600">Admin User</span>
</div>
<div className="flex justify-between items-center py-2 border-b border-slate-50">
  <span className="text-sm text-slate-500 flex items-center gap-2"><Calendar size={16}/> Deadline</span>
  <span className="text-sm font-medium text-slate-800">{lead.deadline ? new Date(lead.deadline).toLocaleDateString() : '—'}</span>
</div>
<div className="flex justify-between items-center py-2 border-b border-slate-50">
  <span className="text-sm text-slate-500 flex items-center gap-2"><Clock size={16}/> End Date</span>
  <span className="text-sm font-medium text-slate-800">{lead.endDate ? new Date(lead.endDate).toLocaleDateString() : '—'}</span>
</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Contact Details</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Mail size={16} className="text-slate-400" /> 
                <span className="truncate">{lead.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Phone size={16} className="text-slate-400" /> 
                <span className="truncate">{lead.phone || 'No phone provided'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-amber-500">
            <div className="p-5">
              <h2 className="font-semibold text-amber-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock size={16}/> Next Follow-up
              </h2>
              {followups.map(f => (
                <div key={f.id} className="text-sm">
                  <div className="font-medium text-slate-800">{f.title}</div>
                  <div className="text-slate-500 mt-1 flex justify-between">
                    <span>{f.type}</span>
                    <span className="text-amber-600 font-semibold">{new Date(f.due).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: TABS (ACTIVITY / NOTES / EMAILS) ─── */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-2 pt-2 overflow-x-auto">
            {['activity', 'notes', 'emails'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                {tab === 'activity' && <Activity size={16} className="inline mr-2 -mt-0.5" />}
                {tab === 'notes' && <MessageSquare size={16} className="inline mr-2 -mt-0.5" />}
                {tab === 'emails' && <Mail size={16} className="inline mr-2 -mt-0.5" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
            
            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {activities.map((item, i) => (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${item.color} z-10`}>
                      <item.icon size={14} />
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border bg-white border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{item.action}</span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="flex flex-col h-full">
                <form onSubmit={handleAddNote} className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <textarea 
                    rows="3"
                    className="w-full text-sm bg-transparent outline-none resize-none placeholder:text-slate-400"
                    placeholder="Write a note about this lead..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
                    <button type="submit" disabled={!newNote.trim()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                      Save Note
                    </button>
                  </div>
                </form>
                
                <div className="space-y-4 flex-1">
                  {notes.map(note => (
                    <div key={note.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {note.author.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">{note.author}</span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(note.date).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMAILS TAB */}
            {activeTab === 'emails' && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Mail size={24} className="text-slate-300" />
                </div>
                <p className="font-medium text-slate-600">No email history found</p>
                <p className="text-sm text-center max-w-sm">Connect your inbox to automatically track emails sent to and received from this lead.</p>
                <button className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
                  Connect Inbox
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 text-slate-900">
               <h3 className="font-semibold text-slate-800">Edit Lead Profile</h3>
               <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lead Title <span className="text-red-500">*</span></label>
                <input required type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                  <input type="text" value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Deal Value ($)</label>
                  <input type="number" min="0" step="0.01" value={editForm.value} onChange={e => setEditForm({...editForm, value: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pipeline Stage</label>
                <select value={editForm.stage} onChange={e => setEditForm({...editForm, stage: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                   <option value="New">New</option>
                   <option value="Contacted">Contacted</option>
                   <option value="Qualified">Qualified</option>
                   <option value="Proposal Sent">Proposal Sent</option>
                   <option value="Negotiation">Negotiation</option>
                   <option value="Won">Won</option>
                   <option value="Lost">Lost</option>
                </select>
                {/* Deadline */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Deadline</label>
                  <input type="date" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                {/* End Date */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" value={editForm.endDate} onChange={e => setEditForm({ ...editForm, endDate: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50">Cancel</button>
                 <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2">
                   {isSubmitting ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
