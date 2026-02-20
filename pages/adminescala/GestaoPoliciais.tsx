import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { usePoliceData, Policial, Afastamento } from '../../contexts/PoliceContext';

const AdminEscalaGestaoPoliciais = () => {
  // Use Context Global Data (including shared 'afastamentos' state)
  const { 
    policiais, setPoliciais, 
    availableTeams, setAvailableTeams,
    afastamentos, setAfastamentos 
  } = usePoliceData();
  
  const [activeTab, setActiveTab] = useState<'POLICIAIS' | 'AFASTAMENTOS'>('POLICIAIS');
  const [search, setSearch] = useState('');
  const [selectedEquipe, setSelectedEquipe] = useState('TODAS'); // Estado do Filtro
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS PARA AFASTAMENTOS (Formulário e Modal) ---
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [editingAbsenceId, setEditingAbsenceId] = useState<number | null>(null);
  const [absenceFormData, setAbsenceFormData] = useState({
    nome: '',
    matricula: '',
    equipe: '',
    status: 'Férias',
    inicio: '',
    retorno: '',
    obs: ''
  });
  // Estados para busca de policial no modal de afastamento
  const [policialSearchTerm, setPolicialSearchTerm] = useState('');
  const [policialSuggestions, setPolicialSuggestions] = useState<Policial[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  // --- ESTADOS PARA POLICIAIS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCustomTeam, setIsCustomTeam] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Policial, 'id'>>({
    nome: '',
    matricula: '',
    equipe: 'Alpha',
    aniversario: '',
    telefone: '',
    email: ''
  });

  // Helper para formatar data: AAAA-MM-DD para DD/MM/AAAA
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Helper para formatar matrícula: 37123 -> 37.123
  const formatMatricula = (value: string) => {
    if (!value) return '-';
    const clean = value.replace(/\D/g, '');
    if (clean.length === 5) {
      return clean.replace(/^(\d{2})(\d{3})$/, '$1.$2');
    }
    return value;
  };

  // Lógica de filtragem Policiais
  const filteredPoliciais = policiais.filter((policial) => {
    // Normaliza a busca e os dados para comparação (remove pontuação para a busca funcionar "sem ponto")
    const term = search.toLowerCase();
    const cleanTerm = term.replace(/\D/g, ''); // Apenas números da busca
    const cleanMatricula = policial.matricula.replace(/\D/g, ''); // Apenas números da matrícula

    const matchesName = policial.nome.toLowerCase().includes(term);
    // Se a busca tiver números, compara com a matrícula limpa. Se não, ignora matrícula.
    const matchesMatricula = cleanTerm.length > 0 && cleanMatricula.includes(cleanTerm);
    
    // Se a busca for vazia, mostra tudo. Se tiver texto, busca por nome OU matrícula
    const matchesSearch = term === '' || matchesName || matchesMatricula;

    const policialEquipe = policial.equipe ? policial.equipe.toString().trim().toLowerCase() : '';
    const filtroEquipe = selectedEquipe.trim().toLowerCase();
    const matchesEquipe = selectedEquipe === 'TODAS' || policialEquipe === filtroEquipe;
    
    return matchesSearch && matchesEquipe;
  });

  // Lógica de filtragem Afastamentos
  const filteredAfastamentos = afastamentos.filter((afastamento) => {
     // Mesma lógica de normalização para Afastamentos
     const term = search.toLowerCase();
     const cleanTerm = term.replace(/\D/g, '');
     const cleanMatricula = afastamento.matricula.replace(/\D/g, '');

     const matchesName = afastamento.nome.toLowerCase().includes(term);
     const matchesMatricula = cleanTerm.length > 0 && cleanMatricula.includes(cleanTerm);
     const matchesSearch = term === '' || matchesName || matchesMatricula;
     
     const afastamentoEquipe = afastamento.equipe ? afastamento.equipe.toString().trim().toLowerCase() : '';
     const filtroEquipe = selectedEquipe.trim().toLowerCase();
     const matchesEquipe = selectedEquipe === 'TODAS' || afastamentoEquipe === filtroEquipe;

     return matchesSearch && matchesEquipe;
  });

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Férias': return 'bg-blue-100 text-blue-600';
      case 'Licença': return 'bg-purple-100 text-purple-600';
      case 'Atestado': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // --- Handlers Policiais ---

  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o policial ${nome}?`)) {
      setPoliciais(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (policial: Policial) => {
    setFormData({
      nome: policial.nome,
      matricula: policial.matricula,
      equipe: policial.equipe,
      aniversario: policial.aniversario,
      telefone: policial.telefone,
      email: policial.email
    });
    setEditingId(policial.id);
    const isStandardTeam = availableTeams.includes(policial.equipe);
    setIsCustomTeam(!isStandardTeam);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.matricula) {
      alert("Nome e Matrícula são obrigatórios.");
      return;
    }
    if (!formData.equipe) {
      alert("Por favor, informe a Equipe/Setor.");
      return;
    }
    if (!availableTeams.some(t => t.toLowerCase() === formData.equipe.toLowerCase())) {
        setAvailableTeams(prev => [...prev, formData.equipe].sort());
    }
    if (editingId) {
      setPoliciais(prev => prev.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
    } else {
      const newId = Date.now();
      setPoliciais(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Handlers Afastamentos ---

  const handleNew = () => {
    if (activeTab === 'POLICIAIS') {
      setFormData({
        nome: '',
        matricula: '',
        equipe: 'Alpha',
        aniversario: '',
        telefone: '',
        email: ''
      });
      setEditingId(null);
      setIsCustomTeam(false);
      setIsModalOpen(true);
    } else {
      // Novo Afastamento
      setAbsenceFormData({
        nome: '',
        matricula: '',
        equipe: '',
        status: 'Férias',
        inicio: '',
        retorno: '',
        obs: ''
      });
      setEditingAbsenceId(null);
      setPolicialSearchTerm('');
      setPolicialSuggestions([]);
      setIsAbsenceModalOpen(true);
    }
  };

  const handleEditAbsence = (afastamento: Afastamento) => {
    setAbsenceFormData({
      nome: afastamento.nome,
      matricula: afastamento.matricula,
      equipe: afastamento.equipe,
      status: afastamento.status,
      inicio: afastamento.inicio,
      retorno: afastamento.retorno,
      obs: afastamento.obs
    });
    setEditingAbsenceId(afastamento.id);
    setPolicialSearchTerm(afastamento.nome);
    setIsAbsenceModalOpen(true);
  };

  const handlePolicialSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPolicialSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = policiais.filter(p => 
        p.nome.toLowerCase().includes(value.toLowerCase()) || 
        p.matricula.includes(value)
      ).slice(0, 5);
      setPolicialSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setPolicialSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectPolicialForAbsence = (policial: Policial) => {
    setAbsenceFormData(prev => ({
      ...prev,
      nome: policial.nome,
      matricula: policial.matricula,
      equipe: policial.equipe
    }));
    setPolicialSearchTerm(policial.nome);
    setShowSuggestions(false);
  };

  const handleAbsenceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAbsenceFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceFormData.nome || !absenceFormData.matricula) {
      alert("Selecione um policial válido.");
      return;
    }
    if (!absenceFormData.inicio || !absenceFormData.retorno) {
      alert("Preencha as datas de início e retorno.");
      return;
    }

    if (editingAbsenceId) {
        setAfastamentos(prev => prev.map(a => a.id === editingAbsenceId ? { ...absenceFormData, id: editingAbsenceId, status: absenceFormData.status as any } : a));
    } else {
        const newAbsence: Afastamento = {
            id: Date.now(),
            ...absenceFormData,
            status: absenceFormData.status as any
        };
        setAfastamentos(prev => [newAbsence, ...prev]);
    }
    
    setIsAbsenceModalOpen(false);
  };

  const handleDeleteAbsence = (id: number) => {
     if(window.confirm("Deseja remover este afastamento?")) {
        setAfastamentos(prev => prev.filter(a => a.id !== id));
     }
  };

  // --- Funções de Gerenciamento de Equipes ---
  const startEditingTeam = (team: string) => {
    setTeamToEdit(team);
    setNewTeamName(team);
  };

  const saveTeamName = () => {
    if (!newTeamName.trim() || !teamToEdit) return;
    const oldName = teamToEdit;
    const newName = newTeamName.trim();
    if (oldName === newName) { setTeamToEdit(null); return; }
    if (availableTeams.some(t => t.toLowerCase() === newName.toLowerCase() && t.toLowerCase() !== oldName.toLowerCase())) {
        alert("Já existe uma equipe com este nome."); return;
    }
    setAvailableTeams(prev => prev.map(t => t === oldName ? newName : t).sort());
    setPoliciais(prev => prev.map(p => p.equipe === oldName ? { ...p, equipe: newName } : p));
    if (selectedEquipe === oldName) setSelectedEquipe(newName);
    setTeamToEdit(null);
    setNewTeamName('');
  };

  const cancelEditTeam = () => {
    setTeamToEdit(null);
    setNewTeamName('');
  };

  // --- Importação Excel ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        alert("Formato inválido.");
        return;
      }
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        if (jsonData.length === 0) { alert("Arquivo vazio."); return; }
        const novosPoliciais = jsonData.map((row: any) => {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => normalizedRow[key.trim().toLowerCase()] = row[key]);
            return {
                id: Date.now() + Math.random(),
                nome: normalizedRow['policial'] || normalizedRow['nome'] || 'Sem Nome',
                matricula: String(normalizedRow['matricula'] || '00000'),
                equipe: normalizedRow['equipe'] || 'Alpha',
                aniversario: normalizedRow['aniversário'] || '--/--',
                telefone: String(normalizedRow['telefone'] || ''),
                email: normalizedRow['email'] || ''
            };
        }).filter((p: any) => p.nome !== 'Sem Nome' && p.matricula !== '00000');
        if (novosPoliciais.length > 0) {
            setPoliciais(prev => [...prev, ...novosPoliciais]);
            const importedTeams: string[] = Array.from(new Set(novosPoliciais.map((p: any) => String(p.equipe))));
            setAvailableTeams((prev: string[]) => {
                const combined = new Set<string>([...prev, ...importedTeams]);
                return Array.from(combined).sort();
            });
            alert(`${novosPoliciais.length} policiais importados!`);
        } else { alert("Nenhum dado válido."); }
      } catch (error) { alert("Erro ao ler arquivo."); }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Atualizados - TEMA INDIGO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><span className="material-icons-round">groups</span></div>
          <div><p className="text-xs font-bold text-slate-500 uppercase">Total Efetivo</p><p className="text-2xl font-bold">{policiais.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><span className="material-icons-round">check_circle</span></div>
          <div><p className="text-xs font-bold text-slate-500 uppercase">Ativos</p><p className="text-2xl font-bold">{policiais.length - afastamentos.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><span className="material-icons-round">event_busy</span></div>
          <div><p className="text-xs font-bold text-slate-500 uppercase">Afastados</p><p className="text-2xl font-bold">{afastamentos.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><span className="material-icons-round">beach_access</span></div>
          <div><p className="text-xs font-bold text-slate-500 uppercase">Férias</p><p className="text-2xl font-bold">{afastamentos.filter(a => a.status === 'Férias').length}</p></div>
        </div>
      </div>

      {/* Barra de Ações, Abas e Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
        {/* Busca */}
        <div className="relative w-full md:w-80">
          <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">search</span>
          <input 
            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder-slate-400" 
            placeholder={activeTab === 'POLICIAIS' ? "Pesquisar policial..." : "Pesquisar afastamento..."}
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

        {/* Seletor de Abas (Segmented Control) - TEMA INDIGO */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto justify-center">
          <button 
            onClick={() => setActiveTab('POLICIAIS')}
            className={`flex-1 md:flex-none px-6 md:px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'POLICIAIS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            <span className="material-icons-round text-sm">badge</span>
            Cadastro
          </button>
          <button 
            onClick={() => setActiveTab('AFASTAMENTOS')}
            className={`flex-1 md:flex-none px-6 md:px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'AFASTAMENTOS' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-red-600'}`}
          >
            <span className="material-icons-round text-sm">event_busy</span>
            Afastamentos
          </button>
        </div>

        {/* Ações Direita */}
        <div className="flex gap-2 w-full md:w-auto">
          {activeTab === 'POLICIAIS' && (
            <>
               <div className="relative flex-grow md:flex-grow-0">
                <select
                  value={selectedEquipe}
                  onChange={(e) => setSelectedEquipe(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none min-w-[100px] md:min-w-[120px]"
                >
                  <option value="TODAS">Filtros</option>
                  {availableTeams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setIsTeamManagerOpen(true)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm shrink-0"
                title="Gerenciar Nomes das Equipes"
              >
                <span className="material-icons-round">edit_note</span>
              </button>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
              <button onClick={handleImportClick} className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors shadow-sm shrink-0" title="Importar Excel">
                  <span className="material-icons-round">upload_file</span>
              </button>
            </>
          )}

           {activeTab === 'AFASTAMENTOS' && (
             <div className="relative flex-grow md:flex-grow-0">
                <select
                  value={selectedEquipe}
                  onChange={(e) => setSelectedEquipe(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none min-w-[120px]"
                >
                  <option value="TODAS">Filtros</option>
                  {availableTeams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
             </div>
           )}

          <button onClick={handleNew} className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors shrink-0" title="Novo Registro">
            <span className="material-icons-round text-2xl">add</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas e Modais */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'POLICIAIS' ? (
          filteredPoliciais.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                    <tr>
                    <th className="px-6 py-3 font-bold">Policial</th>
                    <th className="px-6 py-3 font-bold">Matrícula</th>
                    <th className="px-6 py-3 font-bold">Equipe/Setor</th>
                    <th className="px-6 py-3 font-bold">Aniversário</th>
                    <th className="px-6 py-3 font-bold">Telefone</th>
                    <th className="px-6 py-3 font-bold">Email</th>
                    <th className="px-6 py-3 font-bold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredPoliciais.map((policial) => (
                    <tr key={policial.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{policial.nome}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">{formatMatricula(policial.matricula)}</td>
                        <td className="px-6 py-4">
                        <span className={`${getEquipeColor(policial.equipe)} px-2 py-1 rounded text-[10px] font-bold uppercase`}>
                            {policial.equipe}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{policial.aniversario}</td>
                        <td className="px-6 py-4 text-slate-600 text-xs">{policial.telefone}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{policial.email}</td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(policial)} className="text-slate-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors" title="Editar">
                            <span className="material-icons-round text-lg">edit</span>
                            </button>
                            <button onClick={() => handleDelete(policial.id, policial.nome)} className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors" title="Excluir">
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
              <p className="text-slate-500 font-medium">Nenhum policial encontrado.</p>
              <p className="text-slate-400 text-xs mt-1">
                {search ? 'Tente buscar por outro nome ou matrícula.' : 'Tente alterar o filtro de equipe.'}
              </p>
            </div>
          )
        ) : (
          <>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                    <tr>
                    <th className="px-4 py-4 font-bold">Policial</th>
                    <th className="px-4 py-4 font-bold">Matrícula</th>
                    <th className="px-4 py-4 font-bold text-center">Equipe</th>
                    <th className="px-4 py-4 font-bold text-center">Status</th>
                    <th className="px-4 py-4 font-bold text-center">Data Início</th>
                    <th className="px-4 py-4 font-bold text-center">Data Retorno</th>
                    <th className="px-4 py-4 font-bold">Observações</th>
                    <th className="px-4 py-4 font-bold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredAfastamentos.map((afastamento) => (
                    <tr key={afastamento.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-bold text-slate-800 text-sm">{afastamento.nome}</td>
                        <td className="px-4 py-4 font-mono text-slate-600 text-xs">{formatMatricula(afastamento.matricula)}</td>
                        <td className="px-4 py-4 text-center">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-slate-200">
                            {afastamento.equipe}
                        </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                        <span className={`${getStatusColor(afastamento.status)} px-2 py-1 rounded-full text-[10px] font-bold uppercase`}>
                            {afastamento.status}
                        </span>
                        </td>
                        <td className="px-4 py-4 text-center text-slate-600 text-xs font-medium">{formatDate(afastamento.inicio)}</td>
                        <td className="px-4 py-4 text-center text-slate-600 text-xs font-medium">{formatDate(afastamento.retorno)}</td>
                        <td className="px-4 py-4 text-slate-500 text-xs max-w-xs truncate">{afastamento.obs}</td>
                        <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditAbsence(afastamento)} className="text-slate-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors" title="Editar">
                            <span className="material-icons-round text-lg">edit</span>
                            </button>
                            <button onClick={() => handleDeleteAbsence(afastamento.id)} className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors" title="Excluir">
                            <span className="material-icons-round text-lg">delete</span>
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
               <span className="text-xs text-slate-400">Mostrando {filteredAfastamentos.length} registro(s)</span>
               <div className="flex gap-1">
                 <button className="px-3 py-1 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50">Anterior</button>
                 <button className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 border border-indigo-600 rounded">1</button>
                 <button className="px-3 py-1 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50">Próximo</button>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Modais com tema Indigo */}
      {isTeamManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-2xl">edit_note</span>
                <div>
                  <h3 className="font-bold text-lg">Gerenciar Equipes</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Editar Nomes</p>
                </div>
              </div>
              <button onClick={() => setIsTeamManagerOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><span className="material-icons-round">close</span></button>
            </div>
            
            <div className="p-0 max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                        {availableTeams.map((team) => (
                            <tr key={team} className="hover:bg-slate-50">
                                <td className="px-6 py-3">
                                    {teamToEdit === team ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                value={newTeamName}
                                                onChange={(e) => setNewTeamName(e.target.value)}
                                                className="w-full bg-white border border-indigo-400 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                                autoFocus
                                            />
                                            <button onClick={saveTeamName} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title="Salvar">
                                                <span className="material-icons-round text-sm">check</span>
                                            </button>
                                            <button onClick={cancelEditTeam} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors" title="Cancelar">
                                                <span className="material-icons-round text-sm">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-700 text-sm">{team}</span>
                                            <button onClick={() => startEditingTeam(team)} className="text-slate-400 hover:text-indigo-600 p-1" title="Renomear">
                                                <span className="material-icons-round text-sm">edit</span>
                                            </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-2xl">person_add</span>
                <div>
                  <h3 className="font-bold text-lg">{editingId ? 'Editar Policial' : 'Novo Policial'}</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Gerenciamento de Efetivo</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><span className="material-icons-round">close</span></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Completo (Posto/Grad + Nome)</label>
                  <input 
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" 
                    placeholder="Ex: Sd Silva"
                    required
                  />
                </div>
                {/* Outros campos */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Matrícula</label>
                    <input name="matricula" value={formData.matricula} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="00000" required />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Equipe / Setor</label>
                      <button type="button" onClick={() => setIsCustomTeam(!isCustomTeam)} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase">{isCustomTeam ? 'Selecionar da Lista' : '+ Nova Equipe'}</button>
                    </div>
                    {isCustomTeam ? (
                      <input name="equipe" value={formData.equipe} onChange={handleInputChange} className="w-full bg-white border border-indigo-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none placeholder-slate-400" placeholder="Nova equipe..." />
                    ) : (
                      <select name="equipe" value={formData.equipe} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none">
                        {availableTeams.map(team => (<option key={team} value={team}>{team}</option>))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aniversário</label>
                    <input name="aniversario" value={formData.aniversario} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="DD/MM" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone</label>
                    <input name="telefone" value={formData.telefone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="email@pm.go.gov.br" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAbsenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-visible animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-orange-600 p-5 flex justify-between items-center text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-2xl">event_busy</span>
                <div>
                  <h3 className="font-bold text-lg">{editingAbsenceId ? 'Editar Afastamento' : 'Registrar Afastamento'}</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Gestão de Ausências</p>
                </div>
              </div>
              <button onClick={() => setIsAbsenceModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><span className="material-icons-round">close</span></button>
            </div>
            
            <form onSubmit={handleSaveAbsence} className="p-6 space-y-4">
              {/* Form content for Absence */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Buscar Policial (Nome ou Matrícula)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={policialSearchTerm}
                      onChange={handlePolicialSearch}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-600 outline-none" 
                      placeholder="Digite para buscar..."
                      autoComplete="off"
                    />
                    <span className="material-icons-round absolute right-3 top-2 text-slate-400">search</span>
                  </div>
                  {showSuggestions && policialSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {policialSuggestions.map((p) => (
                          <button 
                            key={p.id}
                            type="button" 
                            onClick={() => selectPolicialForAbsence(p)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 flex justify-between items-center border-b border-slate-50 last:border-0"
                          >
                             <div>
                                <span className="font-bold text-slate-800 text-xs block">{p.nome}</span>
                                <span className="text-[10px] text-slate-500">{p.equipe}</span>
                             </div>
                             <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.matricula}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Matrícula</label>
                      <input name="matricula" value={absenceFormData.matricula} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-xs font-mono text-slate-600 outline-none" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Equipe</label>
                      <input name="equipe" value={absenceFormData.equipe} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold text-slate-600 outline-none uppercase" />
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Afastamento</label>
                   <select 
                      name="status" 
                      value={absenceFormData.status} 
                      onChange={handleAbsenceInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-600 outline-none"
                   >
                      <option value="Férias">Férias</option>
                      <option value="Licença">Licença</option>
                      <option value="Atestado">Atestado Médico</option>
                      <option value="Outros">Outros</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Início</label>
                    <input 
                      type="date"
                      name="inicio"
                      value={absenceFormData.inicio}
                      onChange={handleAbsenceInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Retorno</label>
                    <input 
                      type="date"
                      name="retorno"
                      value={absenceFormData.retorno}
                      onChange={handleAbsenceInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-600 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações</label>
                  <textarea 
                    name="obs"
                    value={absenceFormData.obs}
                    onChange={handleAbsenceInputChange}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-600 outline-none resize-none"
                    placeholder="Detalhes adicionais..."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsAbsenceModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-lg shadow-orange-200 transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEscalaGestaoPoliciais;