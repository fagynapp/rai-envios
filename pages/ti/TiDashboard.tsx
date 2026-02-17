import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 py-3 px-4 font-medium rounded-lg transition-all duration-200 ${active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
    >
        <span className="material-icons-round text-[20px]">{icon}</span>
        <span className="whitespace-nowrap overflow-hidden">
            {label}
        </span>
    </button>
);

const TiDashboard = () => {
    const [activeSection, setActiveSection] = useState('PAINEL');
    const [activeLogTab, setActiveLogTab] = useState('ACESSO');

    // Mock Data for Table
    const [users] = useState([
        { id: 1, email: 'marcos.silva@policia.gov.br', nome: 'Marcos Antonio da Silva', matricula: '284.102-1', perfil: 'ADMINISTRADOR', nivel: 3, status: 'ATIVO', adm: true },
        { id: 2, email: 'ana.costa@policia.gov.br', nome: 'Ana Paula Costa', matricula: '159.330-X', perfil: 'DELEGADO', nivel: 2, status: 'ATIVO', adm: false },
        { id: 3, email: 'ricardo.lima@policia.gov.br', nome: 'Ricardo Lima Jr.', matricula: '442.115-3', perfil: 'ESCRIVÃO', nivel: 1, status: 'INATIVO', adm: false },
    ]);

    return (
        <div className="flex h-screen bg-slate-50 font-inter">
            {/* Sidebar Standalone */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0">
                        <span className="material-icons-round text-xl">shield</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 leading-tight">RAI ENVIOS</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TI / ADMIN</p>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
                    <SidebarItem icon="grid_view" label="Painel Geral" active={activeSection === 'PAINEL'} onClick={() => setActiveSection('PAINEL')} />
                    <SidebarItem icon="manage_accounts" label="Usuários & Acessos" active={activeSection === 'USUARIOS'} onClick={() => setActiveSection('USUARIOS')} />
                    <SidebarItem icon="lock" label="Permissões" active={activeSection === 'PERMISSOES'} onClick={() => setActiveSection('PERMISSOES')} />
                    <SidebarItem icon="history" label="Logs do Sistema" active={activeSection === 'LOGS'} onClick={() => setActiveSection('LOGS')} />
                    <SidebarItem icon="dns" label="Banco de Dados" active={activeSection === 'DB'} onClick={() => setActiveSection('DB')} />
                    <SidebarItem icon="settings" label="Configurações" active={activeSection === 'CONFIG'} onClick={() => setActiveSection('CONFIG')} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <Link to="/" className="flex items-center gap-3 py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <span className="material-icons-round">logout</span>
                        <span>Sair</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto space-y-8">

                    {/* Content Area */}
                    {activeSection === 'PAINEL' && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                            <h2 className="text-3xl font-black text-slate-900 mb-6">Painel Geral</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-700">Usuários Ativos</h3>
                                        <span className="material-icons-round text-green-500 bg-green-50 p-2 rounded-lg">person</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">128</p>
                                    <p className="text-xs text-slate-500 mt-1">+12 nesta semana</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-700">Logs (24h)</h3>
                                        <span className="material-icons-round text-blue-500 bg-blue-50 p-2 rounded-lg">history</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">2.4k</p>
                                    <p className="text-xs text-slate-500 mt-1">Acessos e alterações</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-700">Status Sistema</h3>
                                        <span className="material-icons-round text-green-500 bg-green-50 p-2 rounded-lg">dns</span>
                                    </div>
                                    <p className="text-3xl font-black text-green-600">Online</p>
                                    <p className="text-xs text-slate-500 mt-1">Versão 2.1.0 (Stable)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'USUARIOS' && (
                        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                            <h2 className="text-3xl font-black text-slate-900">Gerenciamento de Usuários</h2>
                            {/* Form: Novo Acesso */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Novo Acesso</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Corporativo</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" placeholder="usuario@policia.gov.br" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                                        <input className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do Agente" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Matrícula</label>
                                        <input className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" placeholder="000.000-0" />
                                    </div>
                                    <div className="md:col-span-1 flex items-end">
                                        <div className="w-full">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Perfil de Acesso</label>
                                            <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>Selecionar perfil...</option>
                                                <option>Administrador</option>
                                                <option>Delegado</option>
                                                <option>Escrivão</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-6 bg-blue-600 rounded-full p-1 cursor-pointer flex justify-end">
                                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Ativo</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-6 bg-slate-200 rounded-full p-1 cursor-pointer flex justify-start">
                                                <div className="w-4 h-4 bg-white rounded-full shadow-sm border border-slate-100"></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Pode Acessar ADM</span>
                                        </div>
                                    </div>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-100 flex items-center gap-2 transition-colors">
                                        <span className="material-icons-round text-sm">save</span>
                                        Salvar
                                    </button>
                                </div>
                            </div>
                            {/* Table: Usuários Cadastrados */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-lg font-bold text-slate-800">Usuários Cadastrados</h3>
                                    <div className="relative">
                                        <input className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64" placeholder="Filtrar por nome ou matrícula..." />
                                        <span className="material-icons-round absolute left-3 top-2 text-slate-400 text-lg">search</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Nome</th>
                                                <th className="px-6 py-4">Matrícula</th>
                                                <th className="px-6 py-4">Perfil</th>
                                                <th className="px-6 py-4">Nível</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-center">Acesso ADM</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map(user => (
                                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-800 w-1/4">{user.nome}</td>
                                                    <td className="px-6 py-4 font-mono text-slate-500">{user.matricula}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-slate-200">
                                                            {user.perfil}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-800">{user.nivel}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${user.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ATIVO' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {user.adm ? (
                                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white shadow-sm">
                                                                <span className="material-icons-round text-sm">check</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                                <span className="material-icons-round text-sm">close</span>
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

                    {activeSection === 'PERMISSOES' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <h2 className="text-3xl font-black text-slate-900">Matriz de Permissões</h2>
                            <div className="flex items-center justify-between">
                                <p className="text-slate-500 text-sm">Gerencie o que cada perfil pode visualizar ou editar.</p>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors">
                                    + Novo Perfil
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {['Administrador', 'Comandante', 'Oficial de Dia', 'Sargento de Dia', 'Auxiliar'].map((role, idx) => (
                                    <div key={role} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                                                {role.charAt(0)}
                                            </div>
                                            <button className="text-slate-400 hover:text-blue-600"><span className="material-icons-round">edit</span></button>
                                        </div>
                                        <h4 className="font-bold text-slate-800">{role}</h4>
                                        <p className="text-xs text-slate-500 mt-1 mb-4">Acesso total ao sistema de gestão e configurações.</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-icons-round text-green-500 text-sm">check_circle</span>
                                                <span>Dashboard</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-icons-round text-green-500 text-sm">check_circle</span>
                                                <span>Relatórios PDF</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-icons-round ${idx === 0 ? 'text-green-500' : 'text-slate-300'} text-sm">{idx === 0 ? 'check_circle' : 'remove_circle'}</span>
                                                <span>Gestão de Usuários</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'LOGS' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <h2 className="text-3xl font-black text-slate-900">Logs do Sistema</h2>
                            {/* Sub-tabs for Logs */}
                            <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
                                <button
                                    onClick={() => setActiveLogTab('ACESSO')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeLogTab === 'ACESSO' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Histórico de Acesso
                                </button>
                                <button
                                    onClick={() => setActiveLogTab('AUDITORIA')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeLogTab === 'AUDITORIA' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Trilha de Auditoria
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">
                                        {activeLogTab === 'ACESSO' ? 'Logins e Sessões' : 'Alterações de Dados'}
                                    </h3>
                                    <button className="text-blue-600 text-sm font-bold hover:underline">Exportar CSV</button>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Data/Hora</th>
                                            <th className="px-6 py-3">Usuário</th>
                                            <th className="px-6 py-3">IP Origem</th>
                                            <th className="px-6 py-3">Ação/Evento</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-6 py-3 text-slate-600 text-xs font-mono">17/02/2026 10:3{i}:00</td>
                                                <td className="px-6 py-3 font-medium text-slate-800">Maj. Anderson Silva</td>
                                                <td className="px-6 py-3 text-slate-500 text-xs font-mono">192.168.1.{10 + i}</td>
                                                <td className="px-6 py-3 text-slate-600">{activeLogTab === 'ACESSO' ? 'Login via Web' : 'Alterou Configuração de Escala'}</td>
                                                <td className="px-6 py-3">
                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Sucesso</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === 'DB' && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                            <h2 className="text-3xl font-black text-slate-900 mb-6">Banco de Dados & Ferramentas</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-red-300 transition-colors group cursor-pointer">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        <span className="material-icons-round">delete_sweep</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900">Limpar Cache</h4>
                                    <p className="text-xs text-slate-500 mt-2">Remove arquivos temporários e reseta estados locais da aplicação.</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors group cursor-pointer">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <span className="material-icons-round">backup</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900">Backup Manual</h4>
                                    <p className="text-xs text-slate-500 mt-2">Força a realização de um backup do banco de dados agora.</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors group cursor-pointer">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <span className="material-icons-round">restart_alt</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900">Reiniciar Serviços</h4>
                                    <p className="text-xs text-slate-500 mt-2">Reinicia os workers de segundo plano e conexões de API.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'CONFIG' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            {/* Sub-tabs Navigation */}
                            <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
                                <button className="flex items-center gap-2 px-1 py-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600">
                                    <span className="material-icons-round text-lg">vpn_key</span>
                                    Chaves do Sistema
                                </button>
                                <button className="flex items-center gap-2 px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                                    <span className="material-icons-round text-lg">error</span>
                                    Logs de Erro
                                </button>
                                <button className="flex items-center gap-2 px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                                    <span className="material-icons-round text-lg">api</span>
                                    Permissões API
                                </button>
                                <button className="flex items-center gap-2 px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                                    <span className="material-icons-round text-lg">cloud_upload</span>
                                    Backups
                                </button>
                            </div>

                            {/* Header Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">TI - Configurações do Sistema (Ajustado)</h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Gerenciamento técnico de constantes e variáveis de ambiente globais. <span className="text-blue-600 font-medium">Aviso:</span> Alterações nestes valores impactam diretamente as regras de negócio e cálculos automáticos do sistema.
                                </p>
                            </div>

                            {/* Warning Alert */}
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-start gap-3">
                                <span className="material-icons-round text-orange-500 mt-0.5">warning</span>
                                <div>
                                    <h4 className="text-sm font-bold text-orange-800">Atenção em Auditoria</h4>
                                    <p className="text-xs text-orange-700 mt-1">
                                        Toda alteração de chave é registrada com log de IP e usuário para fins de auditoria interna conforme a LGPD e normas da corregedoria.
                                    </p>
                                </div>
                            </div>

                            {/* Keys Table Card */}
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Chave</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Valor</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { key: 'META_SEG_QUI', value: '100', desc: 'Meta de produtividade estabelecida para turnos operacionais de Segunda a Quinta-feira.' },
                                            { key: 'META_SEX_DOM', value: '140', desc: 'Meta de produtividade elevada para turnos de Sexta a Domingo (plantões especiais).' },
                                            { key: 'PRAZO_RAI_DIAS', value: '90', desc: 'Prazo máximo (em dias) para a expiração e arquivamento de relatórios RAI não consolidados.' },
                                            { key: 'TIMEOUT_SESSAO_ADMIN', value: '30', desc: 'Tempo de expiração de sessão em minutos para usuários com nível administrativo.' }
                                        ].map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-5 align-top">
                                                    <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold px-2 py-1 rounded">
                                                        {item.key}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        defaultValue={item.value}
                                                    />
                                                </td>
                                                <td className="px-6 py-5 align-top text-sm text-slate-600 leading-relaxed">
                                                    {item.desc}
                                                </td>
                                                <td className="px-6 py-5 align-top text-right">
                                                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                                        <span className="material-icons-round text-lg">edit</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <span className="text-xs text-slate-400 italic">Última atualização global: 12/10/2023 14:32 por admin_central</span>
                                    <div className="flex items-center gap-3">
                                        <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all">
                                            Cancelar Alterações
                                        </button>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md shadow-blue-200 flex items-center gap-2 transition-all">
                                            <span className="material-icons-round text-sm">save</span>
                                            SALVAR TODAS AS ALTERAÇÕES
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TiDashboard;
