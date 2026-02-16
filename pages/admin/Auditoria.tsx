import React, { useState, useMemo } from 'react';

// --- Interfaces ---
interface AuditoriaItem {
  id: number;
  dataEnvio: string;
  dataRai: string;
  numeroRai: string;
  natureza: string;
  pontos: number;
  policial: string;
  matricula: string;
  equipe: string;
  status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
  motivoReprovacao?: string;
  obs?: string; // Campo para anotações do ADM
}

// --- Mock Data ---
const MOCK_AUDITORIA: AuditoriaItem[] = [
  { id: 1, dataEnvio: '2024-01-24', dataRai: '2024-01-23', numeroRai: '20240001500', natureza: 'Prisão em Flagrante', pontos: 50, policial: 'SD LUCAS MIGUEL', matricula: '39874', equipe: 'Alpha', status: 'PENDENTE', obs: '' },
  { id: 2, dataEnvio: '2024-01-24', dataRai: '2024-01-22', numeroRai: '20240001580', natureza: 'Recuperação de Veículo', pontos: 20, policial: '1º SGT RAMOS', matricula: '24955', equipe: 'Alpha', status: 'PENDENTE', obs: 'Verificar se o veículo foi restituído.' },
  { id: 3, dataEnvio: '2024-01-23', dataRai: '2024-01-20', numeroRai: '20240001600', natureza: 'Apreensão de Arma', pontos: 30, policial: 'CB PASSOS', matricula: '38183', equipe: 'P2', status: 'APROVADO', obs: '' },
  { id: 4, dataEnvio: '2024-01-22', dataRai: '2023-11-15', numeroRai: '20230550123', natureza: 'TCO', pontos: 10, policial: 'SD BRITO', matricula: '39580', equipe: 'Charlie', status: 'REPROVADO', motivoReprovacao: 'RAI fora do prazo (90 dias)', obs: '' },
  { id: 5, dataEnvio: '2024-01-24', dataRai: '2024-01-24', numeroRai: '20240001750', natureza: 'Prisão em Flagrante', pontos: 50, policial: '3º SGT JAIRO', matricula: '35768', equipe: 'Delta', status: 'PENDENTE', obs: '' },
  { id: 6, dataEnvio: '2024-01-24', dataRai: '2024-01-23', numeroRai: '20240001800', natureza: 'TCO', pontos: 10, policial: 'CB CASTRO', matricula: '36277', equipe: 'Delta', status: 'PENDENTE', obs: '' },
];

const AdminAuditoria = () => {
  const [items, setItems] = useState<AuditoriaItem[]>(MOCK_AUDITORIA);
  const [activeTab, setActiveTab] = useState<'PENDENTES' | 'APROVADOS' | 'REPROVADOS'>('PENDENTES');
  const [search, setSearch] = useState('');

  // --- Estados de Expansão e Notas ---
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  // --- Estados do Modal de Reprovação ---
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // --- Estados do Modal de Edição ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AuditoriaItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    numeroRai: '',
    natureza: '',
    pontos: 0,
    dataRai: ''
  });

  // --- Estatísticas ---
  const stats = useMemo(() => {
    return {
      pendentes: items.filter(i => i.status === 'PENDENTE').length,
      aprovados: items.filter(i => i.status === 'APROVADO').length,
      reprovados: items.filter(i => i.status === 'REPROVADO').length,
      pontosEmAnalise: items.filter(i => i.status === 'PENDENTE').reduce((acc, curr) => acc + curr.pontos, 0)
    };
  }, [items]);

  // --- Filtragem ---
  const filteredList = items.filter(item => {
    // Filtro por Aba
    if (activeTab === 'PENDENTES' && item.status !== 'PENDENTE') return false;
    if (activeTab === 'APROVADOS' && item.status !== 'APROVADO') return false;
    if (activeTab === 'REPROVADOS' && item.status !== 'REPROVADO') return false;

    // Filtro de Busca
    const term = search.toLowerCase();
    const match = 
      item.numeroRai.includes(term) ||
      item.policial.toLowerCase().includes(term) ||
      item.matricula.includes(term) ||
      item.natureza.toLowerCase().includes(term);
    
    return match;
  });

  // --- Helpers de Formatação ---
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
  };

  const formatMatricula = (value: string) => {
    if (!value) return '-';
    const clean = value.replace(/\D/g, '');
    if (clean.length === 5) {
      return clean.replace(/^(\d{2})(\d{3})$/, '$1.$2');
    }
    return value;
  };

  // --- Ações de Expansão e Notas ---
  const toggleExpand = (id: number) => {
    if (expandedRecordId === id) {
      setExpandedRecordId(null);
      setNoteText('');
    } else {
      setExpandedRecordId(id);
      const item = items.find(i => i.id === id);
      setNoteText(item?.obs || '');
    }
  };

  const handleSaveNote = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, obs: noteText } : item
    ));
    alert("Anotação salva com sucesso!");
  };

  // --- Ações de Aprovação/Reprovação ---
  const handleApprove = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'APROVADO' } : item
    ));
  };

  const handleRejectClick = (id: number) => {
    setRejectId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectId !== null) {
      setItems(prev => prev.map(item => 
        item.id === rejectId ? { ...item, status: 'REPROVADO', motivoReprovacao: rejectReason || 'Motivo não informado' } : item
      ));
      setShowRejectModal(false);
      setRejectId(null);
    }
  };

  const handleRevert = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'PENDENTE', motivoReprovacao: undefined } : item
    ));
  };

  // --- Ações de Edição de Registro ---
  const handleEditClick = (item: AuditoriaItem) => {
    setEditingItem(item);
    setEditFormData({
      numeroRai: item.numeroRai,
      natureza: item.natureza,
      pontos: item.pontos,
      dataRai: item.dataRai
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? { 
          ...item, 
          numeroRai: editFormData.numeroRai,
          natureza: editFormData.natureza,
          pontos: Number(editFormData.pontos),
          dataRai: editFormData.dataRai
        } : item
      ));
      setShowEditModal(false);
      setEditingItem(null);
      alert("Registro atualizado com sucesso!");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. DASHBOARD DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <span className="material-icons-round">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pendentes Análise</p>
            <p className="text-2xl font-black text-slate-800">{stats.pendentes}</p>
            <p className="text-[10px] text-orange-500 font-bold mt-0.5">Aguardando Ação</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <span className="material-icons-round">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Aprovado</p>
            <p className="text-2xl font-black text-slate-800">{stats.aprovados}</p>
            <p className="text-[10px] text-green-500 font-bold mt-0.5">Processados</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-icons-round">cancel</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Reprovado</p>
            <p className="text-2xl font-black text-slate-800">{stats.reprovados}</p>
            <p className="text-[10px] text-red-500 font-bold mt-0.5">Inconsistentes</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-icons-round">stars</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pontos em Jogo</p>
            <p className="text-2xl font-black text-slate-800">{stats.pontosEmAnalise}</p>
            <p className="text-[10px] text-blue-500 font-bold mt-0.5">Fila Pendente</p>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE FERRAMENTAS E ABAS - AJUSTADO PARA MOBILE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 md:gap-4 items-center justify-between z-20 relative">
        {/* Busca - Sempre ocupa toda a largura no mobile */}
        <div className="relative w-full md:w-80">
          <div className="relative w-full">
            <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">search</span>
            <input 
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-slate-400" 
              placeholder="RAI, Policial, Matrícula..." 
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
        </div>

        {/* Seletor de Abas - Ocupa toda a largura no mobile e alinha com a busca */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('PENDENTES')}
            className={`flex-1 md:flex-none px-2 md:px-4 py-1.5 rounded-md text-[9px] md:text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap ${activeTab === 'PENDENTES' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600'}`}
          >
            <span className="material-icons-round text-sm">hourglass_empty</span>
            Pendentes
            {stats.pendentes > 0 && <span className="ml-0.5 md:ml-1 bg-white/20 px-1 rounded text-[8px]">{stats.pendentes}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('APROVADOS')}
            className={`flex-1 md:flex-none px-2 md:px-4 py-1.5 rounded-md text-[9px] md:text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap ${activeTab === 'APROVADOS' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500 hover:text-green-600'}`}
          >
            <span className="material-icons-round text-sm">check_circle</span>
            Aprovados
          </button>
          <button 
            onClick={() => setActiveTab('REPROVADOS')}
            className={`flex-1 md:flex-none px-2 md:px-4 py-1.5 rounded-md text-[9px] md:text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap ${activeTab === 'REPROVADOS' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-red-600'}`}
          >
            <span className="material-icons-round text-sm">cancel</span>
            Reprovados
          </button>
        </div>
      </div>

      {/* 3. TABELA DE DADOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center">Data Envio</th>
                  <th className="px-4 py-3 text-center">Data RAI</th>
                  <th className="px-4 py-3">Nº RAI</th>
                  <th className="px-4 py-3">Natureza</th>
                  <th className="px-4 py-3 text-center">Pontos</th>
                  <th className="px-4 py-3">Policial</th>
                  <th className="px-4 py-3 text-center">Matrícula</th>
                  {activeTab === 'REPROVADOS' && <th className="px-4 py-3">Motivo</th>}
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr 
                        onClick={() => toggleExpand(item.id)}
                        className={`transition-colors cursor-pointer group ${expandedRecordId === item.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    >
                        <td className="px-4 py-3 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                            <span className={`material-icons-round text-lg transition-transform duration-200 text-gray-400 ${expandedRecordId === item.id ? 'rotate-180 text-blue-600' : ''}`}>
                                expand_more
                            </span>
                            {formatDate(item.dataEnvio)}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700 text-xs">{formatDate(item.dataRai)}</td>
                        <td className="px-4 py-3 font-mono text-blue-600 font-bold">{item.numeroRai}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium text-xs max-w-[150px] truncate" title={item.natureza}>{item.natureza}</td>
                        <td className="px-4 py-3 text-center">
                            <span className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded border border-blue-100 text-xs">
                            {item.pontos}
                            </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 text-xs uppercase">
                            <div>{item.policial}</div>
                            <div className="text-[9px] text-slate-400 font-normal mt-0.5">Equipe {item.equipe}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-500 text-xs">{formatMatricula(item.matricula)}</td>
                        
                        {activeTab === 'REPROVADOS' && (
                            <td className="px-4 py-3 text-xs text-red-500 italic max-w-[150px] truncate" title={item.motivoReprovacao}>
                                {item.motivoReprovacao}
                            </td>
                        )}

                        <td className="px-4 py-3 text-right">
                        {activeTab === 'PENDENTES' && (
                            <div className="flex justify-end gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }} 
                                className="flex items-center gap-1 bg-green-700 text-white border border-green-700 hover:bg-green-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                title="Aprovar Registro"
                            >
                                <span className="material-icons-round text-sm">check</span>
                                Aprovar
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleRejectClick(item.id); }} 
                                className="flex items-center gap-1 bg-red-700 text-white border border-red-700 hover:bg-red-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                title="Reprovar Registro"
                            >
                                <span className="material-icons-round text-sm">close</span>
                                Reprovar
                            </button>
                            </div>
                        )}
                        {(activeTab === 'APROVADOS' || activeTab === 'REPROVADOS') && (
                            <div className="flex justify-end">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRevert(item.id); }} 
                                    className="flex items-center gap-1 bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                    title="Reverter para Pendente"
                                >
                                    <span className="material-icons-round text-sm">undo</span>
                                    Reverter
                                </button>
                            </div>
                        )}
                        </td>
                    </tr>

                    {/* Linha Expandida (Accordion) */}
                    {expandedRecordId === item.id && (
                        <tr className="bg-blue-50/20 border-b border-blue-100 animate-[fadeIn_0.2s_ease-out]">
                            <td colSpan={9} className="px-6 py-4">
                                <div className="flex flex-col gap-4 pl-4 border-l-4 border-blue-200 ml-4">
                                    <div className="flex items-start justify-between">
                                        <div className="w-full mr-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-icons-round text-blue-500 text-sm">sticky_note_2</span>
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Anotações Administrativas</span>
                                            </div>
                                            <textarea 
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm"
                                                rows={2}
                                                placeholder="Escreva observações internas sobre este registro..."
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="mt-2 flex gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleSaveNote(item.id); }}
                                                    className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Salvar Nota
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="shrink-0 flex flex-col gap-2 border-l border-slate-100 pl-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Ações do Registro</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-colors"
                                            >
                                                <span className="material-icons-round text-base">edit_note</span>
                                                Editar Dados
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <span className="material-icons-round text-slate-300 text-5xl mb-3">
                {activeTab === 'PENDENTES' ? 'done_all' : 'search_off'}
            </span>
            <p className="text-slate-500 font-medium">
                {activeTab === 'PENDENTES' ? 'Tudo limpo! Nenhuma pendência.' : 'Nenhum registro encontrado nesta aba.'}
            </p>
          </div>
        )}
      </div>

      {/* 4. MODAL DE REPROVAÇÃO */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-red-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-2xl">report_problem</span>
                <div>
                  <h3 className="font-bold text-lg">Reprovar Registro</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Justifique a ação</p>
                </div>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            
            <form onSubmit={confirmReject} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Motivo da Reprovação</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none" 
                  rows={3}
                  placeholder="Ex: RAI duplicado, fora do prazo, dados inconsistentes..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  autoFocus
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)} 
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-200 transition-colors"
                >
                  Confirmar Reprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL DE EDIÇÃO DE REGISTRO */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-2xl">edit_note</span>
                <div>
                  <h3 className="font-bold text-lg">Editar Registro</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Correção de Dados</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                 <p className="text-xs text-blue-800 font-bold uppercase mb-1">Policial: {editingItem.policial}</p>
                 <p className="text-[10px] text-blue-600">Matrícula: {formatMatricula(editingItem.matricula)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº RAI</label>
                    <input 
                        value={editFormData.numeroRai}
                        onChange={(e) => setEditFormData({...editFormData, numeroRai: e.target.value})}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Ocorrência</label>
                    <input 
                        type="date"
                        value={editFormData.dataRai}
                        onChange={(e) => setEditFormData({...editFormData, dataRai: e.target.value})}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Natureza</label>
                 <input 
                    value={editFormData.natureza}
                    onChange={(e) => setEditFormData({...editFormData, natureza: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                 />
              </div>

              <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pontuação</label>
                 <input 
                    type="number"
                    value={editFormData.pontos}
                    onChange={(e) => setEditFormData({...editFormData, pontos: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-600 outline-none"
                 />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAuditoria;