import { useState, useEffect } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Briefcase, DollarSign,
  Target, Activity, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ─── API ──────────────────────────────────────────────────────────────────────
const API = 'http://localhost:5146/api/reports';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('crm_token')}` });

async function get(path) {
  const res = await fetch(`${API}/${path}`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const STAGE_COLORS = {
  'New':            '#64748b',
  'Contacted':      '#3b82f6',
  'Qualified':      '#6366f1',
  'Proposal Sent':  '#f59e0b',
  'Negotiation':    '#8b5cf6',
  'Won':            '#10b981',
  'Lost':           '#ef4444',
};
const PIE_PALETTE = ['#3b82f6','#6366f1','#f59e0b','#10b981','#64748b'];

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtMoney = v => `$${Number(v).toLocaleString()}`;
const fmtK    = v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`;

// ─── Reusable Card ────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="px-5 pt-5 pb-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────
function KpiTile({ icon: Icon, label, value, sub, color, trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-emerald-50',icon: 'text-emerald-600',border: 'border-emerald-100' },
    purple: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100' },
    slate:  { bg: 'bg-slate-50',  icon: 'text-slate-600',  border: 'border-slate-100' },
  }[color] ?? colors.blue;

  return (
    <Card className="p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} border ${colors.border}`}>
        <Icon size={20} className={colors.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      {trend != null && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
          {Math.abs(trend)}%
        </div>
      )}
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function Empty({ text = 'No data available yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-slate-300 text-xs font-medium gap-2">
      <Activity size={32} className="text-slate-200" />
      {text}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, money }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xl px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">{money ? fmtMoney(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Reports() {
  const [summary,       setSummary]       = useState(null);
  const [byStage,       setByStage]       = useState([]);
  const [growth,        setGrowth]        = useState([]);
  const [revenue,       setRevenue]       = useState([]);
  const [pipeline,      setPipeline]      = useState([]);
  const [activitySumm,  setActivitySumm]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshKey,    setRefreshKey]    = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      get('summary'),
      get('leads-by-stage'),
      get('customer-growth'),
      get('revenue-over-time'),
      get('pipeline-summary'),
      get('activity-summary'),
    ]).then(([s, bs, g, r, p, a]) => {
      setSummary(s);
      setByStage(bs);
      setGrowth(g);
      setRevenue(r);
      setPipeline(p);
      setActivitySumm(a);
    }).catch(err => console.error('Reports load error:', err))
    .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw size={32} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time CRM performance overview</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile icon={Users}      label="Total Customers"   value={summary?.totalCustomers ?? 0}   sub={`${summary?.activeCustomers ?? 0} active`}        color="blue" />
        <KpiTile icon={Briefcase}  label="Total Leads"       value={summary?.totalLeads ?? 0}       sub={`${summary?.wonLeads ?? 0} won`}                  color="purple" />
        <KpiTile icon={DollarSign} label="Won Revenue"       value={fmtK(summary?.totalRevenue ?? 0)} sub="Closed deals"                                  color="green" />
        <KpiTile icon={Target}     label="Conversion Rate"   value={`${summary?.conversionRate ?? 0}%`} sub="Leads → Won"                                 color="amber" />
      </div>

      {/* ── Row 2: Revenue + Customer Growth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue Over Time */}
        <Card>
          <CardHeader title="Revenue Over Time" subtitle="Monthly revenue from closed (Won) deals" />
          <div className="px-4 pb-5 h-56">
            {revenue.length === 0 ? <Empty text="No won deals recorded yet." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 4, right: 10, bottom: 0, left: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<ChartTip money />} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Customer Growth */}
        <Card>
          <CardHeader title="Customer Growth" subtitle="New customers added per month" />
          <div className="px-4 pb-5 h-56">
            {growth.length === 0 ? <Empty text="No customer data yet." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growth} margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="customers" name="New Customers" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* ── Row 3: Lead Funnel + Pipeline Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Lead Pipeline Funnel (bar-style) */}
        <Card>
          <CardHeader title="Lead Pipeline by Stage" subtitle="Volume and value per pipeline stage" />
          <div className="px-4 pb-5 h-60">
            {byStage.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStage} layout="vertical" margin={{ top: 4, right: 35, bottom: 0, left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={75} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="count" name="Leads" radius={[0,4,4,0]}>
                    {byStage.map((entry, i) => (
                      <Cell key={i} fill={STAGE_COLORS[entry.stage] ?? '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Pipeline $ Value Pie */}
        <Card>
          <CardHeader title="Deal Value Distribution" subtitle="Pipeline value breakdown by stage" />
          <div className="px-4 pb-5 h-60 flex items-center">
            {pipeline.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipeline}
                    cx="45%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                  >
                    {pipeline.map((_, i) => (
                      <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <PieTooltip formatter={(v) => [fmtMoney(v), 'Value']} />
                  <PieLegend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* ── Row 4: Activity Trend + Conversion Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activity Over 14 Days */}
        <Card className="lg:col-span-2">
          <CardHeader title="System Activity (Last 14 Days)" subtitle="Actions logged per day across all modules" />
          <div className="px-4 pb-5 h-52">
            {activitySumm.length === 0 ? <Empty text="No activity recorded in the last 14 days." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activitySumm} margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="actions" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} name="Actions" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Conversion Scorecard */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Lead Conversion</h3>
            <p className="text-xs text-slate-400">Leads converted to Won</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="48"
                  fill="none"
                  stroke={summary?.conversionRate >= 30 ? '#10b981' : '#f59e0b'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(summary?.conversionRate ?? 0) * 3.015} 999`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{summary?.conversionRate ?? 0}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Conversion</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{summary?.wonLeads ?? 0}</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">Won</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{(summary?.totalLeads ?? 0) - (summary?.wonLeads ?? 0)}</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">In Pipeline</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 5: Summary Table ── */}
      <Card>
        <CardHeader title="Pipeline Stage Breakdown" subtitle="Full value and count summary by stage" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-y border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Stage</th>
                <th className="px-5 py-3 text-right font-medium">Leads</th>
                <th className="px-5 py-3 text-right font-medium">Total Value</th>
                <th className="px-5 py-3 text-right font-medium">Avg Value</th>
                <th className="px-5 py-3 text-right font-medium">% of Leads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byStage.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">No leads yet.</td></tr>
              ) : byStage.map(row => {
                const total = byStage.reduce((s, r) => s + r.count, 0);
                const pct   = total > 0 ? Math.round(row.count / total * 100) : 0;
                const avg   = row.count > 0 ? row.value / row.count : 0;
                return (
                  <tr key={row.stage} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STAGE_COLORS[row.stage] ?? '#94a3b8' }} />
                      <span className="font-medium text-slate-800">{row.stage}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600 font-medium">{row.count}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{fmtMoney(row.value)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-400">{fmtMoney(avg.toFixed(0))}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: STAGE_COLORS[row.stage] ?? '#94a3b8' }} />
                        </div>
                        <span className="text-slate-500 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
