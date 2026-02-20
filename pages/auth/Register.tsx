import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    graduacao: 'SD',
    nomeGuerra: '',
    matricula: '',
    telefone: '',
    equipe: 'Alpha',
    dataNascimento: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    // Tratamento especial para matrícula: apenas números e max 5 dígitos
    if (name === 'matricula') {
      value = value.replace(/\D/g, '').slice(0, 5);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamSelect = (team: string) => {
    setFormData(prev => ({ ...prev, equipe: team }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.matricula || !formData.nomeGuerra) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    if (formData.matricula.length !== 5) {
      alert("A matrícula deve conter exatamente 5 dígitos numéricos.");
      return;
    }
    console.log("Dados do Registro:", formData);
    alert("Solicitação de cadastro enviada com sucesso! Aguarde aprovação.");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header Azul conforme imagem */}
        <div className="bg-blue-600 p-6 text-center text-white pb-8">
          <div className="mx-auto w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-sm">
            <span className="material-icons-round text-3xl">person_add_alt</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide">Auto Cadastro</h1>
          <p className="text-xs text-blue-100 mt-1 opacity-90">Preencha seus dados para solicitar acesso</p>
        </div>
        
        <div className="p-6 pt-8 bg-white rounded-t-3xl -mt-4 relative z-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Nome Completo */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo</label>
              <input 
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-400" 
                placeholder="Nome completo" 
              />
            </div>

            {/* Graduação e Nome de Guerra */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Graduação</label>
                <div className="relative">
                  <select 
                    name="graduacao"
                    value={formData.graduacao}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
                  >
                    <option value="SD">SD</option>
                    <option value="CB">CB</option>
                    <option value="3º SGT">3º SGT</option>
                    <option value="2º SGT">2º SGT</option>
                    <option value="1º SGT">1º SGT</option>
                    <option value="ST">SUB TEN</option>
                  </select>
                  <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-sm pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome de Guerra</label>
                <input 
                  name="nomeGuerra"
                  value={formData.nomeGuerra}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-400" 
                  placeholder="Ex: SILVA" 
                />
              </div>
            </div>

            {/* Email Pessoal e Data de Nascimento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Pessoal</label>
                <input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-400" 
                  placeholder="seu.email@exemplo.com" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Data de Nascimento</label>
                <input 
                  name="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-400" 
                />
              </div>
            </div>

            {/* Matrícula e Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Matrícula</label>
                <input 
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-400" 
                  placeholder="00000"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Telefone</label>
                <input 
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-400" 
                  placeholder="(00) 00000-0000" 
                />
              </div>
            </div>

            {/* Pelotão/Equipe */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pelotão/Equipe</label>
              <div className="flex gap-2">
                {['Alpha', 'Bravo', 'Charlie', 'Delta'].map((team) => (
                  <button 
                    key={team} 
                    type="button" 
                    onClick={() => handleTeamSelect(team)}
                    className={`flex-1 py-2.5 border rounded-lg text-xs font-bold uppercase transition-all shadow-sm ${
                      formData.equipe === team 
                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-100' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-6 flex gap-3">
              <Link to="/" className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 text-center hover:bg-gray-50 transition-colors">
                Voltar
              </Link>
              <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;