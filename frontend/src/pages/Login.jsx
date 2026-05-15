import { Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const url = isRegister 
       ? 'http://localhost:5146/api/auth/register' 
       : 'http://localhost:5146/api/auth/login';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data && Array.isArray(data)) {
          throw new Error(data[0]?.description || 'Authentication failed');
        }
        throw new Error(data?.message || data?.title || 'Authentication failed');
      }

      if (isRegister) {
        setIsRegister(false);
        setSuccess("Registration successful! Please sign in.");
        setFormData({ ...formData, password: '' }); // Clear password
      } else {
        localStorage.setItem('crm_token', data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative z-10 flex items-center gap-2">
          <Zap size={28} className="text-blue-500 fill-blue-500" />
          <span className="text-2xl font-bold tracking-tight">NexusCRM</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-semibold tracking-tight mb-6 leading-tight">
            The intelligent platform for modern sales teams.
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Manage your pipeline, track customer interactions, and close deals faster with our enterprise-grade CRM solution.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
            <div className="flex -space-x-3">
              <img src="https://ui-avatars.com/api/?name=Alex&background=1e293b&color=fff" alt="User" className="w-10 h-10 rounded-full border-2 border-slate-900" />
              <img src="https://ui-avatars.com/api/?name=Sarah&background=334155&color=fff" alt="User" className="w-10 h-10 rounded-full border-2 border-slate-900" />
              <img src="https://ui-avatars.com/api/?name=Mike&background=475569&color=fff" alt="User" className="w-10 h-10 rounded-full border-2 border-slate-900" />
            </div>
            <span>Trusted by over 10,000+ professionals</span>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-slate-500">
          &copy; 2026 NexusCRM Inc. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 text-slate-900">
            <Zap size={28} className="text-blue-600 fill-blue-600" />
            <span className="text-2xl font-bold tracking-tight">NexusCRM</span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            {isRegister ? 'Enter your details to get started.' : 'Please enter your account details to sign in.'}
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="mt-6">
             <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M11 1h9v9h-9z"/><path fill="#7fba00" d="M1 11h9v9H1z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
                  Microsoft
                </button>
             </div>

             <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with email</span>
                </div>
             </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1">
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" placeholder="John Doe" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" placeholder="you@company.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">Remember me</label>
              </div>

              {!isRegister && (
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500" onClick={(e) => {
                    e.preventDefault();
                    if (!formData.email) {
                      setError("Please enter your email address first to reset password.");
                      return;
                    }
                    setError(null);
                    setSuccess(null);
                    setLoading(true);
                    fetch('http://localhost:5146/api/auth/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email })
                    }).then(res => res.json()).then(data => {
                        setSuccess(data.message + (data.devResetToken ? " (Dev Token: " + data.devResetToken + ")" : ""));
                        setLoading(false);
                    }).catch(err => {
                        setError("Failed to request password reset.");
                        setLoading(false);
                    });
                  }}>Forgot password?</a>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="mt-6 w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
               {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
               {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-slate-600">
             {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
             <button onClick={() => { setIsRegister(!isRegister); setError(null); setSuccess(null); }} className="font-medium text-blue-600 hover:text-blue-500">
               {isRegister ? 'Sign in' : 'Sign up'}
             </button>
          </p>
        </div>
      </div>
    </div>
  );
}
