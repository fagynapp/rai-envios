import React from 'react';

const EscalaVirtual = () => {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <span className="material-icons-round text-2xl">devices</span>
                </div>
                <h1 className="text-3xl font-bold">Escala Virtual</h1>
            </div>
            <p className="text-indigo-200 text-sm max-w-xl">
                Gestão de escalas virtuais e monitoramento remoto.
            </p>
        </div>
        <span className="material-icons-round absolute -right-6 -bottom-10 text-[180px] opacity-10 text-white">vpn_lock</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <span className="material-icons-round text-6xl text-slate-200 mb-4">cloud_queue</span>
        <h3 className="text-xl font-bold text-slate-700">Módulo de Escala Virtual</h3>
        <p className="text-slate-500 mt-2">A interface de gestão da escala virtual será implementada aqui.</p>
      </div>
    </div>
  );
};

export default EscalaVirtual;