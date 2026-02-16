import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';

// --- Interfaces ---
interface RaiRecord {
  id: number;
  dataEnvio: string; // Data que entrou no sistema
  dataRai: string;   // Data da ocorrência real
  numeroRai: string;
  natureza: string;
  policial: string;
  matricula: string;
  status: 'Sincronizado' | 'Pendente' | 'Erro';
  origem: 'Importação' | 'Manual' | 'App';
}

// --- Mocks de Dados ---
const MOCK_DB: RaiRecord[] = [
  { id: 1, dataEnvio: '2024-01-20', dataRai: '2024-01-19', numeroRai: '20240001552', natureza: 'Prisão em Flagrante - Tráfico', policial: 'SD LUCAS MIGUEL', matricula: '39874', status: 'Sincronizado', origem: 'App' },
  { id: 2, dataEnvio: '2024-01-21', dataRai: '2024-01-20', numeroRai: '20240002889', natureza: 'Recuperação de Veículo', policial: '1º SGT RAMOS', matricula: '24955', status: 'Sincronizado', origem: 'Importação' },
  { id: 3, dataEnvio: '2024-01-22', dataRai: '2024-01-21', numeroRai: '20240003100', natureza: 'Apreensão de Arma de Fogo', policial: 'CB PASSOS', matricula: '38183', status: 'Pendente', origem: 'Manual' },
  { id: 4, dataEnvio: '2024-01-22', dataRai: '2023-10-15', numeroRai: '20230550123', natureza: 'TCO', policial: 'SD BRITO', matricula: '39580', status: 'Erro', origem: 'Importação' }, // Erro pois dataRai é muito antiga
  { id: 5, dataEnvio: '2024-01-23', dataRai: '2024-01-23', numeroRai: '20240004500', natureza: 'Prisão em Flagrante - Homicídio', policial: '3º SGT JAIRO', matricula: '35768', status: 'Sincronizado', origem: 'App' },
];

const AdminBancoDados = () => {
  const [records, setRecords] = useState<RaiRecord[]>(MOCK_DB);
  const [search, setSearch] = useState('');
  
  // --- Estados do Filtro de Datas Personalizado ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilterLabel, setActiveFilterLabel] = useState('Personalizado');
  
  // Controles de Visibilidade dos Menus
  const [showDatePickerMenu, setShowDatePickerMenu] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // Estados temporários para o Modal Personalizado
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [noEndDate, setNoEndDate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Estados do Modal de Edição ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    dataEnvio: '',
    dataRai: '',
    numeroRai: '',
    natureza: '',
    policial: '',
    matricula: '',
    status: 'Sincronizado' as 'Sincronizado' | 'Pendente' | 'Erro'
  });

  // Fecha o menu ao clicar fora
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

  // --- Lógica de Filtros de Data ---
  const filterOptions = [
    { label: 'Hoje', action: () => setDateRange(0, 0) },
    { label: 'Semanal', action: () => setDateRange(7, 0) },
    { label: '30 Dias', action: () => setDateRange(30, 0) },
    { label: 'Mensal', action: () => setMonthRange() },
    { label: '3 Meses', action: () => setDateRange(90, 0) },
    { label: 'Trimestral', action: () => setQuarterRange() },
    { label: '6 Meses', action: () => setDateRange(180, 0) },
    { label: 'Semestral', action: () => setSemesterRange() },
    { label: '2026', action: () => setFixedYear(2026) },
    { label: 'Ano', action: () => setFixedYear(new Date().getFullYear()) },
  ];

  const setDateRange = (daysBackStart: number, daysBackEnd: number) => {
    const end = new Date();
    end.setDate(end.getDate() - daysBackEnd);
    const start = new Date();
    start.setDate(start.getDate() - daysBackStart);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setQuarterRange = () => {
    const now = new Date();
    const quarter = Math.floor((now.getMonth() + 3) / 3);
    const start = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setSemesterRange = () => {
    const now = new Date();
    const semester = now.getMonth() < 6 ? 0 : 6;
    const start = new Date(now.getFullYear(), semester, 1);
    const end = new Date(now.getFullYear(), semester + 6, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setFixedYear = (year: number) => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleFilterClick = (label: string, action?: () => void) => {
    if (label === 'Personalizado') {
        setTempStartDate(startDate);
        setTempEndDate(endDate);
        setNoEndDate(!endDate);
        setShowCustomDateModal(true);
        setShowDatePickerMenu(false);
    } else if (action) {
        action();
        setActiveFilterLabel(label);
        setShowDatePickerMenu(false);
    }
  };

  const applyCustomDate = () => {
      setStartDate(tempStartDate);
      setEndDate(noEndDate ? '' : tempEndDate);
      setActiveFilterLabel('Personalizado');
      setShowCustomDateModal(false);
  };

  // --- Helpers ---
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Sincronizado': return 'bg-green-50 text-green-700 border-green-100';
      case 'Pendente': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Erro': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  // --- Filtragem ---
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // Filtro de Texto (Global)
      const term = search.toLowerCase();
      const matchSearch = 
        item.numeroRai.includes(term) ||
        item.policial.toLowerCase().includes(term) ||
        item.matricula.includes(term) ||
        item.natureza.toLowerCase().includes(term);

      // Filtro de Período (Intervalo de datas baseado na Data RAI)
      let matchPeriod = true;
      if (startDate || endDate) {
        const itemDate = item.dataRai; // Formato YYYY-MM-DD permite comparação de string direta
        if (startDate && endDate) {
          matchPeriod = itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          matchPeriod = itemDate >= startDate;
        } else if (endDate) {
          matchPeriod = itemDate <= endDate;
        }
      }

      return matchSearch && matchPeriod;
    });
  }, [records, search, startDate, endDate]);

  // --- Estatísticas ---
  const stats = {
    total: records.length,
    sincronizados: records.filter(r => r.status === 'Sincronizado').length,
    pendentes: records.filter(r => r.status === 'Pendente').length,
    erros: records.filter(r => r.status === 'Erro').length
  };

  // --- Handlers ---
  const handleEdit = (record: RaiRecord) => {
    setFormData({
      dataEnvio: record.dataEnvio,
      dataRai: record.dataRai,
      numeroRai: record.numeroRai,
      natureza: record.natureza,
      policial: record.policial,
      matricula: record.matricula,
      status: record.status
    });
    setEditingId(record.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("ATENÇÃO: Excluir este registro pode afetar a pontuação do policial. Deseja continuar?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleNew = () => {
    const hoje = new Date().toISOString().split('T')[0];
    setFormData({
      dataEnvio: hoje,
      dataRai: '',
      numeroRai: '',
      natureza: '',
      policial: '',
      matricula: '',
      status: 'Sincronizado'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numeroRai || !formData.matricula || !formData.dataRai) {
      alert("Campos obrigatórios: Nº RAI, Data RAI e Matrícula.");
      return;
    }

    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? { ...r, ...formData } : r));
    } else {
      const newRecord: RaiRecord = {
        id: Date.now(),
        ...formData,
        origem: 'Manual'
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Importação (Simulada) ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulação: Adiciona um registro dummy
      setTimeout(() => {
        alert("Arquivo processado com sucesso! (Simulação)");
        setRecords(prev => [
            { id: Date.now(), dataEnvio: new Date().toISOString().split('T')[0], dataRai: '2024-02-01', numeroRai: '20249999999', natureza: 'Importado via Excel', policial: 'IMPORTADO AUTO', matricula: '00000', status: 'Pendente', origem: 'Importação' },
            ...prev
        ]);
      }, 1000);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. DASHBOARD SUPERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total de Registros</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
            <p className="text-xs font-bold text-green-600">Atual</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100"><span className="material-icons-round">storage</span></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Envios Processados</p>
            <span className="text-3xl font-bold text-slate-800">{stats.sincronizados}</span>
            <p className="text-xs font-bold text-slate-300">Sincronizado</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><span className="material-icons-round">check_circle</span></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Pendentes</p>
            <span className="text-3xl font-bold text-orange-500">{stats.pendentes}</span>
            <p className="text-xs font-bold text-orange-400">Ação necessária</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><span className="material-icons-round">schedule</span></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Erros de Importação</p>
            <span className="text-3xl font-bold text-red-600">{stats.erros}</span>
            <p className="text-xs font-bold text-red-400">0 críticas</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><span className="material-icons-round">warning</span></div>
        </div>
      </div>

      {/* 2. BARRA DE FERRAMENTAS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
        {/* Busca e Filtros Esquerdos */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full md:w-80">
                <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">search</span>
                <input 
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-slate-400" 
                    placeholder="RAI, Natureza, Policial..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <span className="material-icons-round text-lg">close</span>
                    </button>
                )}
            </div>
            
            {/* SELETOR DE DATA PERSONALIZADO (NOVO ESTILO CLARO) */}
            <div className="relative date-picker-container">
              <button 
                onClick={() => setShowDatePickerMenu(!showDatePickerMenu)}
                className="h-10 px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <span className="material-icons-round text-lg text-slate-400">calendar_month</span>
                <span>{activeFilterLabel}</span>
                <span className="material-icons-round text-sm ml-1 text-slate-400">expand_more</span>
              </button>
              
              {/* Dropdown Menu Claro */}
              {showDatePickerMenu && (
                <div className="absolute top-12 left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-2 animate-[fadeIn_0.1s_ease-out]">
                  {filterOptions.map((option, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleFilterClick(option.label, option.action)}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-between"
                    >
                      {option.label}
                      {activeFilterLabel === option.label && <span className="material-icons-round text-blue-600 text-xs">check</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={() => handleFilterClick('Personalizado')}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-icons-round text-base">date_range</span>
                    Personalizado
                  </button>
                </div>
              )}
            </div>
        </div>

        {/* Botões de Ação Direita */}
        <div className="flex gap-2 w-full md:w-auto">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv, .xlsx" />
             <button 
                onClick={handleImportClick} 
                className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors shadow-sm"
                title="Importar Excel"
             >
                  <span className="material-icons-round text-2xl">upload_file</span>
             </button>
             
             {/* PADRONIZAÇÃO DO BOTÃO + */}
             <button onClick={handleNew} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors" title="Novo Registro">
                <span className="material-icons-round text-2xl">add</span>
             </button>
        </div>
      </div>

      {/* 3. TABELA DE DADOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                    <th className="px-6 py-4 text-center">Data Envio</th>
                    <th className="px-6 py-4 text-center">Data RAI</th>
                    <th className="px-6 py-4">Nº RAI</th>
                    <th className="px-6 py-4">Natureza</th>
                    <th className="px-6 py-4">Policial</th>
                    <th className="px-6 py-4 text-center">Matrícula</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-center text-slate-500 text-xs">{formatDate(record.dataEnvio)}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700 text-xs">{formatDate(record.dataRai)}</td>
                        <td className="px-6 py-4 font-mono text-blue-600 font-bold">{record.numeroRai}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium max-w-[200px] truncate" title={record.natureza}>{record.natureza}</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-xs uppercase">{record.policial}</td>
                        <td className="px-6 py-4 text-center font-mono text-slate-500 text-xs">{formatMatricula(record.matricula)}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(record.status)}`}>
                                {record.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(record)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors" title="Editar">
                                <span className="material-icons-round text-lg">edit</span>
                                </button>
                                <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Excluir">
                                <span className="material-icons-round text-lg">delete</span>
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
              <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
              <p className="text-slate-400 text-xs mt-1">Verifique os filtros ou realize uma nova importação.</p>
            </div>
        )}
      </div>

      {/* 4. MODAL DE EDIÇÃO / CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-2xl">storage</span>
                <div>
                  <h3 className="font-bold text-lg">{editingId ? 'Editar Registro' : 'Novo Registro Manual'}</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Banco de Dados de Ocorrências</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><span className="material-icons-round">close</span></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº RAI</label>
                    <input 
                        name="numeroRai"
                        value={formData.numeroRai}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="Ex: 2024000..."
                        autoFocus
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data RAI</label>
                    <input 
                        type="date"
                        name="dataRai"
                        value={formData.dataRai}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Natureza da Ocorrência</label>
                <input 
                    name="natureza"
                    value={formData.natureza}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="Descrição da natureza..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Matrícula Policial</label>
                    <input 
                        name="matricula"
                        value={formData.matricula}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="00000"
                        maxLength={5}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select 
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                        <option value="Sincronizado">Sincronizado</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Erro">Erro</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Policial (Manual)</label>
                <input 
                    name="policial"
                    value={formData.policial}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="DIGITE O NOME..."
                />
                <p className="text-[10px] text-slate-400 mt-1">* Para vínculo automático, certifique-se que a matrícula esteja correta.</p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-colors">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL DE SELEÇÃO DE DATA (NOVO ESTILO CLARO) */}
      {showCustomDateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                  <span className="material-icons-round text-blue-600">calendar_month</span>
                  <h3 className="font-bold text-slate-800 text-lg">Seleção de Data</h3>
                  <button onClick={() => setShowCustomDateModal(false)} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
                      <span className="material-icons-round">close</span>
                  </button>
              </div>
              
              <div className="p-6 space-y-5">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Inicial</label>
                      <div className="relative">
                          <input 
                              type="date"
                              value={tempStartDate}
                              onChange={(e) => setTempStartDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Final</label>
                      <div className="relative">
                          <input 
                              type="date"
                              value={tempEndDate}
                              onChange={(e) => setTempEndDate(e.target.value)}
                              disabled={noEndDate}
                              className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 ${noEndDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                      </div>
                  </div>

                  <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="noEndDate"
                        checked={noEndDate}
                        onChange={(e) => setNoEndDate(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="noEndDate" className="text-sm text-slate-600 font-medium cursor-pointer select-none">Sem data final</label>
                  </div>

                  <div className="flex gap-3 pt-2">
                      <button 
                          onClick={applyCustomDate}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-200"
                      >
                          OK
                      </button>
                      <button 
                          onClick={() => setShowCustomDateModal(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-lg transition-colors"
                      >
                          Cancelar
                      </button>
                  </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminBancoDados;