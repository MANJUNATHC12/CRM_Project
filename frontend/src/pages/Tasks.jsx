import { CheckSquare, Square, Clock, Filter, Trash2, AlertTriangle, Check, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Tasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review quarterly goals', desc: 'Go over the Q3 goals with the sales team.', due: 'Today, 2:00 PM', priority: 'High', completed: false },
    { id: 2, title: 'Call TechNova for renewal', desc: 'Subscription expires next week.', due: 'Today, 4:00 PM', priority: 'Medium', completed: false },
    { id: 3, title: 'Draft proposal for Global IT', desc: 'Include new pricing tiers.', due: 'Tomorrow', priority: 'High', completed: false },
    { id: 4, title: 'Weekly Pipeline Sync', desc: '', due: 'Friday', priority: 'Low', completed: true }
  ]);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, taskId: null });
  const [toast, setToast] = useState(null);
  const [addModal, setAddModal] = useState({ isOpen: false });
  const [filterStatus, setFilterStatus] = useState('All');
  const [newTask, setNewTask] = useState({ title: '', desc: '', due: '', priority: 'Medium' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, taskId: id });
  };

  const confirmDelete = () => {
    setTasks(tasks.filter(t => t.id !== deleteConfirm.taskId));
    setDeleteConfirm({ isOpen: false, taskId: null });
    showToast('Task deleted successfully!');
  };

  const openAddModal = () => {
    setNewTask({ title: '', desc: '', due: '', priority: 'Medium' });
    setAddModal({ isOpen: true });
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      showToast('Title is required');
      return;
    }
    const nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const taskToAdd = { ...newTask, id: nextId, completed: false };
    setTasks([...tasks, taskToAdd]);
    setAddModal({ isOpen: false });
    showToast('Task added!');
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Pending') return !task.completed;
    if (filterStatus === 'Completed') return task.completed;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-xl text-sm font-medium animate-in slide-in-from-bottom-5">
          <Check size={16} />
          {toast}
        </div>
      )}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">My Tasks</h1>
          <p className="text-slate-500 text-sm">
            You have <span className="text-slate-700 font-medium">{tasks.filter(t => !t.completed).length} pending tasks</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
            <Filter size={14} /> Filter
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm" onClick={openAddModal}>
            <Plus size={16} className="inline-block mr-1" /> Add Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          {['All', 'Pending', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 text-sm font-medium ${filterStatus === status ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700 transition-colors'}`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`p-4 border-b border-slate-100 last:border-none transition-colors flex gap-4 ${task.completed ? 'bg-slate-50/50 opacity-75' : 'bg-white hover:bg-slate-50'}`}>
              <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0 transition-transform text-slate-400 hover:text-blue-500">
                {task.completed ? <CheckSquare className="text-blue-600" size={20} /> : <Square size={20} />}
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-medium text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border ${task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{task.priority}</span>
                </div>
                {task.desc && <p className="text-sm text-slate-500 mb-2">{task.desc}</p>}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={12} /> {task.due}
                  </div>
                  <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all" title="Delete task">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Task?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm({ isOpen: false, taskId: null })} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {addModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Task</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                />
                <textarea
                  placeholder="Description (optional)"
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  rows={3}
                  value={newTask.desc}
                  onChange={e => setNewTask({ ...newTask, desc: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Due (e.g., Tomorrow, 2:00 PM)"
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={newTask.due}
                  onChange={e => setNewTask({ ...newTask, due: e.target.value })}
                />
                <select
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button onClick={() => setAddModal({ isOpen: false })} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                  Cancel
                </button>
                <button onClick={handleAddTask} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
