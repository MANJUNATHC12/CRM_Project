import { BarChart, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Detailed performance metrics for your team</p>
        </div>
        <select className="border border-slate-200 bg-white text-sm rounded-md px-3 py-1.5 shadow-sm outline-none focus:border-blue-500 text-slate-700">
          <option>Last 30 Days</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: '$84,500', icon: DollarSign, color: 'text-emerald-600' },
          { title: 'Deals Won', value: '32', icon: TrendingUp, color: 'text-blue-600' },
          { title: 'New Leads', value: '145', icon: Users, color: 'text-indigo-600' },
          { title: 'Avg. Pipeline Size', value: '$12k', icon: BarChart, color: 'text-amber-600' }
        ].map(stat => (
          <div key={stat.title} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
             <div>
               <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{stat.title}</p>
               <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
             </div>
             <div className={`p-2.5 rounded bg-slate-50 border border-slate-100 ${stat.color}`}>
               <stat.icon size={20} />
             </div>
          </div>
        ))}
      </div>

      {/* Charts Grid Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col h-80">
          <h2 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">Revenue Over Time</h2>
          <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2 mt-auto border-b border-slate-200">
             {/* Mock Chart Bars */}
             {[40, 70, 45, 90, 65, 85, 100, 60, 50, 75, 80, 95].map((h, i) => (
               <div key={i} className="w-full bg-slate-200 rounded-t-sm relative group hover:bg-blue-500 transition-colors cursor-pointer" style={{ height: `${h}%` }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">${h}k</div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
            <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col h-80">
          <h2 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">Leads by Source</h2>
          <div className="flex-1 flex justify-center items-center">
             {/* Mock Donut Chart via CSS */}
             <div className="w-40 h-40 rounded-full border-[1.2rem] border-blue-500 relative flex items-center justify-center" style={{ borderRightColor: '#10b981', borderBottomColor: '#f59e0b'}}>
                <div className="text-center">
                  <span className="text-2xl font-semibold text-slate-900 block">145</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 block">Leads</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Organic</div>
             <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Referral</div>
             <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Paid</div>
          </div>
        </div>
      </div>
    </div>
  );
}
