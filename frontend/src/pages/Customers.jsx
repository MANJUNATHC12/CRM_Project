import { Search, Edit2, Phone, Mail, FileText, Activity, Trash2, Plus, X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Pagination & Search state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', status: 'Active' });
  const [newNote, setNewNote] = useState('');

  const fetchCustomers = async (currentPage = page, currentSearch = search) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5146/api/customers?search=${encodeURIComponent(currentSearch)}&page=${currentPage}&pageSize=10`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      
      if (data.items.length > 0 && !selectedCustomer) {
        setSelectedCustomer(data.items[0]);
      } else if (data.items.length === 0) {
        setSelectedCustomer(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchTrigger = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchCustomers(1, search);
    }
  };

  const handleOpenModal = (mode, customer = null) => {
    setModalMode(mode);
    if (mode === 'edit' && customer) {
      setFormData({ name: customer.name, company: customer.company, email: customer.email, phone: customer.phone, status: customer.status });
      setSelectedCustomer(customer);
    } else {
      setFormData({ name: '', company: '', email: '', phone: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === 'add' ? `http://localhost:5146/api/customers` : `http://localhost:5146/api/customers/${selectedCustomer.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error(`Failed to ${modalMode} customer`);
      
      const savedCustomer = await response.json();
      if (modalMode === 'add') {
         setSelectedCustomer(savedCustomer);
      } else {
         if (selectedCustomer?.id === savedCustomer.id) {
             setSelectedCustomer({ ...selectedCustomer, ...savedCustomer });
         }
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const response = await fetch(`http://localhost:5146/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` }
      });
      if (!response.ok) throw new Error('Failed to delete customer');
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedCustomer) return;
    try {
      const response = await fetch(`http://localhost:5146/api/customers/${selectedCustomer.id}/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
        },
        body: JSON.stringify({ content: newNote })
      });
      if (!response.ok) throw new Error('Failed to add note');
      const addedNote = await response.json();
      setSelectedCustomer({
        ...selectedCustomer,
        notes: [addedNote, ...(selectedCustomer.notes || [])]
      });
      setNewNote('');
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
     switch(status?.toLowerCase()) {
         case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
         case 'inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
         case 'lead': return 'bg-blue-50 text-blue-700 border-blue-200';
         default: return 'bg-slate-50 text-slate-600 border-slate-200';
     }
  };

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Customer List */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Customers</h1>
            <p className="text-xs text-slate-500">Total: {totalCount}</p>
          </div>
          <button onClick={() => handleOpenModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5">
            <Plus size={16} /> Add Customer
          </button>
        </div>
        
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search customers... (Press Enter to search)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchTrigger}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-md py-2 pl-9 pr-4 text-sm outline-none transition-colors" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-4 text-center text-sm text-slate-500">Loading...</div>}
          {!loading && customers.length === 0 && <div className="p-4 text-center text-sm text-slate-500">No customers found.</div>}
          {!loading && customers.map(c => (
            <div key={c.id} onClick={() => setSelectedCustomer(c)} className={`p-4 border-b border-slate-100 flex items-center justify-between cursor-pointer transition-colors ${selectedCustomer?.id === c.id ? 'bg-blue-50/50 border-l-2 border-l-blue-600' : 'hover:bg-slate-50 border-l-2 border-l-transparent'}`}>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-medium text-slate-700 shrink-0 text-sm">
                   {c.name.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <h3 className="font-medium text-slate-900 text-sm">{c.name}</h3>
                   <p className="text-xs text-slate-500">{c.company}</p>
                 </div>
               </div>
               <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded border ${getStatusColor(c.status)}`}>{c.status}</span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-50">
               <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-medium text-slate-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-50">
               <ChevronRight size={18} />
            </button>
        </div>
      </div>

      {/* Customer Detail & Notes System */}
      {selectedCustomer ? (
        <div className="w-full xl:w-[450px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-6 border-b border-slate-200 text-center bg-slate-50/50 relative group">
            <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal('edit', selectedCustomer)} className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent rounded-md transition-colors" title="Edit"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(selectedCustomer.id)} className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent rounded-md transition-colors" title="Delete"><Trash2 size={16} /></button>
            </div>
            <div className={`w-16 h-16 rounded shadow-sm mx-auto flex items-center justify-center font-semibold text-2xl mb-3 border ${getStatusColor(selectedCustomer.status)}`}>
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{selectedCustomer.name}</h2>
            <p className="text-sm text-slate-500">{selectedCustomer.company}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 pb-0 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Details</h3>
              <div className="flex items-center gap-3 text-sm text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-md select-all">
                <Mail size={16} className="text-slate-400" /> {selectedCustomer.email || 'N/A'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-md select-all">
                <Phone size={16} className="text-slate-400" /> {selectedCustomer.phone || 'N/A'}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes & Activity</h3>
              </div>
              
              <div className="flex items-end gap-2">
                 <input 
                   type="text" 
                   value={newNote} 
                   onChange={e => setNewNote(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                   placeholder="Type a new note..." 
                   className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:bg-white focus:border-blue-500" 
                 />
                 <button onClick={handleAddNote} className="bg-slate-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">Add</button>
              </div>

              <div className="relative pl-3 space-y-4 before:absolute before:inset-y-0 before:left-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-slate-200 pb-6">
                {(selectedCustomer.notes || []).length === 0 && <p className="text-xs text-slate-400 ml-4 italic mt-2">No notes added yet.</p>}
                {(selectedCustomer.notes || []).map((note, index) => (
                  <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-2.5 h-2.5 rounded-full border-2 border-white absolute left-[-4px] ring-1 ring-slate-200 ${index === 0 ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                    <div className={`w-full p-3 rounded-md border ml-2 ${index === 0 ? 'bg-white border-blue-100 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-medium text-slate-900 flex items-center gap-1.5"><FileText size={12} className="text-slate-400"/> Note</div>
                        <time className="text-[10px] text-slate-500">{new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                      </div>
                      <div className="text-xs text-slate-600 whitespace-pre-wrap">{note.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full xl:w-[450px] bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex flex-col items-center justify-center h-full shrink-0 text-slate-400 p-8 text-center gap-3">
            <Users size={48} className="text-slate-300" />
            <p className="text-sm font-medium">Select a customer to view details</p>
        </div>
      )}

      {/* Add / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 text-slate-900">
               <h3 className="font-semibold">{modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                   <option value="Active">Active</option>
                   <option value="Lead">Lead</option>
                   <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">Cancel</button>
                 <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
