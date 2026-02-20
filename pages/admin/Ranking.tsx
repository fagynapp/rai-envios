import React, { useState, useMemo, useEffect } from 'react';
import { usePoliceData } from '../../contexts/PoliceContext';

const AdminRanking = () => {
  const { policiais, availableTeams } = usePoliceData();
  const [search, setSearch] = useState('');
  const [selectedEquipe, setSelectedEquipe] = useState('TODAS');
  
  // Date Picker States
  const [showDatePickerMenu, setShowDatePickerMenu] = useState(false);
  const [activeFilterLabel, setActiveFilterLabel] = useState('Este Mês');
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(20);
  
  // Mock Data Augmentation for Ranking (Generates random scores for display purposes)
  const rankingData = useMemo(() => {
    return policiais.map(p => ({
      ...p,
      points: Math.floor(Math.random() * 2000) + 500, // Mock points between 500 and 2500
      evolution: Math.random() > 0.5 ? 'up' : 'down',
      evolutionValue: Math.floor(Math.random() * 10)
    })).sort((a, b) => b.points - a.points);
  }, [policiais]);

  const filteredRanking = rankingData.filter(p => {
      const matchesSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || 
                            p.matricula.includes(search);
      const matchesTeam = selectedEquipe === 'TODAS' || p.equipe === selectedEquipe;
      return matchesSearch && matchesTeam;
  });

  // Calculate Stats based on filtered data
  const stats = useMemo(() => {
    const leader = filteredRanking.length > 0 ? filteredRanking[0] : null;
    const totalPoints = filteredRanking.reduce((acc, curr) => acc + curr.points, 0);
    // Mock logic for RAIs count based on points (approx. 11.2 points per RAI avg for this mock)
    const totalRais = Math.floor(totalPoints / 11.23); 
    const count = filteredRanking.length;

    return { leader, totalPoints, totalRais, count };
  }, [filteredRanking]);

  const filterOptions = [
    { label: 'Hoje', action: () => {} },
    { label: 'Semanal', action: () => {} },
    { label: 'Este Mês', action: () => {} },
    { label: 'Trimestral', action: () => {} },
    { label: 'Semestral', action: () => {} },
    { label: 'Anual', action: () => {} },
  ];

  const handleFilterClick = (label: string, action?: () => void) => {
    setActiveFilterLabel(label);
    if (action) action();
    setShowDatePickerMenu(false);
  };

  const handleOpenExportModal = () => {
    alert("Funcionalidade de Exportação (CSV/PDF) será implementada aqui.");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (showDatePickerMenu && !target.closest('.date-picker-container')) {
            setShowDatePickerMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePickerMenu]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [search, selectedEquipe, activeFilterLabel]);

  return (
    <div className="space-y-6">
      {/* Top Stats Cards - Updated Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         
         {/* Card 1: Líder */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Líder do Período</p>
                <p className="text-lg font-black text-slate-900 truncate max-w-[140px] leading-tight" title={stats.leader?.nome || '-'}>
                    {stats.leader?.nome || '-'}
                </p>
                <p className="text-xs font-bold text-green-600 mt-0.5">
                    {stats.leader ? `${stats.leader.points} pts` : '0 pts'}
                </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                <span className="material-icons-round">emoji_events</span>
            </div>
         </div>

         {/* Card 2: Total Pontos */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Total Pontos</p>
                <p className="text-2xl font-black text-blue-600 leading-none">
                    {stats.totalPoints.toLocaleString('pt-BR')}
                </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <span className="material-icons-round">stars</span>
            </div>
         </div>

         {/* Card 3: RAIs Validados */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">RAIs Validados</p>
                <p className="text-2xl font-black text-slate-800 leading-none">
                    {stats.totalRais.toLocaleString('pt-BR')}
                </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                <span className="material-icons-round">assignment_turned_in</span>
            </div>
         </div>

         {/* Card 4: Efetivo Listado */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Efetivo Listado</p>
                <p className="text-2xl font-black text-slate-800 leading-none">
                    {stats.count}
                </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                <span className="material-icons-round">groups</span>
            </div>
         </div>

      </div>

      {/* Barra de Ferramentas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
        {/* Busca */}
        <div className="relative w-full md:w-80">
          <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">search</span>
          <input 
            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-slate-400" 
            placeholder="Pesquisar Policial ou Matrícula..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <span className="material-icons-round text-lg">close</span>
            </button>
          )}
        </div>

        {/* Filtros Direita */}
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center">
           {/* SELETOR DE DATA PERSONALIZADO */}
           <div className="relative date-picker-container col-span-1 md:flex-none">
              <button 
                onClick={() => setShowDatePickerMenu(!showDatePickerMenu)}
                className="w-full md:w-auto h-10 px-2 md:px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 md:gap-2 shadow-sm"
              >
                <span className="material-icons-round text-base md:text-lg text-slate-400">calendar_month</span>
                <span className="truncate max-w-[60px] md:max-w-none">{activeFilterLabel}</span>
                <span className="material-icons-round text-sm ml-1 text-slate-400 hidden sm:inline">expand_more</span>
              </button>
              
              {/* Dropdown Menu */}
              {showDatePickerMenu && (
                <div className="absolute top-12 left-0 md:left-auto md:right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-2 animate-[fadeIn_0.1s_ease-out]">
                  {filterOptions.map((option, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleFilterClick(option.label, option.action)}
                      className="w-full text-left px-4 py-2 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-between"
                    >
                      {option.label}
                      {activeFilterLabel === option.label && <span className="material-icons-round text-blue-600 text-xs">check</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={() => handleFilterClick('Personalizado')}
                    className="w-full text-left px-4 py-2 text-xs font-bold uppercase text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-icons-round text-base">date_range</span>
                    Personalizado
                  </button>
                </div>
              )}
            </div>

           {/* Filtro de Equipe */}
           <div className="relative col-span-1 md:flex-none">
              <select
                value={selectedEquipe}
                onChange={(e) => setSelectedEquipe(e.target.value)}
                className="w-full md:w-auto h-10 bg-slate-50 border border-slate-200 rounded-lg px-2 md:px-3 text-[10px] md:text-xs font-bold uppercase text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-0 md:min-w-[150px]"
              >
                <option value="TODAS">Equipes</option>
                {availableTeams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
           </div>
           
           <button onClick={handleOpenExportModal} className="h-10 px-2 md:px-4 bg-slate-800 text-white rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide hover:bg-slate-900 transition-colors flex items-center justify-center gap-1 md:gap-2 col-span-1 md:flex-none">
             <span className="material-icons-round text-base md:text-lg">download</span>
             <span className="truncate">Exportar</span>
           </button>
        </div>
      </div>

      {/* Lista de Ranking */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden pb-1">
        {filteredRanking.length > 0 ? (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-3 w-16 text-center">Pos</th>
                                <th className="px-6 py-3">Policial</th>
                                <th className="px-6 py-3 text-center">Equipe</th>
                                <th className="px-6 py-3 text-center">RAIs Aprovados</th>
                                <th className="px-6 py-3 text-center">Pontuação</th>
                                <th className="px-6 py-3 text-right">Evolução</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRanking.slice(0, visibleCount).map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-slate-200 text-slate-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'text-slate-500'
                                        }`}>
                                            {index + 1}º
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                                {item.nome.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-xs uppercase">{item.nome}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{item.matricula}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                            {item.equipe}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                                        {Math.floor(item.points / 50)} <span className="text-[9px] text-slate-400">RAIs</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-blue-600 font-black">{item.points}</span> <span className="text-[10px] text-slate-400 font-bold">PTS</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`inline-flex items-center gap-1 text-xs font-bold ${item.evolution === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                                            <span className="material-icons-round text-sm">{item.evolution === 'up' ? 'arrow_upward' : 'arrow_downward'}</span>
                                            {item.evolutionValue}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Botão Ver Mais */}
                {visibleCount < filteredRanking.length && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 20)}
                            className="bg-white border border-slate-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-full text-xs font-bold uppercase transition-all shadow-sm flex items-center gap-2"
                        >
                            <span className="material-icons-round text-sm">expand_more</span>
                            Ver mais ({filteredRanking.length - visibleCount} restantes)
                        </button>
                    </div>
                )}
            </>
        ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
                <span className="material-icons-round text-slate-300 text-5xl mb-3">search_off</span>
                <p className="text-slate-500 font-medium">Nenhum policial encontrado no ranking.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminRanking;