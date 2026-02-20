import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TILogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ user: '', pass: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validate credentials here
    navigate('/ti/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl relative z-10">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
              <span className="material-icons-round text-3xl text-white">settings_suggest</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">TI Central</h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest mt-1 font-medium">Acesso Administrativo Infraestrutura</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">ID Técnico / Email</label>
              <div className="relative group">
                <span className="material-icons-round absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors">fingerprint</span>
                <input 
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600 text-sm font-medium"
                  placeholder="admin.ti@policia.gov.br"
                  value={credentials.user}
                  onChange={(e) => setCredentials({...credentials, user: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Chave de Acesso</label>
              <div className="relative group">
                <span className="material-icons-round absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors">password</span>
                <input 
                  type="password"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600 text-sm font-medium"
                  placeholder="••••••••••••"
                  value={credentials.pass}
                  onChange={(e) => setCredentials({...credentials, pass: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">login</span>
              Autenticar
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-center">
            <Link to="/" className="text-slate-500 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors">
              <span className="material-icons-round text-sm">arrow_back</span>
              Voltar ao Sistema Principal
            </Link>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="bg-slate-900/50 px-8 py-3 rounded-b-2xl border-t border-slate-700 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM_READY</span>
          </div>
          <span>v2.1.0-RC</span>
        </div>
      </div>
    </div>
  );
};

export default TILogin;