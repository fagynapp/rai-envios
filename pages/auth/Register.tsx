import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    graduacao: 'SD',
    nomeGuerra: '',
    matricula: '',
    telefone: '',
    email: '',
    aniversario: '',
    equipe: 'Alpha'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.matricula || !formData.nomeGuerra) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    if (formData.matricula.length !== 5) {
      alert("A matrícula deve conter exatamente 5 dígitos numéricos.");
      return;
    }

    try {
      // Formatando o nome para o padrão da aplicação (Graduação + Nome de Guerra)
      // O nome completo não está sendo salvo no esquema atual, apenas o de display.
      // Se quiser salvar o nome completo, precisaria alterar o banco.
      // Por enquanto, vou salvar o Nome de Guerra formatado como 'nome'
      const nomeFormatado = `${formData.graduacao} ${formData.nomeGuerra.toUpperCase()}`;

      const { error } = await supabase
        .from('policiais')
        .insert([
          {
            nome: nomeFormatado,
            matricula: formData.matricula,
            equipe: formData.equipe.toUpperCase(),
            telefone: formData.telefone,
            email: formData.email,
            aniversario: formData.aniversario
          }
        ]);

      if (error) {
        throw error;
      }

      console.log("Dados do Registro:", formData);
      alert("Cadastro realizado com sucesso! Aguarde aprovação.");
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao realizar cadastro: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-center text-white">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
            <span className="material-icons-round text-2xl">person_add</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide">Auto Cadastro</h1>
          <p className="text-xs text-blue-100 mt-1">Preencha seus dados para solicitar acesso</p>
        </div>

        <div className="p-6 space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo</label>
              <input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Nome completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Graduação</label>
                <select
                  name="graduacao"
                  value={formData.graduacao}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="CEL">CEL</option>
                  <option value="TC">TC</option>
                  <option value="MAJ">MAJ</option>
                  <option value="CAP">CAP</option>
                  <option value="ST">ST</option>
                  <option value="1ºSGT">1ºSGT</option>
                  <option value="2ºSGT">2ºSGT</option>
                  <option value="3ºSGT">3ºSGT</option>
                  <option value="CB">CB</option>
                  <option value="SD">SD</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome de Guerra</label>
                <input
                  name="nomeGuerra"
                  value={formData.nomeGuerra}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Ex: SILVA"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Pessoal</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="seu.email@exemplo.com"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Data de Nascimento</label>
                <input
                  name="aniversario"
                  value={formData.aniversario}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  type="date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Matrícula</label>
                <input
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pelotão/Equipe</label>
              <div className="flex gap-2">
                {['Alpha', 'Bravo', 'Charlie', 'Delta'].map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => handleTeamSelect(team)}
                    className={`flex-1 py-2 border rounded text-xs font-bold uppercase transition-colors ${formData.equipe === team
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Link to="/" className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 text-center hover:bg-gray-50">
                Voltar
              </Link>
              <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 shadow-md">
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