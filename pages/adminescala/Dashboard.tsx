import React from 'react';
import { usePoliceData } from '../../contexts/PoliceContext';

const AdminEscalaDashboard = () => {
  const { policiais, availableTeams } = usePoliceData();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Específico */}
      <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <span className="material-icons-round text-2xl">calendar_month</span>
                </div>
                <h1 className="text-3xl font-bold">Gestão de Escalas</h1>
            </div>
            <p className="text-indigo-200 text-sm max-w-xl">
                Área exclusiva para gerenciamento de efetivo, criação de escalas de serviço e controle de folgas.
            </p>
        </div>
        {/* Background Decor */}
        <span className="material-icons-round absolute -right-6 -bottom-10 text-[180px] opacity-10 text-white">date_range</span>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <span className="material-icons-round text-2xl">groups</span>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">ATIVO</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{policiais.length}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Total de Efetivo</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <span className="material-icons-round text-2xl">view_column</span>
                </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{availableTeams.length}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Equipes Configuradas</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <span className="material-icons-round text-2xl">edit_calendar</span>
                </div>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full">JANEIRO</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Escala Aberta</h3>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Status Atual</p>
        </div>
      </div>

      {/* Área de Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-icons-round text-indigo-600">rocket_launch</span>
                Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl flex flex-col items-center justify-center text-center transition-all group">
                    <span className="material-icons-round text-2xl text-slate-400 group-hover:text-indigo-600 mb-2">add_task</span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-800">Nova Escala</span>
                </button>
                <button className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl flex flex-col items-center justify-center text-center transition-all group">
                    <span className="material-icons-round text-2xl text-slate-400 group-hover:text-indigo-600 mb-2">published_with_changes</span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-800">Troca de Serviço</span>
                </button>
                <button className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl flex flex-col items-center justify-center text-center transition-all group">
                    <span className="material-icons-round text-2xl text-slate-400 group-hover:text-indigo-600 mb-2">print</span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-800">Imprimir Escala</span>
                </button>
                <button className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl flex flex-col items-center justify-center text-center transition-all group">
                    <span className="material-icons-round text-2xl text-slate-400 group-hover:text-indigo-600 mb-2">settings</span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-800">Configurar Turnos</span>
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-icons-round text-indigo-600">notifications</span>
                Avisos do Sistema
            </h3>
            <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
                    <span className="material-icons-round text-yellow-600 text-sm mt-0.5">warning</span>
                    <div>
                        <p className="text-xs font-bold text-yellow-800">Inconsistência na Equipe Alpha</p>
                        <p className="text-[10px] text-yellow-700 mt-0.5">Dois policiais escalados no mesmo posto para o dia 25/01.</p>
                    </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                    <span className="material-icons-round text-blue-600 text-sm mt-0.5">info</span>
                    <div>
                        <p className="text-xs font-bold text-blue-800">Fechamento de Mês</p>
                        <p className="text-[10px] text-blue-700 mt-0.5">Lembre-se de gerar o relatório final até o dia 30.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEscalaDashboard;