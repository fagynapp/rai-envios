import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState<'OPERACIONAL' | 'ESCALA'>('OPERACIONAL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de autenticação
    if (selectedRole === 'OPERACIONAL') {
        navigate('/admin/dashboard');
    } else {
        navigate('/adminescala/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header Decorativo */}
        <div className={`p-8 text-center text-white transition-colors duration-300 ${selectedRole === 'OPERACIONAL' ? 'bg-blue-700' : 'bg-indigo-700'}`}>
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-lg">
            <span className="material-icons-round text-3xl">
                {selectedRole === 'OPERACIONAL' ? 'shield' : 'calendar_month'}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-wide">Acesso Administrativo</h1>
          <p className="text-xs text-white/80 mt-1 uppercase tracking-wider">
            {selectedRole === 'OPERACIONAL' ? 'Gestão Operacional & Produtividade' : 'Gestão de Escalas & Efetivo'}
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          
          {/* Seletor de Perfil */}
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button 
                type="button"
                onClick={() => setSelectedRole('OPERACIONAL')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    selectedRole === 'OPERACIONAL' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Admin Operacional
            </button>
            <button 
                type="button"
                onClick={() => setSelectedRole('ESCALA')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    selectedRole === 'ESCALA' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Admin Escala
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">ID Administrativo</label>
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-3 text-slate-400 text-lg">badge</span>
                        <input 
                            className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:ring-2 focus:bg-white rounded-lg transition-all outline-none font-medium" 
                            placeholder="Matrícula ou Email" 
                            type="text" 
                            value={credentials.email}
                            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                            style={{ 
                                borderColor: 'transparent',
                                '--tw-ring-color': selectedRole === 'OPERACIONAL' ? '#1d4ed8' : '#4338ca' 
                            } as any}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Senha de Acesso</label>
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-3 text-slate-400 text-lg">lock</span>
                        <input 
                            className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:ring-2 focus:bg-white rounded-lg transition-all outline-none font-medium" 
                            placeholder="••••••••" 
                            type="password" 
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            style={{ 
                                borderColor: 'transparent',
                                '--tw-ring-color': selectedRole === 'OPERACIONAL' ? '#1d4ed8' : '#4338ca' 
                            } as any}
                        />
                    </div>
                </div>
            </div>

            <button 
                className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all transform active:scale-95 ${
                    selectedRole === 'OPERACIONAL' 
                    ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-200' 
                    : 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-200'
                }`}
            >
              <span className="material-icons-round text-lg mr-2">login</span>
              Acessar Painel {selectedRole === 'OPERACIONAL' ? 'Operacional' : 'de Escala'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
            <Link to="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
              <span className="material-icons-round text-sm">arrow_back</span>
              Voltar ao Login Geral
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;