import { CheckSquare, Square, Clock, Filter } from 'lucide-react';
import { useState } from 'react';

export default function Tasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review quarterly goals', desc: 'Go over the Q3 goals with the sales team.', due: 'Today, 2:00 PM', priority: 'High', completed: false },
    { id: 2, title: 'Call TechNova for renewal', desc: 'Subscription expires next week.', due: 'Today, 4:00 PM', priority: 'Medium', completed: false },
    { id: 3, title: 'Draft proposal for Global IT', desc: 'Include new pricing tiers.', due: 'Tomorrow', priority: 'High', completed: false },
    { id: 4, title: 'Weekly Pipeline Sync', desc: '', due: 'Friday', priority: 'Low', completed: true },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">My Tasks</h1>
          <p className="text-slate-500 text-sm">You have <span className="text-slate-700 font-medium">{tasks.filter(t=>!t.completed).length} pending tasks</span>.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
            <Filter size={14}/> Filter
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
            Add Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
           <button className="px-6 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 bg-white">All Tasks</button>
           <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Pending</button>
           <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Completed</button>
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          {tasks.map((task, idx) => (
            <div key={task.id} className={`p-4 border-b border-slate-100 last:border-none transition-colors flex gap-4 ${task.completed ? 'bg-slate-50/50 opacity-75' : 'bg-white hover:bg-slate-50'}`}>
               <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0 transition-transform text-slate-400 hover:text-blue-500">
                 {task.completed ? <CheckSquare className="text-blue-600" size={20}/> : <Square size={20}/>}
               </button>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className={`font-medium text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                   <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border ${task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{task.priority}</span>
                 </div>
                 {task.desc && <p className="text-sm text-slate-500 mb-2">{task.desc}</p>}
                 <div className="flex items-center gap-1.5 text-xs text-slate-400">
                   <Clock size={12}/> {task.due}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
