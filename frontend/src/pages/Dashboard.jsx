import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Target, Activity, MoreHorizontal, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';


export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user.name.split(' ')[0];

  const metrics = [
    { title: 'Total Revenue', value: '$201,900.00', change: '+0%', isUp: true, icon: DollarSign, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'Active Deals', value: '6', change: '+0%', isUp: true, icon: Target, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'New Contacts', value: '4', change: '+0%', isUp: true, icon: Users, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'Win Rate', value: '14%', change: '+0%', isUp: true, icon: Activity, color: 'text-slate-700', bg: 'bg-slate-100' }
  ];


  const recentDeals = [
    { id: 1, name: 'Acme Corp Redevelopment', company: 'Acme Corp', amount: '$45,000', status: 'In Progress', statusColor: 'bg-blue-50 text-blue-700 border-blue-200', date: 'Oct 24, 2026' },
    { id: 2, name: 'Global Tech CRM Integration', company: 'Global Tech', amount: '$120,000', status: 'Won', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', date: 'Oct 22, 2026' },
    { id: 3, name: 'Stark Industries AI', company: 'Stark Ind.', amount: '$250,000', status: 'Review', statusColor: 'bg-amber-50 text-amber-700 border-amber-200', date: 'Oct 20, 2026' },
    { id: 4, name: 'Wayne Ent. Security', company: 'Wayne Ent.', amount: '$85,000', status: 'Lost', statusColor: 'bg-red-50 text-red-700 border-red-200', date: 'Oct 15, 2026' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {firstName}. Here's what's happening today.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
          Add New Deal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div className={`p-2 rounded-md ${metric.bg} ${metric.color}`}>
                <metric.icon size={18} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${metric.isUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                {metric.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {metric.change}
              </div>
            </div>
            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{metric.title}</h3>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Deals</h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Deal Name</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentDeals.map((deal) => (
                  <tr key={deal.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors group">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 flex-shrink-0 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                          {deal.company.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{deal.name}</p>
                          <p className="text-xs text-slate-500">{deal.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-slate-700">{deal.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${deal.statusColor}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {deal.date}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Today's Tasks</h2>
            <button className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-md transition-colors border border-slate-200 hover:border-slate-300">
              <MoreHorizontal size={16} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
             <div className="space-y-3">
                {[
                  { name: 'Follow up with Stark Ind.', time: '2:00 PM', dur: '1h', done: false },
                  { name: 'Send proposal to Global Tech', time: '10:00 AM', dur: '30m', done: true },
                  { name: 'Weekly team sync', time: '4:30 PM', dur: '45m', done: false },
                ].map((task, i) => (
                  <div key={i} className={`flex gap-3 items-start p-3 rounded-md border ${task.done ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-blue-300'} transition-colors group`}>
                    <div className={`mt-0.5 w-4 h-4 rounded border flex flex-shrink-0 items-center justify-center cursor-pointer transition-colors ${task.done ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                      {task.done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={12} className={task.done ? 'text-slate-300' : 'text-slate-400'} />
                          {task.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-auto pt-4">
               <button className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-600 text-sm font-medium hover:text-blue-600 transition-colors">
                 Add New Task
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
