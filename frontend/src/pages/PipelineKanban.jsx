import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  useSensor, 
  useSensors,
  useDroppable,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search, Plus, Building2, DollarSign, Eye, RefreshCw, Pencil, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

// ─── STAGE COLUMN COMPONENT ──────────────────────────────────────────────────
function StageColumn({ id, title, leads, activeId, onEditClick }) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className="flex flex-col bg-slate-50 rounded-xl w-80 shrink-0 h-full border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-4 border-b border-slate-200 bg-slate-100/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">{title}</h3>
        <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200">
          {leads.length}
        </span>
      </div>
      
      <div className="p-3 flex-1 overflow-y-auto space-y-3 relative min-h-[150px]">
        <SortableContext id={id} items={leads.map(l => l.id.toString())} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} isActive={activeId === lead.id.toString()} onEdit={onEditClick} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-sm text-slate-400">
              Drop leads here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LEAD CARD COMPONENT ─────────────────────────────────────────────────────
function LeadCard({ lead, isActive, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id.toString(),
    data: { type: 'Lead', lead }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getPriorityColor = (val) => {
    if(val > 10000) return 'text-amber-600 bg-amber-50 border-amber-200';
    if(val > 5000) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group ${
        isActive ? 'ring-2 ring-blue-500 border-blue-500 scale-105 shadow-xl z-50' : 'border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-semibold text-slate-900 text-sm leading-tight truncate max-w-[170px]">{lead.title || lead.company || 'Unnamed Lead'}</h4>
        <div className="flex gap-1 shrink-0">
          <Link 
            to={`/leads/${lead.id}`}
            className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1 rounded transition-colors"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking link
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={14} />
          </Link>
          {onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lead);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1 rounded transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
        <Building2 size={13} />
        <span className="truncate">{lead.company || 'Unknown Company'}</span>
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
        <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border ${getPriorityColor(lead.value)}`}>
          <DollarSign size={12} />
          {(lead.value || 0).toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          {new Date(lead.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN KANBAN BOARD COMPONENT ─────────────────────────────────────────────
export default function PipelineKanban() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({ title: '', company: '', value: 0, stage: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      title: lead.title || '',
      company: lead.company || '',
      value: lead.value || 0,
      stage: lead.stage || 'New',
      email: lead.email || '',
      phone: lead.phone || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5146/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
        },
        body: JSON.stringify({ ...formData, value: parseFloat(formData.value) || 0 })
      });
      if (response.ok) {
        setIsModalOpen(false);
        showToast('Lead updated successfully!');
        fetchLeads();
      } else {
        throw new Error('Failed to update lead');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const token = localStorage.getItem('crm_token');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('http://localhost:5146/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(res.data);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStage = async (id, newStage) => {
    const leadToUpdate = leads.find(l => l.id.toString() === id);
    if (!leadToUpdate) return;
    
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id.toString() === id ? { ...l, stage: newStage } : l));

    try {
      await axios.put(`http://localhost:5146/api/leads/${id}`, {
        title: leadToUpdate.title,
        company: leadToUpdate.company,
        value: leadToUpdate.value,
        stage: newStage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to update lead stage', err);
      // Revert on failure
      fetchLeads();
    }
  };

  // ─── DND SENSORS ───
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ─── FILTERING & GROUPING ───
  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      (l.title?.toLowerCase().includes(search.toLowerCase()) || 
       l.company?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [leads, search]);

  const columns = useMemo(() => {
    const cols = {};
    STAGES.forEach(s => cols[s] = []);
    filteredLeads.forEach(l => {
      // Normalize stage name mapping or fallback to 'New'
      const stage = STAGES.find(s => s.toLowerCase() === (l.stage || '').toLowerCase()) || 'New';
      cols[stage].push(l);
    });
    return cols;
  }, [filteredLeads]);

  // ─── DND HANDLERS ───
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const findContainer = (id) => {
    if (STAGES.includes(id)) return id;
    const lead = leads.find(l => l.id.toString() === id);
    if (lead) {
      return STAGES.find(s => s.toLowerCase() === (lead.stage || '').toLowerCase()) || 'New';
    }
    return null;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find the lead being dragged
    const activeLead = leads.find(l => l.id.toString() === activeId);
    if (!activeLead) return;

    // Find target container
    const overContainer = findContainer(overId);
    if (!overContainer) return;

    // Standardize lead's current stage matching the key in columns
    const activeContainer = STAGES.find(s => s.toLowerCase() === (activeLead.stage || '').toLowerCase()) || 'New';

    if (activeContainer !== overContainer) {
      // Stage changed! Call API and update local state
      updateLeadStage(activeId, overContainer);
    } else {
      // Same column reordering
      setLeads((prev) => {
        const oldIndex = prev.findIndex(l => l.id.toString() === activeId);
        const newIndex = prev.findIndex(l => l.id.toString() === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
    }
  };

  // Find the active item data for the drag overlay
  const activeLead = activeId ? leads.find(l => l.id.toString() === activeId) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8 bg-slate-50">
      
      {/* Kanban Header */}
      <div className="px-6 py-5 bg-white border-b border-slate-200 shadow-sm z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Drag and drop leads to update their stages</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all" 
            />
          </div>
          <button 
            onClick={fetchLeads}
            className="flex items-center justify-center p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors bg-white shadow-sm"
            title="Refresh Leads"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 animate-pulse">
            Loading Pipeline...
          </div>
        ) : (
          <div className="flex gap-6 h-full items-start">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCorners} 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {STAGES.map(stage => (
                 <StageColumn 
                   key={stage}
                   id={stage} 
                   title={stage} 
                   leads={columns[stage]} 
                   activeId={activeId}
                   onEditClick={openEditModal}
                 />
              ))}

              {/* Ghost overlay while dragging */}
              <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} isActive={true} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 text-slate-900">
               <h3 className="font-semibold text-slate-800">Edit Lead</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lead Title <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Deal Value ($)</label>
                  <input type="number" min="0" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pipeline Stage</label>
                <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                   <option value="New">New</option>
                   <option value="Contacted">Contacted</option>
                   <option value="Qualified">Qualified</option>
                   <option value="Proposal Sent">Proposal Sent</option>
                   <option value="Negotiation">Negotiation</option>
                   <option value="Won">Won</option>
                   <option value="Lost">Lost</option>
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50">Cancel</button>
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
