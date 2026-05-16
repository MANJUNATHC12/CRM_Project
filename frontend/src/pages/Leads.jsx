import { Plus, MoreHorizontal, X, Eye, Check, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({ title: '', company: '', value: 0, stage: 'New Leads' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, leadId: null });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const stages = [
    { title: 'New Leads', color: 'border-slate-500 bg-slate-50 text-slate-700' },
    { title: 'Contacted', color: 'border-blue-500 bg-blue-50 text-blue-700' },
    { title: 'Qualified', color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
    { title: 'Proposal', color: 'border-amber-500 bg-amber-50 text-amber-700' },
    { title: 'Won', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  ];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5146/api/leads', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
      });
      if (response.status === 401) {
        localStorage.removeItem('crm_token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openModal = (mode, stage, lead = null) => {
    setModalMode(mode);
    if (mode === 'edit' && lead) {
       setFormData({ title: lead.title, company: lead.company, value: lead.value, stage: lead.stage });
       setSelectedLead(lead);
    } else {
       setFormData({ title: '', company: '', value: 0, stage: stage || 'New Leads' });
       setSelectedLead(null);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = modalMode === 'add' ? `http://localhost:5146/api/leads` : `http://localhost:5146/api/leads/${selectedLead.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const payload = { ...formData, value: parseFloat(formData.value) || 0 };

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.status === 401) {
        localStorage.removeItem('crm_token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) {
         const errData = await response.json().catch(() => ({}));
         throw new Error(errData.message || errData.title || `Failed to ${modalMode} lead`);
      }
      
      setIsModalOpen(false);
      showToast(modalMode === 'add' ? 'Lead created successfully!' : 'Lead updated successfully!');
      fetchLeads();
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ isOpen: true, leadId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.leadId;
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5146/api/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
      });
      if (response.status === 401) {
        localStorage.removeItem('crm_token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Failed to delete lead');
      setIsModalOpen(false);
      setDeleteConfirm({ isOpen: false, leadId: null });
      showToast('Lead deleted successfully!');
      fetchLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col relative">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Leads Pipeline</h1>
        </div>
        <button onClick={() => openModal('add', 'New Leads')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
          Add Lead
        </button>
      </div>

      {error && <div className="text-red-500 mb-4 text-sm font-medium">{error}</div>}

      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage.title);
            return (
            <div key={stage.title} className="w-72 flex flex-col bg-slate-50/80 rounded-lg border border-slate-200 overflow-hidden shrink-0 h-full">
              <div className={`px-4 py-3 border-t-[3px] ${stage.color.split(' ')[0]} bg-white border-b border-slate-200 flex justify-between items-center`}>
                <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                   {stage.title} 
                   <span className="text-[10px] py-0.5 px-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded">{stageLeads.length}</span>
                </h3>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {stageLeads.map(lead => (
                  <div key={lead.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow transition-all group relative">
                    <div className="flex justify-between items-start mb-1.5">
                       <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{new Date(lead.createdAt).toLocaleDateString()}</span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openModal('edit', stage.title, lead)} className="text-slate-400 hover:text-blue-500 bg-slate-50 p-1 rounded transition-colors"><MoreHorizontal size={14}/></button>
                         <Link to={`/leads/${lead.id}`} className="text-slate-400 hover:text-blue-500 bg-slate-50 p-1 rounded transition-colors"><Eye size={14}/></Link>
                       </div>
                    </div>
                    <h4 className="font-medium text-slate-900 text-sm mb-0.5">{lead.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">{lead.company || 'Unknown Company'}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                       <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200 flex justify-center items-center text-[9px] font-medium text-slate-600">
                         {lead.company ? lead.company.charAt(0).toUpperCase() : 'U'}
                       </div>
                       <span className="font-medium text-slate-700 text-xs">${lead.value?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ))}
                
                <button onClick={() => openModal('add', stage.title)} className="w-full py-2 flex justify-center items-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded transition-colors text-sm border border-transparent border-dashed">
                  <Plus size={16} className="mr-1"/> Add card
                </button>
              </div>
            </div>
          )})}
        </div>
      </div>

       {/* Modal Overlay */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 text-slate-900">
               <h3 className="font-semibold">{modalMode === 'add' ? 'Add New Lead' : 'Edit Lead'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lead Title <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. SEO Optimization" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="TechNova" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Deal Value ($)</label>
                  <input type="number" min="0" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pipeline Stage</label>
                <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                   {stages.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between gap-2 mt-6">
                 {modalMode === 'edit' ? (
                   <button type="button" onClick={() => handleDelete(selectedLead.id)} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors">Delete</button>
                 ) : <div></div>}
                 <div className="flex gap-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2">
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      )}
       {/* Custom Delete Confirmation Modal */}
       {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Lead?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this lead? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: false, leadId: null })}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
