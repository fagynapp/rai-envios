import React, { useState, useMemo } from 'react';
import { usePoliceData, Policial } from '../../contexts/PoliceContext';

// Estendendo a interface localmente para suportar campos específicos do Almanaque
interface PolicialAlmanaque extends Policial {
  observacoes?: string;
  data_atualizacao?: string;
  posicao_geral?: number;
  posicao_equipe?: number;
}

const AdminAlmanaque = () => {
  const { policiais, setPoliciais, availableTeams } = usePoliceData();
  const [search, setSearch] = useState('');
  const [selectedEquipe, setSelectedEquipe] = useState('TODAS');
  const [rankFilter, setRankFilter] = useState<'TODOS' | 'OFICIAL' | 'PRACA'>('TODOS');

  // Estados para Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    id: 0,
    nome: '',
    matricula: '',
    equipe: '',
    observacoes: '',
    data_atualizacao: '',
    posicao_geral: 0,
    posicao_equipe: 0
  });

  // Helper para formatar matrícula: 37123 -> 37.123
  const formatMatricula = (value: string) => {
    if (!value) return '-';
    const clean = value.replace(/\D/g, '');
    if (clean.length === 5) {
      return clean.replace(/^(\d{2})(\d{3})$/, '$1.$2');
    }
    return value;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
  };

  const getEquipeColor = (equipe: string) => {
    switch(equipe?.trim().toUpperCase()) {
      case 'ALPHA': return 'bg-blue-100 text-blue-700';
      case 'BRAVO': return 'bg-green-100 text-green-700';
      case 'CHARLIE': return 'bg-orange-100 text-orange-700';
      case 'DELTA': return 'bg-purple-100 text-purple-700';
      case 'COMANDO': 
      case 'SUBCMT': return 'bg-red-100 text-red-700';
      case 'P2':
      case 'P3':
      case 'P4': return 'bg-slate-200 text-slate-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Funções para calcular Posição (Ranking) AUTOMÁTICO (Fallback)
  const calculateGeneralRank = (id: number) => {
    return policiais.findIndex(p => p.id === id) + 1;
  };

  const calculateTeamRank = (policial: Policial) => {
    const teamMembers = policiais.filter(p => p.equipe === policial.equipe);
    return teamMembers.findIndex(p => p.id === policial.id) + 1;
  };

  // Helpers de Classificação de Posto/Graduação
  const isOfficer = (name: string) => {
    const n = name.toUpperCase();
    return n.includes('MAJ ') || n.includes('CAP ') || n.includes('TEN ') || n.includes('ASP ') || n.includes('CEL ') || n.includes('TC ') || n.includes('CORONEL ');
  };

  const isPraca = (name: string) => {
    const n = name.toUpperCase();
    return n.includes('SD ') || n.includes('CB ') || n.includes('SGT ') || n.includes('ST ') || n.includes('SUB ');
  };

  // Lógica de Filtragem
  const filteredPoliciais = policiais.filter((policial) => {
    const term = search.toLowerCase();
    const cleanTerm = term.replace(/\D/g, '');
    const cleanMatricula = policial.matricula.replace(/\D/g, '');

    const matchesName = policial.nome.toLowerCase().includes(term);
    const matchesMatricula = cleanTerm.length > 0 && cleanMatricula.includes(cleanTerm);
    const matchesSearch = term === '' || matchesName || matchesMatricula;

    const policialEquipe = policial.equipe ? policial.equipe.toString().trim().toLowerCase() : '';
    const filtroEquipe = selectedEquipe.trim().toLowerCase();
    const matchesEquipe = selectedEquipe === 'TODAS' || policialEquipe === filtroEquipe;
    
    let matchesRank = true;
    if (rankFilter === 'OFICIAL') {
        matchesRank = isOfficer(policial.nome);
    } else if (rankFilter === 'PRACA') {
        matchesRank = isPraca(policial.nome);
    }

    return matchesSearch && matchesEquipe && matchesRank;
  });

  // Estatísticas Dinâmicas
  const stats = useMemo(() => {
      return {
          total: policiais.length,
          oficiais: policiais.filter(p => isOfficer(p.nome)).length,
          pracas: policiais.filter(p => isPraca(p.nome)).length,
          filtrados: filteredPoliciais.length
      };
  }, [policiais, filteredPoliciais]);

  // --- Handlers de Ação ---

  const handleEdit = (policial: PolicialAlmanaque) => {
    const hoje = new Date().toISOString().split('T')[0];

    // Se já tiver posição salva manualmente, usa ela. Senão, calcula.
    const currentGeneralRank = policial.posicao_geral || calculateGeneralRank(policial.id);
    const currentTeamRank = policial.posicao_equipe || calculateTeamRank(policial);

    setFormData({
      id: policial.id,
      nome: policial.nome,
      matricula: policial.matricula,
      equipe: policial.equipe,
      observacoes: policial.observacoes || '',
      data_atualizacao: policial.data_atualizacao || hoje,
      posicao_geral: currentGeneralRank,
      posicao_equipe: currentTeamRank
    });
    setEditingId(policial.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Deseja remover ${nome} do Almanaque (e do sistema)?`)) {
        setPoliciais(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Atualiza o policial preservando dados originais e salvando as edições do almanaque
      setPoliciais(prev => prev.map(p => p.id === editingId ? { 
          ...p, 
          // Equipe não é atualizada aqui (vem do original 'p'), apenas mostrada no form
          observacoes: formData.observacoes,
          data_atualizacao: formData.data_atualizacao,
          posicao_geral: Number(formData.posicao_geral),
          posicao_equipe: Number(formData.posicao_equipe)
      } as unknown as Policial : p));
      
      setIsModalOpen(false);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><span className="material-icons-round">groups</span></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Efetivo</p>
            <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><span className="material-icons-round">military_tech</span></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Oficiais</p>
            <span className="text-2xl font-bold text-slate-800">{stats.oficiais}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><span className="material-icons-round">shield</span></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Praças</p>
            <span className="text-2xl font-bold text-slate-800">{stats.pracas}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><span className="material-icons-round">filter_list</span></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Filtrados</p>
            <span className="text-2xl font-bold text-slate-800">{stats.filtrados}</span>
          </div>
        </div>
      </div>

      {/* Barra de Ferramentas (Busca e Filtros) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
        {/* Busca e Filtros de Posto */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
            <div className="relative w-full md:w-80">
                <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">search</span>
                <input 
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-slate-400" 
                    placeholder="Pesquisar por Policial ou Matrícula..." 
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

            {/* Botões Oficial / Praça */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setRankFilter(rankFilter === 'OFICIAL' ? 'TODOS' : 'OFICIAL')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${rankFilter === 'OFICIAL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
                >
                    <span className="material-icons-round text-sm">military_tech</span>
                    Oficial
                </button>
                <button 
                    onClick={() => setRankFilter(rankFilter === 'PRACA' ? 'TODOS' : 'PRACA')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${rankFilter === 'PRACA' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
                >
                    <span className="material-icons-round text-sm">shield</span>
                    Praça
                </button>
            </div>
        </div>

        {/* Filtros Direita */}
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative w-full md:w-auto">
              <select
                value={selectedEquipe}
                onChange={(e) => setSelectedEquipe(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none md:min-w-[150px]"
              >
                <option value="TODAS">Filtros (Equipe)</option>
                {availableTeams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
           </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredPoliciais.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                    <tr>
                    <th className="px-4 py-3 font-black text-center text-blue-700 bg-blue-50/50 border-r border-slate-200">Posição Geral</th>
                    <th className="px-4 py-3 font-black text-center border-r border-slate-200">Posição Equipe</th>
                    <th className="px-4 py-3 font-bold">Policial</th>
                    <th className="px-4 py-3 font-bold">Matrícula</th>
                    <th className="px-4 py-3 font-bold text-center">Equipe</th>
                    <th className="px-4 py-3 font-bold text-center">Atualização</th>
                    <th className="px-4 py-3 font-bold">Observações</th>
                    <th className="px-4 py-3 font-bold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredPoliciais.map((policial) => {
                        const p = policial as PolicialAlmanaque;
                        return (
                        <tr key={policial.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-black text-blue-600 text-center bg-blue-50/30 border-r border-slate-100 text-lg">
                                {p.posicao_geral || calculateGeneralRank(policial.id)}º
                            </td>
                            <td className="px-4 py-3 text-center border-r border-slate-100 font-bold text-slate-600">
                                {p.posicao_equipe || calculateTeamRank(policial)}º
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800 uppercase">{policial.nome}</td>
                            <td className="px-4 py-3 font-mono text-slate-600">{formatMatricula(policial.matricula)}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`${getEquipeColor(policial.equipe)} px-2 py-1 rounded text-[10px] font-bold uppercase`}>
                                    {policial.equipe}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                {p.data_atualizacao ? formatDate(p.data_atualizacao) : '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs italic max-w-xs truncate">
                                {p.observacoes || '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(policial)} className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors" title="Editar">
                                        <span className="material-icons-round text-lg">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(policial.id, policial.nome)} className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors" title="Excluir">
                                        <span className="material-icons-round text-lg">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
                </table>
            </div>
        ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <span className="material-icons-round text-slate-300 text-5xl mb-3">search_off</span>
              <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
              <p className="text-slate-400 text-xs mt-1">
                {search ? 'Tente buscar por outro nome ou matrícula.' : 'Tente alterar os filtros.'}
              </p>
            </div>
        )}
      </div>

      {/* Modal de Edição (Almanaque) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-2xl">edit_note</span>
                <div>
                  <h3 className="font-bold text-lg">Editar Registro do Almanaque</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Atualizar Dados Administrativos</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><span className="material-icons-round">close</span></button>
            </div>

            {/* Aviso sobre dados bloqueados */}
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex gap-3 items-start">
               <span className="material-icons-round text-blue-500 text-lg mt-0.5">info</span>
               <p className="text-xs text-blue-800 leading-relaxed">
                 <span className="font-bold">Atenção:</span> Dados cadastrais como Nome, Matrícula e Equipe são gerenciados exclusivamente no menu <strong>Gestão de Policiais</strong>.
               </p>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {/* POSIÇÕES EDITÁVEIS */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Posição Geral</span>
                    <div className="flex items-center">
                        <input 
                            type="number"
                            name="posicao_geral"
                            value={formData.posicao_geral}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-blue-300 text-blue-700 font-black text-2xl rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        />
                        <span className="text-blue-400 font-bold ml-1">º</span>
                    </div>
                 </div>
                 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-green-600 uppercase block mb-1">Posição Equipe</span>
                     <div className="flex items-center">
                        <input 
                            type="number"
                            name="posicao_equipe"
                            value={formData.posicao_equipe}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-green-300 text-green-700 font-black text-2xl rounded px-2 py-1 outline-none focus:ring-2 focus:ring-green-500 text-center"
                        />
                        <span className="text-green-500 font-bold ml-1">º</span>
                    </div>
                 </div>
              </div>

              {/* DADOS IDENTIFICAÇÃO (BLOQUEADOS) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Policial</label>
                  <div className="relative">
                    <input 
                        value={formData.nome}
                        readOnly
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-sm text-slate-500 font-bold outline-none cursor-not-allowed" 
                    />
                    <span className="material-icons-round absolute left-2 top-2 text-slate-400 text-sm">lock</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Matrícula</label>
                  <div className="relative">
                    <input 
                        value={formData.matricula} 
                        readOnly
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-sm text-slate-500 font-mono font-bold outline-none cursor-not-allowed" 
                    />
                    <span className="material-icons-round absolute left-2 top-2 text-slate-400 text-sm">lock</span>
                  </div>
                </div>
              </div>

              {/* DADOS DE ATUALIZAÇÃO E EQUIPE */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Equipe / Setor</label>
                    <div className="relative">
                      <input 
                          value={formData.equipe} 
                          readOnly 
                          disabled 
                          className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-sm text-slate-500 font-bold outline-none cursor-not-allowed uppercase"
                      />
                      <span className="material-icons-round absolute left-2 top-2 text-slate-400 text-sm">lock</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Atualização</label>
                    <input 
                        type="date"
                        name="data_atualizacao" 
                        value={formData.data_atualizacao} 
                        onChange={handleInputChange} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
                    />
                  </div>
              </div>

              <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações</label>
                  <textarea 
                    name="observacoes" 
                    value={formData.observacoes} 
                    onChange={handleInputChange} 
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none" 
                    placeholder="Adicione observações pertinentes ao almanaque..." 
                  />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-colors">Salvar Dados</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlmanaque;