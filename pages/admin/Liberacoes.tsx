import React, { useState, useEffect, useMemo } from 'react';
import { usePoliceData } from '../../contexts/PoliceContext';

// --- Interfaces ---
interface Liberacao {
  id: number;
  rai: string;
  natureza: string;
  dataRai: string;
  dataExpiracao: string;
  periodoVencido: string;
  policial: string;
  matricula: string;
  novaValidade: string;
  motivo: string;
}

interface RaiDBEntry {
  rai: string;
  data: string;
  natureza: string;
}

// --- Mocks de Dados ---

// Simulação do Banco de Dados de RAIs (Sincronizado com a tela de Banco de Dados)
const MOCK_RAI_DB: RaiDBEntry[] = [
  { rai: '20230101', data: '2023-01-15', natureza: 'Homicídio Simples' }, // Expirado antigo
  { rai: '20230550', data: '2023-06-20', natureza: 'Tráfico de Drogas' }, // Expirado
  { rai: '20230890', data: '2023-09-01', natureza: 'Roubo de Veículo' }, // Expirado
  { rai: '20231200', data: '2025-01-10', natureza: 'Porte Ilegal de Arma' }, // Recente (exemplo)
  // Registro visualizado no menu Banco de Dados:
  { rai: '10203040', data: '2023-05-15', natureza: 'Prisão em flagrante' }, // Expirado
  // Mock para "A Vencer" (Datas próximas a 70-80 dias atrás simuladas)
  { rai: '20250105', data: '2024-11-15', natureza: 'Recuperação de Veículo' }, 
  { rai: '20250108', data: '2024-11-20', natureza: 'TCO' } 
];

// Dados iniciais da tabela de Liberações
const INITIAL_LIBERACOES: Liberacao[] = [
  { 
    id: 1, 
    rai: '20230101', 
    natureza: 'Homicídio Simples', 
    dataRai: '2023-01-15', 
    dataExpiracao: '2023-04-15', // +90 dias aprox
    periodoVencido: '9 meses', 
    policial: 'CB OLIVEIRA', 
    matricula: '37550', 
    novaValidade: '2024-03-01', 
    motivo: 'Processo administrativo demorado' 
  }
];

const AdminLiberacoes = () => {
  const { policiais } = usePoliceData(); // Acesso ao Contexto de Policiais
  const [activeTab, setActiveTab] = useState<'LIBERADOS' | 'NOVA'>('LIBERADOS');
  const [liberacoes, setLiberacoes] = useState<Liberacao[]>(INITIAL_LIBERACOES);
  const [search, setSearch] = useState('');
  
  // Estado para Edição
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- Estados do Formulário Nova Liberação ---
  const [formData, setFormData] = useState({
    rai: '',
    natureza: '',
    dataRai: '',
    dataExpiracao: '',
    periodoVencido: '',
    policial: '', // Será preenchido automaticamente
    matricula: '',
    novaValidade: '',
    motivo: ''
  });

  // --- Cálculo de Estatísticas (Dashboard) ---
  const stats = useMemo(() => {
    const hoje = new Date();
    // Normalizando a data de hoje para evitar problemas de fuso em mocks simples
    // Vamos assumir uma data "fake" de referência se os dados forem muito antigos, 
    // ou usar a data real. Para este demo, usarei a data real.
    
    let expiradosCount = 0;
    let aVencerCount = 0;
    let pontosEstimados = 0;

    MOCK_RAI_DB.forEach(item => {
        const dataRai = new Date(item.data);
        const diffTime = Math.abs(hoje.getTime() - dataRai.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Regra: > 90 dias = Expirado
        if (diffDays > 90) {
            // Verifica se JÁ foi liberado para não contar duplicado
            const jaLiberado = liberacoes.some(lib => lib.rai === item.rai);
            if (!jaLiberado) {
                expiradosCount++;
                pontosEstimados += 15; // Média de pontos por RAI perdido
            }
        } 
        // Regra: Entre 60 e 90 dias = A Vencer (Alerta)
        else if (diffDays >= 60 && diffDays <= 90) {
             const jaLiberado = liberacoes.some(lib => lib.rai === item.rai);
             if (!jaLiberado) {
                aVencerCount++;
             }
        }
    });

    return {
        expirados: expiradosCount,
        aVencer: aVencerCount,
        pontosRisco: pontosEstimados,
        totalLiberados: liberacoes.length
    };
  }, [liberacoes]);


  // --- Helpers de Data ---
  const addDays = (dateStr: string, days: number) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const calculateTimeDiff = (dateStr: string) => {
    if (!dateStr) return '';
    const start = new Date(dateStr);
    const end = new Date(); // Hoje
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} anos`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // --- Lógica de Busca Automática do RAI ---
  useEffect(() => {
    const cleanRai = formData.rai.trim();
    
    if (cleanRai.length >= 5) {
      const found = MOCK_RAI_DB.find(entry => entry.rai === cleanRai);
      
      if (found) {
        const expiracao = addDays(found.data, 90);
        const vencido = calculateTimeDiff(expiracao);
        
        setFormData(prev => ({
          ...prev,
          natureza: found.natureza,
          dataRai: found.data,
          dataExpiracao: expiracao,
          periodoVencido: vencido
        }));
      } else if (!editingId) {
         setFormData(prev => ({
            ...prev,
            natureza: '',
            dataRai: '',
            dataExpiracao: '',
            periodoVencido: ''
         }));
      }
    }
  }, [formData.rai, editingId]);

  // --- Lógica de Busca Automática do Policial ---
  useEffect(() => {
    const cleanMatricula = formData.matricula.replace(/\D/g, '');

    if (cleanMatricula.length >= 4) {
      const policialEncontrado = policiais.find(p => p.matricula === cleanMatricula);
      
      if (policialEncontrado) {
        setFormData(prev => ({ ...prev, policial: policialEncontrado.nome }));
      } else {
        setFormData(prev => ({ ...prev, policial: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, policial: '' }));
    }
  }, [formData.matricula, policiais]);


  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      rai: '',
      natureza: '',
      dataRai: '',
      dataExpiracao: '',
      periodoVencido: '',
      policial: '',
      matricula: '',
      novaValidade: '',
      motivo: ''
    });
  };

  const handleCancel = () => {
    resetForm();
    setActiveTab('LIBERADOS');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rai || !formData.matricula || !formData.novaValidade) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    
    if (!formData.policial) {
      alert("Matrícula não encontrada no Banco de Dados de Policiais.");
      return;
    }

    if (editingId) {
        setLiberacoes(prev => prev.map(item => item.id === editingId ? { ...item, ...formData } : item));
        alert("Liberação atualizada com sucesso!");
    } else {
        const newEntry: Liberacao = {
          id: Date.now(),
          ...formData
        };
        setLiberacoes(prev => [newEntry, ...prev]);
        alert("RAI Liberado com sucesso!");
    }
    
    handleCancel();
  };

  const handleEdit = (item: Liberacao) => {
    setFormData({
      rai: item.rai,
      natureza: item.natureza,
      dataRai: item.dataRai,
      dataExpiracao: item.dataExpiracao,
      periodoVencido: item.periodoVencido,
      policial: item.policial,
      matricula: item.matricula,
      novaValidade: item.novaValidade,
      motivo: item.motivo
    });
    setEditingId(item.id);
    setActiveTab('NOVA');
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Deseja revogar esta liberação permanentemente?")) {
      setLiberacoes(prev => prev.filter(item => item.id !== id));
    }
  };

  // Filtro da tabela
  const filteredList = liberacoes.filter(item => 
    item.rai.includes(search) || 
    item.matricula.includes(search) ||
    item.policial.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Título removido */}

      {/* DASHBOARD DE RESUMO (Novo) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Expirados */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-icons-round">error_outline</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">RAIs Expirados</p>
            <p className="text-2xl font-black text-slate-800">{stats.expirados}</p>
            <p className="text-[10px] text-red-500 font-bold mt-0.5">Sem uso</p>
          </div>
        </div>

        {/* Card 2: A Vencer */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <span className="material-icons-round">access_time</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">A Vencer (30d)</p>
            <p className="text-2xl font-black text-slate-800">{stats.aVencer}</p>
            <p className="text-[10px] text-orange-500 font-bold mt-0.5">Atenção Necessária</p>
          </div>
        </div>

        {/* Card 3: Pontos em Risco */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-icons-round">trending_down</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pontos em Risco</p>
            <p className="text-2xl font-black text-slate-800">~{stats.pontosRisco}</p>
            <p className="text-[10px] text-blue-500 font-bold mt-0.5">Estimativa</p>
          </div>
        </div>

        {/* Card 4: Total Liberado */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <span className="material-icons-round">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Liberado</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalLiberados}</p>
            <p className="text-[10px] text-green-500 font-bold mt-0.5">Recuperados</p>
          </div>
        </div>
      </div>

      {/* Barra de Ações e Abas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Busca (Aparece apenas na aba Liberados) */}
        <div className="relative w-full md:w-80 opacity-100 transition-opacity">
           {activeTab === 'LIBERADOS' ? (
             <>
              <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">search</span>
              <input 
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400" 
                placeholder="Buscar RAI ou Matrícula..."
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
             </>
           ) : <div className="h-10"></div>}
        </div>

        {/* Seletor de Abas */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => { setActiveTab('LIBERADOS'); resetForm(); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'LIBERADOS' ? 'bg-green-800 text-white shadow-sm' : 'text-slate-500 hover:text-green-800'}`}
          >
            <span className="material-icons-round text-sm">list</span>
            Liberados
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab('NOVA'); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'NOVA' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
          >
            <span className="material-icons-round text-sm">{editingId ? 'edit' : 'add_circle'}</span>
            {editingId ? 'Editando' : 'Nova Liberação'}
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        
        {/* ABA: LISTA DE LIBERADOS */}
        {activeTab === 'LIBERADOS' && (
          <>
            {filteredList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-center">Nº RAI</th>
                      <th className="px-4 py-3">Natureza</th>
                      <th className="px-4 py-3 text-center">Data RAI</th>
                      <th className="px-4 py-3 text-center">Expiração</th>
                      <th className="px-4 py-3 text-center">Período Vencido</th>
                      <th className="px-4 py-3">Policial</th>
                      <th className="px-4 py-3 text-center">Matrícula</th>
                      <th className="px-4 py-3 text-center text-blue-700">Nova Validade</th>
                      <th className="px-4 py-3">Motivo</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-center font-black text-slate-700">{item.rai}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-600">{item.natureza}</td>
                        <td className="px-4 py-3 text-center text-xs text-slate-500">{formatDate(item.dataRai)}</td>
                        <td className="px-4 py-3 text-center text-xs text-red-500 font-bold">{formatDate(item.dataExpiracao)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {item.periodoVencido}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 text-xs uppercase">{item.policial}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">{item.matricula}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded text-xs font-bold">
                            {formatDate(item.novaValidade)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 italic max-w-[150px] truncate" title={item.motivo}>{item.motivo}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Editar">
                              <span className="material-icons-round text-base">edit</span>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="Revogar">
                              <span className="material-icons-round text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <span className="material-icons-round text-slate-300 text-5xl mb-3">search_off</span>
                <p className="text-slate-500 font-medium">Nenhuma liberação encontrada.</p>
              </div>
            )}
          </>
        )}

        {/* ABA: NOVA/EDITAR LIBERAÇÃO */}
        {activeTab === 'NOVA' && (
          <div className="p-8 max-w-4xl mx-auto">
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3">
               <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
                 <span className="material-icons-round">info</span>
               </div>
               <div>
                 <h4 className="text-sm font-bold text-blue-800 uppercase mb-1">Regra de Negócio</h4>
                 <p className="text-xs text-blue-700 leading-relaxed">
                   A liberação vincula estritamente o <strong>Nº do RAI</strong> à <strong>Matrícula</strong> informada. 
                   Outros policiais não conseguirão utilizar este RAI vencido, a menos que uma liberação específica seja criada para eles.
                 </p>
               </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção 1: Dados do RAI (Busca Automática) */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Identificação da Ocorrência</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº RAI (Digite para buscar)</label>
                        <div className="relative">
                          <input 
                            name="rai"
                            value={formData.rai}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="00000000"
                            maxLength={12}
                            autoFocus={!editingId}
                          />
                          <span className={`material-icons-round absolute right-3 top-2.5 transition-colors ${formData.natureza ? 'text-green-500' : 'text-slate-300'}`}>
                            {formData.natureza ? 'check_circle' : 'search'}
                          </span>
                        </div>
                        {formData.natureza && (
                          <div className="mt-1 text-[10px] text-green-600 font-bold flex items-center gap-1">
                            RAI Encontrado no Banco de Dados
                          </div>
                        )}
                      </div>

                      {/* Campos Automáticos (Read Only) */}
                      <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Natureza (Auto)</label>
                         <input value={formData.natureza} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-600 outline-none" placeholder="..." />
                      </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Registro (Auto)</label>
                         <input value={formatDate(formData.dataRai)} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-600 outline-none text-center" placeholder="..." />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Expiração (+90 dias)</label>
                         <input value={formatDate(formData.dataExpiracao)} readOnly className="w-full bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-xs font-bold text-red-600 outline-none text-center" placeholder="..." />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Período Vencido</label>
                         <input value={formData.periodoVencido} readOnly className="w-full bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-xs font-black text-red-600 outline-none uppercase text-center" placeholder="..." />
                      </div>
                   </div>
                </div>

                {/* Seção 2: Dados do Policial e Validade */}
                <div className="p-6">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Beneficiário e Validade</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Matrícula Policial</label>
                        <div className="relative">
                          <input 
                            name="matricula"
                            value={formData.matricula}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="Digite a matrícula"
                            maxLength={8}
                          />
                          <span className={`material-icons-round absolute right-3 top-2.5 transition-colors ${formData.policial ? 'text-green-500' : 'text-slate-300'}`}>
                              {formData.policial ? 'verified' : 'badge'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Policial (Automático)</label>
                        <input 
                          name="policial"
                          value={formData.policial}
                          readOnly
                          className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none uppercase transition-colors ${formData.policial ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
                          placeholder="Aguardando Matrícula..."
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Nova Validade (Limite)</label>
                        <input 
                          name="novaValidade"
                          type="date"
                          value={formData.novaValidade}
                          onChange={handleInputChange}
                          className="w-full bg-white border-2 border-blue-100 rounded-lg px-4 py-2.5 text-sm font-bold text-blue-800 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Motivo da Liberação</label>
                        <input 
                          name="motivo"
                          value={formData.motivo}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                          placeholder="Ex: Licença prêmio, erro sistêmico..."
                        />
                      </div>
                   </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 gap-3">
                   {editingId && (
                     <button type="button" onClick={handleCancel} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-lg transition-colors">
                       Cancelar
                     </button>
                   )}
                   <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center gap-2">
                     <span className="material-icons-round">save</span>
                     {editingId ? 'Salvar Alterações' : 'Registrar Liberação'}
                   </button>
                </div>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiberacoes;