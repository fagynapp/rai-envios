import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (role: 'user' | 'admin') => {
    // Simulação de login
    if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/user/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, insira um e-mail.");
      return;
    }
    // Lógica simples para demo
    if (email.includes('admin')) {
      handleLogin('admin');
    } else {
      handleLogin('user');
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <span className="material-icons-round text-3xl">verified_user</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">RAI ENVIOS</h1>
          <p className="text-xs text-blue-100 mt-1 uppercase tracking-wider opacity-90">BPM Terminal - Sistema de Produtividade</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Acesso Rápido (Desenvolvimento)</h2>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleLogin('user')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition border border-transparent hover:border-blue-200">
                <span className="material-icons-round text-blue-600 mb-1">person_outline</span>
                <span className="text-[10px] font-semibold text-gray-600">Usuário</span>
              </button>
              <button onClick={() => handleLogin('admin')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition border border-transparent hover:border-blue-200">
                <span className="material-icons-round text-blue-600 mb-1">verified_user</span>
                <span className="text-[10px] font-semibold text-gray-600">Admin</span>
              </button>
              <button onClick={() => alert("Acesso TI em manutenção.")} className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition border border-transparent hover:border-blue-200">
                <span className="material-icons-round text-blue-600 mb-1">computer</span>
                <span className="text-[10px] font-semibold text-gray-600">TI</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] font-bold uppercase tracking-widest">Ou Login Manual</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">E-mail Corporativo</label>
              <input 
                className="block w-full pl-4 pr-4 py-3 text-sm text-gray-900 bg-gray-50 border border-transparent focus:ring-2 focus:ring-blue-600 focus:bg-white rounded-lg transition-all outline-none" 
                placeholder="exemplo@pm.go.gov.br" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <span className="material-icons-round text-lg mr-2">login</span>
              Entrar no Sistema
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/register" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Não tem conta? Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;