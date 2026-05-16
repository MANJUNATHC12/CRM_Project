import { useState, useEffect } from 'react';
import {
  BarChart, Bar,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import {
  Target, TrendingUp, DollarSign, Activity, RefreshCw, Briefcase
} from 'lucide-react';
import axios from 'axios';

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

const fmtMoney = v => `$${Number(v).toLocaleString()}`;
const fmtK = v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, money }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xl px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-slate-500">{p.name || p.dataKey}:</span>
          <span className="font-medium text-slate-800">{money ? fmtMoney(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function LeadAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const token = localStorage.getItem('crm_token');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5146/api/reports/lead-analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch lead analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [refreshKey, token]);

  if (loading || !data) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw size={32} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading lead analytics…</p>
        </div>
      </div>
    );
  }

  // Calculate some derived stats
  const totalLeads = data.wonVsLost.reduce((acc, curr) => acc + curr.value, 0);
  const wonLeads = data.wonVsLost.find(d => d.name === "Won Deals")?.value || 0;
  const lostLeads = data.wonVsLost.find(d => d.name === "Lost Deals")?.value || 0;
  
  // Prevent division by zero
  const conversionRate = (wonLeads + lostLeads) > 0 
      ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) 
      : 0;

  const SOURCE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Deep dive into sales pipeline performance</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 border border-blue-100">
            <Briefcase size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Leads</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">{totalLeads}</p>
            <p className="text-xs text-slate-400 mt-1">In system</p>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 border border-emerald-100">
            <Target size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Conversion Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">{conversionRate}%</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Won vs Lost</p>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 border border-indigo-100">
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Win/Loss Ratio</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">
              {lostLeads > 0 ? (wonLeads / lostLeads).toFixed(1) : wonLeads}
            </p>
            <p className="text-xs text-slate-400 mt-1">Deals</p>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-transparent">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/10 border border-white/20">
            <DollarSign size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Revenue Forecast</p>
            <p className="text-2xl font-bold text-white mt-0.5 leading-none">{fmtK(data.forecast)}</p>
            <p className="text-xs text-emerald-400 font-medium mt-1">Weighted Pipeline</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ── Won vs Lost Radial Chart ── */}
        <Card>
          <CardHeader title="Lead Conversion Status" subtitle="Breakdown of all processed leads" />
          <div className="px-4 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" 
                barSize={15} data={data.wonVsLost}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: '#f1f5f9' }}
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
                <RechartsLegend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
                <RechartsTooltip content={<ChartTip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ── Lead Source Analysis Pie Chart ── */}
        <Card>
          <CardHeader title="Lead Source Analysis" subtitle="Where your leads are coming from" />
          <div className="px-4 pb-5 h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sources}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    dataKey="value" nameKey="name"
                    paddingAngle={2}
                  >
                    {data.sources.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val) => [`${val}%`, 'Volume']} />
                  <RechartsLegend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* ── Sales Performance Bar Chart ── */}
      <Card>
        <CardHeader title="Sales Rep Performance" subtitle="Pipeline vs Won revenue per representative" />
        <div className="px-4 pb-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.performance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTip money />} cursor={{ fill: '#f8fafc' }} />
              <RechartsLegend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="won" name="Won Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="pipeline" name="Pipeline Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
