import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search, Plus, Building2, MoreHorizontal, DollarSign, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

// ─── STAGE COLUMN COMPONENT ──────────────────────────────────────────────────
function StageColumn({ id, title, leads, activeId }) {
  return (
    <div className="flex flex-col bg-slate-50 rounded-xl w-80 shrink-0 h-full border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-100/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">{title}</h3>
        <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200">
          {leads.length}
        </span>
      </div>
      
      <div className="p-3 flex-1 overflow-y-auto space-y-3 relative">
        <SortableContext id={id} items={leads.map(l => l.id.toString())} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} isActive={activeId === lead.id.toString()} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-sm text-slate-400">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LEAD CARD COMPONENT ─────────────────────────────────────────────────────
function LeadCard({ lead, isActive }) {
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
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-900 text-sm leading-tight">{lead.title || lead.company || 'Unnamed Lead'}</h4>
        <Link 
          to={`/leads/${lead.id}`}
          className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1 rounded transition-colors"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking link
        >
          <Eye size={14} />
        </Link>
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

  const token = localStorage.getItem('crm_token');

  // Fetch all leads (assuming API pagination handles enough, or we need a specific unpaginated endpoint)
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('http://localhost:5146/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The API returns an array of leads directly based on LeadsController
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
      // Put the whole DTO as required by the existing PUT endpoint
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
      // Normalize stage name or fallback to 'New'
      const stage = STAGES.find(s => s.toLowerCase() === (l.stage || '').toLowerCase()) || 'New';
      cols[stage].push(l);
    });
    return cols;
  }, [filteredLeads]);

  // ─── DND HANDLERS ───
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setLeads((prev) => {
      const activeItems = columns[activeContainer];
      const overItems = columns[overContainer];
      const activeIndex = activeItems.findIndex(t => t.id.toString() === activeId);
      const overIndex = overItems.findIndex(t => t.id.toString() === overId);

      let newIndex;
      if (overId in columns) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      const newLeads = [...prev];
      const leadIndex = newLeads.findIndex(l => l.id.toString() === activeId);
      newLeads[leadIndex] = { ...newLeads[leadIndex], stage: overContainer };
      return newLeads;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      // Stage changed! Call API
      updateLeadStage(activeId, overContainer);
    } else {
       // Same column reordering (not fully supported by backend without an Order field, but we can do UI-only arrayMove)
       setLeads((prev) => {
           const containerItems = columns[activeContainer];
           const oldIndex = containerItems.findIndex(l => l.id.toString() === activeId);
           const newIndex = containerItems.findIndex(l => l.id.toString() === overId);
           
           if(oldIndex !== newIndex) {
              // Just a UI array move for visual satisfaction
              return arrayMove(prev, prev.findIndex(l=>l.id.toString()===activeId), prev.findIndex(l=>l.id.toString()===overId));
           }
           return prev;
       });
    }
  };

  const findContainer = (id) => {
    if (id in columns) return id;
    const lead = leads.find(l => l.id.toString() === id);
    if (lead) {
      return STAGES.find(s => s.toLowerCase() === (lead.stage || '').toLowerCase()) || 'New';
    }
    return null;
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> <span className="hidden sm:inline">Add Lead</span>
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
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {STAGES.map(stage => (
                <SortableContext key={stage} id={stage} items={columns[stage].map(l => l.id.toString())} strategy={verticalListSortingStrategy}>
                   <StageColumn 
                     id={stage} 
                     title={stage} 
                     leads={columns[stage]} 
                     activeId={activeId}
                   />
                </SortableContext>
              ))}

              {/* Ghost overlay while dragging */}
              <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} isActive={true} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
