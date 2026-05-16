import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  Building2, Mail, Lock, Bell, User, CreditCard, Zap, Database,
  Shield, ChevronRight, Save, Eye, EyeOff, Check, AlertTriangle,
  Settings as SettingsIcon, Wifi, Globe, Clock, Key, RefreshCw
} from 'lucide-react';

// ─── API Helper ──────────────────────────────────────────────────────────────
const API = 'http://localhost:5146/api/settings';
const token = () => localStorage.getItem('crm_token');

async function fetchGroup(group) {
  const res = await fetch(`${API}?group=${group}`, {
    headers: { Authorization: `Bearer ${token()}` }
  });
  if (!res.ok) throw new Error('Failed to load settings');
  const data = await res.json();
  return data.values ?? {};
}

async function saveGroup(group, values) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ group, values })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Save failed');
  }
}

// ─── Reusable Field Components ────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start py-4 border-b border-slate-100 last:border-0">
      <div>
        <label className="block text-sm font-medium text-slate-800">{label}</label>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder = '', disabled = false }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
    />
  );
}

function Select({ value, onChange, options, disabled = false }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 transition"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ value, onChange, disabled = false }) {
  const on = value === 'true' || value === true;
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(on ? 'false' : 'true')}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        ${on ? 'bg-blue-600' : 'bg-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function PasswordInput({ value, onChange, placeholder = '' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-3 text-slate-400 hover:text-slate-600">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const colors = {
    success: 'bg-emerald-600 text-white',
    error:   'bg-red-600 text-white',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium ${colors[type]}`}>
      {type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
      {msg}
    </div>
  );
}

// ─── Section Hook ─────────────────────────────────────────────────────────────
function useSection(group) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchGroup(group)
      .then(setValues)
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [group]);

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveGroup(group, values);
      showToast('Settings saved successfully!', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return { values, set, loading, saving, save, toast };
}

// ─── Individual Sections ──────────────────────────────────────────────────────

function GeneralSection() {
  const { values: v, set, loading, saving, save, toast } = useSection('company');
  if (loading) return <Loader />;
  return (
    <Section title="General Settings" desc="Manage your CRM platform's top-level configuration." onSave={save} saving={saving} toast={toast}>
      <Field label="Company Name" hint="Displayed across the platform"><Input value={v.name ?? ''} onChange={val => set('name', val)} /></Field>
      <Field label="Company Email" hint="Primary contact email"><Input value={v.email ?? ''} onChange={val => set('email', val)} type="email" /></Field>
      <Field label="Phone" hint="Support / main phone"><Input value={v.phone ?? ''} onChange={val => set('phone', val)} placeholder="+1 (555) 000-0000" /></Field>
      <Field label="Website" hint="Your company website"><Input value={v.website ?? ''} onChange={val => set('website', val)} placeholder="https://example.com" /></Field>
      <Field label="Address"><Input value={v.address ?? ''} onChange={val => set('address', val)} placeholder="123 Business Ave, Suite 400" /></Field>
      <Field label="Timezone">
        <Select value={v.timezone ?? 'UTC'} onChange={val => set('timezone', val)} options={[
          { value: 'UTC', label: 'UTC' },
          { value: 'America/New_York', label: 'Eastern Time (ET)' },
          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
          { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
          { value: 'Europe/London', label: 'London (GMT)' },
          { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
        ]} />
      </Field>
    </Section>
  );
}

function SmtpSection() {
  const { values: v, set, loading, saving, save, toast } = useSection('smtp');
  if (loading) return <Loader />;
  return (
    <Section title="SMTP / Email Settings" desc="Configure outgoing email for notifications and alerts." onSave={save} saving={saving} toast={toast}>
      <Field label="SMTP Host" hint="Mail server hostname"><Input value={v.host ?? ''} onChange={val => set('host', val)} placeholder="smtp.gmail.com" /></Field>
      <Field label="Port">
        <Select value={v.port ?? '587'} onChange={val => set('port', val)} options={[
          { value: '25',  label: '25 (SMTP)' },
          { value: '465', label: '465 (SMTPS)' },
          { value: '587', label: '587 (STARTTLS)' },
        ]} />
      </Field>
      <Field label="Username"><Input value={v.username ?? ''} onChange={val => set('username', val)} placeholder="you@example.com" /></Field>
      <Field label="Password"><PasswordInput value={v.password ?? ''} onChange={val => set('password', val)} placeholder="••••••••" /></Field>
      <Field label="From Name"><Input value={v.from_name ?? ''} onChange={val => set('from_name', val)} placeholder="NexusCRM" /></Field>
      <Field label="From Email"><Input value={v.from_email ?? ''} onChange={val => set('from_email', val)} type="email" placeholder="noreply@example.com" /></Field>
      <Field label="Use TLS / STARTTLS"><Toggle value={v.use_tls ?? 'true'} onChange={val => set('use_tls', val)} /></Field>
    </Section>
  );
}

function SecuritySection() {
  const { values: v, set, loading, saving, save, toast } = useSection('security');
  if (loading) return <Loader />;
  return (
    <Section title="Security Settings" desc="Control authentication rules and session policies." onSave={save} saving={saving} toast={toast}>
      <Field label="Multi-Factor Authentication" hint="Require MFA for all users"><Toggle value={v.mfa_enabled ?? 'false'} onChange={val => set('mfa_enabled', val)} /></Field>
      <Field label="Session Timeout (minutes)" hint="Idle sessions will expire after this">
        <Select value={v.session_timeout ?? '60'} onChange={val => set('session_timeout', val)} options={[
          { value: '15', label: '15 minutes' },
          { value: '30', label: '30 minutes' },
          { value: '60', label: '1 hour' },
          { value: '120', label: '2 hours' },
          { value: '480', label: '8 hours' },
        ]} />
      </Field>
      <Field label="Minimum Password Length">
        <Select value={v.password_min_length ?? '8'} onChange={val => set('password_min_length', val)} options={[
          { value: '6',  label: '6 characters' },
          { value: '8',  label: '8 characters (recommended)' },
          { value: '12', label: '12 characters (strong)' },
          { value: '16', label: '16 characters (very strong)' },
        ]} />
      </Field>
      <Field label="Max Failed Login Attempts" hint="Lock account after this many failures">
        <Select value={v.login_attempts ?? '5'} onChange={val => set('login_attempts', val)} options={[
          { value: '3',  label: '3 attempts' },
          { value: '5',  label: '5 attempts' },
          { value: '10', label: '10 attempts' },
        ]} />
      </Field>
    </Section>
  );
}

function NotificationsSection() {
  const { values: v, set, loading, saving, save, toast } = useSection('notifications');
  if (loading) return <Loader />;
  return (
    <Section title="Notification Settings" desc="Control how and when the CRM sends alerts." onSave={save} saving={saving} toast={toast}>
      <Field label="Email Alerts" hint="Send email for important system events"><Toggle value={v.email_alerts} onChange={val => set('email_alerts', val)} /></Field>
      <Field label="Lead Update Alerts" hint="Notify when lead stage changes"><Toggle value={v.lead_updates} onChange={val => set('lead_updates', val)} /></Field>
      <Field label="Task Reminders" hint="Receive reminders before task due dates"><Toggle value={v.task_reminders} onChange={val => set('task_reminders', val)} /></Field>
      <Field label="Daily Digest Email" hint="Receive a summary email each morning"><Toggle value={v.digest_email} onChange={val => set('digest_email', val)} /></Field>
    </Section>
  );
}

function PreferencesSection() {
  const { values: v, set, loading, saving, save, toast } = useSection('preferences');
  if (loading) return <Loader />;
  return (
    <Section title="User Preferences" desc="Personalise how the CRM looks and feels." onSave={save} saving={saving} toast={toast}>
      <Field label="Language">
        <Select value={v.language ?? 'en'} onChange={val => set('language', val)} options={[
          { value: 'en', label: 'English (US)' },
          { value: 'en-gb', label: 'English (UK)' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' },
          { value: 'es', label: 'Español' },
          { value: 'hi', label: 'हिन्दी' },
        ]} />
      </Field>
      <Field label="Date Format">
        <Select value={v.date_format ?? 'MM/DD/YYYY'} onChange={val => set('date_format', val)} options={[
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
        ]} />
      </Field>
      <Field label="Currency">
        <Select value={v.currency ?? 'USD'} onChange={val => set('currency', val)} options={[
          { value: 'USD', label: 'USD – US Dollar' },
          { value: 'EUR', label: 'EUR – Euro' },
          { value: 'GBP', label: 'GBP – British Pound' },
          { value: 'INR', label: 'INR – Indian Rupee' },
          { value: 'JPY', label: 'JPY – Japanese Yen' },
        ]} />
      </Field>
      <Field label="Theme">
        <Select value={v.theme ?? 'light'} onChange={val => set('theme', val)} options={[
          { value: 'light', label: '☀️  Light' },
          { value: 'dark',  label: '🌙  Dark' },
          { value: 'system', label: '💻  System default' },
        ]} />
      </Field>
    </Section>
  );
}

function BillingSection() {
  const { values: v, set, loading, saving, save, toast } = useSection('billing');
  if (loading) return <Loader />;

  const planColors = {
    Free: 'bg-slate-100 text-slate-700',
    Pro: 'bg-blue-100 text-blue-700',
    Enterprise: 'bg-amber-100 text-amber-700',
  };

  return (
    <Section title="Billing & Plan" desc="Manage your subscription and billing information." onSave={save} saving={saving} toast={toast}>
      <Field label="Current Plan">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${planColors[v.plan ?? 'Free'] ?? planColors.Free}`}>{v.plan ?? 'Free'}</span>
          <button className="text-xs text-blue-600 hover:underline font-medium">Upgrade Plan →</button>
        </div>
      </Field>
      <Field label="Billing Email" hint="Invoices will be sent here">
        <Input value={v.billing_email ?? ''} onChange={val => set('billing_email', val)} type="email" placeholder="billing@company.com" />
      </Field>
      <Field label="Payment Method">
        <div className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
          <CreditCard size={16} /> No payment method on file.
          <button className="ml-auto text-blue-600 font-medium text-xs hover:underline">Add card</button>
        </div>
      </Field>
    </Section>
  );
}

function ApiSection() {
  const { values: v, set, loading, saving, save, toast } = useSection('api');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(v.key ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generate = () => {
    const key = 'nx_' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
    set('key', key);
  };

  if (loading) return <Loader />;
  return (
    <Section title="API & Integrations" desc="Manage API keys and external webhook endpoints." onSave={save} saving={saving} toast={toast}>
      <Field label="API Key" hint="Use this key to authenticate external requests">
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={v.key ? '••••••••' + (v.key.slice(-8)) : 'No key generated'}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-500"
          />
          <button onClick={copy} className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
            {copied ? <><Check size={14} className="text-emerald-600"/> Copied</> : 'Copy'}
          </button>
          <button onClick={generate} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5">
            <RefreshCw size={14}/> Regen
          </button>
        </div>
      </Field>
      <Field label="Webhook URL" hint="POST events will be sent to this URL">
        <Input value={v.webhook_url ?? ''} onChange={val => set('webhook_url', val)} placeholder="https://yourapp.com/webhook" />
      </Field>
    </Section>
  );
}

function BackupSection() {
  const { values: v, set, loading, saving, save, toast } = useSection('backup');
  if (loading) return <Loader />;
  return (
    <Section title="Backup & Data" desc="Configure automated backups and data retention." onSave={save} saving={saving} toast={toast}>
      <Field label="Auto Backup" hint="Automatically back up your CRM data"><Toggle value={v.auto_backup} onChange={val => set('auto_backup', val)} /></Field>
      <Field label="Backup Frequency">
        <Select value={v.frequency ?? 'daily'} onChange={val => set('frequency', val)} options={[
          { value: 'hourly',  label: 'Every hour' },
          { value: 'daily',   label: 'Once a day' },
          { value: 'weekly',  label: 'Once a week' },
          { value: 'monthly', label: 'Once a month' },
        ]} />
      </Field>
      <Field label="Retention Period">
        <Select value={v.retention_days ?? '30'} onChange={val => set('retention_days', val)} options={[
          { value: '7',   label: '7 days' },
          { value: '14',  label: '14 days' },
          { value: '30',  label: '30 days' },
          { value: '90',  label: '90 days' },
          { value: '365', label: '1 year' },
        ]} />
      </Field>
      <Field label="Manual Backup">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
          <Database size={15}/> Create Backup Now
        </button>
      </Field>
    </Section>
  );
}

function RolesAccessSection() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('http://localhost:5146/api/users', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(setUsers)
      .catch(() => showToast('Failed to load users', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (userId, newRole) => {
    setProcessingId(userId);
    try {
      const res = await fetch('http://localhost:5146/api/users/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: [newRole] } : u));
      showToast('Role updated successfully!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally { setProcessingId(null); }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.id;
    setProcessingId(userId);
    setUserToDelete(null);
    try {
      const res = await fetch(`http://localhost:5146/api/users/${userId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted.');
    } catch (e) {
      showToast(e.message, 'error');
    } finally { setProcessingId(null); }
  };

  const roleColors = { Admin: 'text-amber-700 bg-amber-50 border-amber-200', Manager: 'text-indigo-700 bg-indigo-50 border-indigo-200', Sales: 'text-blue-700 bg-blue-50 border-blue-200', User: 'text-slate-600 bg-slate-50 border-slate-200' };

  return (
    <div>
      <Toast {...(toast ?? { msg: null, type: 'success' })} />
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Roles & Access Control</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage user roles and permissions. Only Admins can assign roles.</p>
      </div>

      {user?.role !== 'Admin' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 bg-red-50 rounded-xl border border-red-100 space-y-3">
          <Shield size={40} className="text-red-300" />
          <div>
            <p className="font-semibold text-slate-800">Access Restricted</p>
            <p className="text-sm">Only Administrators can manage user roles.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {loading ? <div className="p-8 text-center text-slate-400 text-sm">Loading users...</div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">Current Role</th>
                  <th className="px-5 py-3 text-left font-medium">Change Role</th>
                  <th className="px-5 py-3 text-left font-medium">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => {
                  const isSelf = user.email === u.email;
                  const role = u.roles?.[0] ?? 'User';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border font-bold text-slate-500 flex items-center justify-center text-sm shrink-0">
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{u.fullName} {isSelf && <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold">You</span>}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-1 rounded-full border ${roleColors[role] ?? roleColors.User}`}>{role}</span></td>
                      <td className="px-5 py-3.5">
                        <select
                          value={role}
                          disabled={isSelf || processingId === u.id}
                          onChange={e => changeRole(u.id, e.target.value)}
                          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="Admin">Administrator</option>
                          <option value="Manager">Manager</option>
                          <option value="Sales">Sales Rep</option>
                          <option value="User">Read-Only User</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setUserToDelete(u)}
                          disabled={isSelf || processingId === u.id}
                          className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 px-2.5 py-1.5 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Remove User?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to permanently remove <span className="font-semibold text-slate-700">{userToDelete.fullName}</span>? This action revokes all access and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={deleteUser}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-200 transition-all active:scale-95"
                >
                  Remove User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, desc, children, onSave, saving, toast }) {
  return (
    <div>
      <Toast {...(toast ?? { msg: null, type: 'success' })} />
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl px-6 divide-y divide-slate-100">
        {children}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-70"
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Loader() { return <div className="py-16 text-center text-slate-400 text-sm animate-pulse">Loading settings…</div>; }

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'general',       label: 'General',       icon: Building2,  component: GeneralSection },
  { id: 'smtp',          label: 'SMTP / Email',   icon: Mail,       component: SmtpSection },
  { id: 'security',      label: 'Security',       icon: Lock,       component: SecuritySection },
  { id: 'notifications', label: 'Notifications',  icon: Bell,       component: NotificationsSection },
  { id: 'preferences',   label: 'Preferences',    icon: User,       component: PreferencesSection },
  { id: 'billing',       label: 'Billing',        icon: CreditCard, component: BillingSection },
  { id: 'api',           label: 'API & Integrations', icon: Zap,    component: ApiSection },
  { id: 'backup',        label: 'Backup',         icon: Database,   component: BackupSection },
  { id: 'roles',         label: 'Roles & Access', icon: Shield,     component: RolesAccessSection },
];

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeId, setActiveId] = useState('general');
  const { user } = useAuth();

  const active = NAV.find(n => n.id === activeId) ?? NAV[0];
  const ActiveComponent = active.component;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 bg-slate-50 -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8">
      {/* ── Sidebar ── */}
      <div className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SettingsIcon size={18} className="text-blue-600" />
            <span className="font-bold text-slate-900 text-sm tracking-wide">Settings</span>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-0.5">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            // Hide roles for non-admin
            if (item.id === 'roles' && user?.role !== 'Admin') return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
                {!isActive && <ChevronRight size={14} className="ml-auto text-slate-300" />}
              </button>
            );
          })}
        </nav>
        {/* Role badge at bottom */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock size={12} /> Logged as <span className="font-semibold text-slate-600">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <ActiveComponent />
      </div>
    </div>
  );
}
