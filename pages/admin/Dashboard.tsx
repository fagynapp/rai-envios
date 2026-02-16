import React from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts'; // Mock

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Título removido conforme solicitado */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">RAIs Pendentes</p>
              <h3 className="text-3xl font-bold text-orange-500 mt-2">2</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <span className="material-icons-round">pending_actions</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4"><span className="text-red-500 font-medium">+1</span> desde ontem</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Dispensas (Mês)</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">0</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-icons-round">event_available</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Meta mensal: 12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Policiais Ativos</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">142</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <span className="material-icons-round">shield</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4"><span className="text-green-600 font-medium">98%</span> do efetivo</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Pontos Totais</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-2">8.4k</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <span className="material-icons-round">stars</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Ciclo atual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Solicitações Recentes</h3>
            <button className="text-blue-600 text-sm font-medium">Ver todas</button>
          </div>
          <div className="p-4">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Policial</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-medium">Cb. Silva</td>
                  <td className="px-4 py-3 text-slate-600">Dispensa Padrão</td>
                  <td className="px-4 py-3 text-slate-500">24/10/2023</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Análise</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Sd. Oliveira</td>
                  <td className="px-4 py-3 text-slate-600">Banco de Horas</td>
                  <td className="px-4 py-3 text-slate-500">23/10/2023</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Aprovado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Produtividade por Pelotão</h3>
            <div className="h-40 flex items-end justify-between px-4 gap-2">
               {/* Mock Chart Bars */}
               <div className="w-full bg-blue-100 rounded-t-lg relative h-3/4"><div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg h-3/4"></div></div>
               <div className="w-full bg-blue-100 rounded-t-lg relative h-full"><div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg h-full"></div></div>
               <div className="w-full bg-blue-100 rounded-t-lg relative h-1/2"><div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg h-1/2"></div></div>
               <div className="w-full bg-blue-100 rounded-t-lg relative h-2/3"><div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg h-2/3"></div></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500 px-4">
              <span>Pel 1</span><span>Pel 2</span><span>Pel 3</span><span>Pel 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;