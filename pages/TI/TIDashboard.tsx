import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const TIDashboard = () => {
  const [activeTab, setActiveTab] = useState('USUARIOS');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Novos Estados para Formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    perfil: '',
    status: true,
    admAccess: false
  });

  // Mapeamento de Perfis
  const PROFILE_MAP: Record<string, string> = {
    'USER': 'Policial (Padrão)',
    'ADM_N2': 'Adm. Operacional',
    'ADM_N3': 'Adm. Escalas',
    'ADM_N4': 'Supervisão',
    'TI': 'Desenvolvedor / TI'
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nome');
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async () => {
    if (!formData.nome || !formData.email || !formData.matricula) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('profiles').insert([
      {
        nome: formData.nome,
        email: formData.email,
        matricula: formData.matricula,
        perfil: formData.perfil,
        status: formData.status,
        adm_access: formData.admAccess,
        nivel: formData.perfil === 'TI' ? 4 : (formData.perfil === 'ADM_N4' ? 3 : 1)
      }
    ]);

    if (!error) {
      // LOG ACTION
      await supabase.from('system_logs').insert({
        level: 'INFO',
        action: 'CREATE_USER',
        details: { ...formData },
        matricula: 'TI_ADMIN'
      });

      alert("Usuário criado com sucesso!");
      setFormData({ nome: '', email: '', matricula: '', perfil: '', status: true, admAccess: false });
      fetchUsers();
    } else {
      alert("Erro ao criar usuário: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
            <span className="material-icons-round text-xl">shield</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 leading-tight">RAI ENVIOS</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TI / ADMIN</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <SidebarButton icon="grid_view" label="Painel Geral" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
          <SidebarButton icon="manage_accounts" label="Usuários & Acessos" active={activeTab === 'USUARIOS'} onClick={() => setActiveTab('USUARIOS')} />
          <SidebarButton icon="lock_person" label="Permissões" active={activeTab === 'PERMISSOES'} onClick={() => setActiveTab('PERMISSOES')} />
          <SidebarButton icon="history" label="Logs do Sistema" active={activeTab === 'LOGS'} onClick={() => setActiveTab('LOGS')} />
          <SidebarButton icon="dns" label="Banco de Dados" active={activeTab === 'DB'} onClick={() => setActiveTab('DB')} />
          <SidebarButton icon="settings" label="Configurações" active={activeTab === 'CONFIG'} onClick={() => setActiveTab('CONFIG')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
            <span className="material-icons-round">logout</span>
            Sair
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">

        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900">Gerenciamento de Usuários</h2>
        </div>

        {activeTab === 'USUARIOS' && (
          <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">

            {/* CARD: NOVO ACESSO */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Novo Acesso</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Corporativo</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="usuario@policia.gov.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="Nome do Agente"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matrícula</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="000.000-0"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil de Acesso</label>
                  <div className="relative">
                    <select
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-medium"
                      value={formData.perfil}
                      onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                    >
                      <option value="">Selecionar perfil...</option>
                      <option value="USER">Policial (Padrão)</option>
                      <option value="ADM_N2">Adm. Operacional</option>
                      <option value="ADM_N3">Adm. Escalas</option>
                      <option value="ADM_N4">Supervisão</option>
                      <option value="TI">Desenvolvedor / TI</option>
                    </select>
                    <span className="material-icons-round absolute right-4 top-3.5 text-slate-400 pointer-events-none text-lg">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Ativo</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.admAccess}
                        onChange={(e) => setFormData({ ...formData, admAccess: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Pode Acessar ADM</span>
                  </label>
                </div>

                <button
                  onClick={handleSaveUser}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-50"
                >
                  <span className={`material-icons-round text-lg ${loading ? 'animate-spin' : ''}`}>{loading ? 'sync' : 'save'}</span>
                  {loading ? 'Processando...' : 'Salvar'}
                </button>
              </div>
            </div>

            {/* LISTA DE USUÁRIOS */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Usuários Cadastrados</h3>
                <div className="relative">
                  <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
                  <input className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-80 placeholder-slate-400 font-medium" placeholder="Filtrar por nome ou matrícula..." />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matrícula</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Nível</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Acesso ADM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{user.email}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{user.nome}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{user.matricula}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                            {PROFILE_MAP[user.perfil] || user.perfil}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700 text-sm">{user.nivel}</td>
                        <td className="px-6 py-4 text-center">
                          {user.status ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ATIVO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> INATIVO
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {user.adm_access ? (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mx-auto shadow-sm">
                              <span className="material-icons-round text-white text-sm">check</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mx-auto">
                              <span className="material-icons-round text-slate-400 text-sm">close</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

const SidebarButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm mb-1 ${active
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
  >
    <span className="material-icons-round text-lg">{icon}</span>
    {label}
  </button>
);

export default TIDashboard;