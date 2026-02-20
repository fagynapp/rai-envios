import React, { useState, useRef, useEffect } from 'react';
import { usePoliceData, UserRaiRecord } from '../../contexts/PoliceContext';

const RegisterRAI = () => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { naturezas, setUserPoints, setUserRaiRecords, userRaiRecords } = usePoliceData();
  
  // Filtra apenas naturezas ativas para exibição
  const activeNaturezas = naturezas.filter(n => n.ativo);

  const [formData, setFormData] = useState({
    raiNumber: '',
    dataOcorrencia: '',
    natureza: '', 
    obs: ''
  });

  // Estados de Validação
  const [duplicateStatus, setDuplicateStatus] = useState<{
    isDuplicate: boolean;
    previousRecord?: UserRaiRecord;
  } | null>(null);

  const [isExpired, setIsExpired] = useState(false);

  // Inicializa o select com o primeiro valor disponível se houver
  useEffect(() => {
    if (activeNaturezas.length > 0 && !formData.natureza) {
       setFormData(prev => ({ 
           ...prev, 
           natureza: `${activeNaturezas[0].natureza} (${activeNaturezas[0].pontos} pts)` 
       }));
    }
  }, [activeNaturezas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    // Restrição para apenas números e máximo de 8 dígitos no campo RAI
    if (name === 'raiNumber') {
      value = value.replace(/\D/g, '').slice(0, 8);
      
      // Lógica de verificação de duplicidade em tempo real
      if (value.length === 8) {
        const existingRecord = userRaiRecords.find(r => r.raiNumber === value);
        if (existingRecord) {
          setDuplicateStatus({ isDuplicate: true, previousRecord: existingRecord });
        } else {
          setDuplicateStatus({ isDuplicate: false });
        }
      } else {
        setDuplicateStatus(null); // Reseta se não tiver 8 dígitos
      }
    }

    // Verificação de Data Expirada em Tempo Real
    if (name === 'dataOcorrencia') {
        if (value) {
            // Cria data localmente a partir da string YYYY-MM-DD para evitar problemas de fuso UTC
            const [ano, mes, dia] = value.split('-').map(Number);
            const dataOcorrencia = new Date(ano, mes - 1, dia); // Meia-noite local
            const dataHoje = new Date();
            dataHoje.setHours(0,0,0,0); // Meia-noite local de hoje
            
            const diffTime = dataHoje.getTime() - dataOcorrencia.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            setIsExpired(diffDays > 90);
        } else {
            setIsExpired(false);
        }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIconClick = () => {
    if (dateInputRef.current) {
      // Tenta abrir o seletor nativo usando a API moderna
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch (error) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de duplicidade no envio
    if (duplicateStatus?.isDuplicate) {
        alert(`ERRO: Este RAI já foi registrado por você em ${new Date(duplicateStatus.previousRecord!.dataRegistro).toLocaleDateString('pt-BR')}.`);
        return;
    }

    if (formData.raiNumber.length !== 8) {
      alert("O número do RAI deve conter exatamente 8 dígitos.");
      return;
    }
    if (!formData.dataOcorrencia) {
      alert("Selecione a data da ocorrência.");
      return;
    }

    // Recalcula expiração no submit para garantir (usa a mesma lógica do handleChange)
    const [ano, mes, dia] = formData.dataOcorrencia.split('-').map(Number);
    const dataOcorrencia = new Date(ano, mes - 1, dia);
    const dataHoje = new Date();
    dataHoje.setHours(0,0,0,0);
    const diffTime = dataHoje.getTime() - dataOcorrencia.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const recordIsExpired = diffDays > 90;
    
    const selectedNaturezaObj = activeNaturezas.find(
        n => `${n.natureza} (${n.pontos} pts)` === formData.natureza
    );
    
    const pontosCalculados = selectedNaturezaObj ? selectedNaturezaObj.pontos : 0;
    const naturezaNome = selectedNaturezaObj ? selectedNaturezaObj.natureza : formData.natureza;

    if (recordIsExpired) {
        // --- FLUXO RAI EXPIRADO ---
        alert("ATENÇÃO: RAI EXPIRADO!\n\nA data da ocorrência é superior a 90 dias. Não é possível computar a pontuação automaticamente.\n\nO registro será salvo no seu histórico, mas os pontos NÃO SERÃO CREDITADOS.\n\nEntre em contato com a ADM (Sessão de Liberações) para verificar a possibilidade de desbloqueio mediante justificativa.");
        
        const newRecord: UserRaiRecord = {
            id: Date.now().toString(),
            raiNumber: formData.raiNumber,
            dataOcorrencia: formData.dataOcorrencia,
            natureza: naturezaNome,
            pontos: pontosCalculados, // Salva o valor potencial, mas não aplica
            status: 'EXPIRADO', // Status específico
            dataRegistro: new Date().toISOString(),
            obs: formData.obs // Adicionado observação
        };

        setUserRaiRecords(prev => [newRecord, ...prev]);
        // NOTA: setUserPoints NÃO é chamado aqui
    } else {
        // --- FLUXO NORMAL ---
        const newRecord: UserRaiRecord = {
            id: Date.now().toString(),
            raiNumber: formData.raiNumber,
            dataOcorrencia: formData.dataOcorrencia,
            natureza: naturezaNome,
            pontos: pontosCalculados,
            status: 'PENDENTE',
            dataRegistro: new Date().toISOString(),
            obs: formData.obs // Adicionado observação
        };

        setUserRaiRecords(prev => [newRecord, ...prev]);
        setUserPoints(prev => prev + pontosCalculados);
        
        alert(`RAI ${formData.raiNumber} registrado com sucesso! +${pontosCalculados} pontos adicionados ao seu saldo.`);
    }
    
    // Reset form e status
    setFormData({
      raiNumber: '',
      dataOcorrencia: '',
      natureza: activeNaturezas.length > 0 ? `${activeNaturezas[0].natureza} (${activeNaturezas[0].pontos} pts)` : '',
      obs: ''
    });
    setDuplicateStatus(null);
    setIsExpired(false);
  };

  // Helper para definir estilos do input RAI
  const getInputStyles = () => {
    if (duplicateStatus?.isDuplicate) {
        return "border-red-500 focus:ring-red-500 bg-red-50 text-red-900";
    }
    if (duplicateStatus?.isDuplicate === false) {
        return "border-green-500 focus:ring-green-500 bg-green-50 text-green-900";
    }
    return "border-slate-200 focus:ring-blue-600 bg-slate-50";
  };

  // Helper para formatar data ISO
  const formatDateTime = (isoStr: string) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleString('pt-BR');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 p-6 flex items-center gap-4 text-white">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <span className="material-icons-round text-2xl">add_task</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Novo Registro de RAI</h2>
            <p className="text-blue-100 text-sm opacity-90">Preencha as informações da ocorrência</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <span className="material-icons-round text-amber-600 shrink-0">warning_amber</span>
            <div className="text-sm text-amber-800 leading-relaxed">
              <span className="font-bold">Atenção:</span> Pontos disponíveis imediatamente para RAIs dentro do prazo. 
              RAIs com mais de 90 dias exigem liberação da administração.
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-bold ${duplicateStatus?.isDuplicate ? 'text-red-600' : 'text-slate-700'}`}>
                    Número do RAI (8 dígitos)
                </label>
                <div className="relative">
                  <span className={`material-icons-round absolute left-3 top-3 text-lg ${duplicateStatus?.isDuplicate ? 'text-red-500' : duplicateStatus?.isDuplicate === false ? 'text-green-600' : 'text-slate-400'}`}>
                      {duplicateStatus?.isDuplicate ? 'error' : duplicateStatus?.isDuplicate === false ? 'check_circle' : 'search'}
                  </span>
                  <input 
                    name="raiNumber"
                    value={formData.raiNumber}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all text-sm font-bold ${getInputStyles()}`} 
                    placeholder="00000000" 
                    type="text"
                    maxLength={8}
                    inputMode="numeric"
                  />
                </div>
                
                {/* Alerta de Duplicidade */}
                {duplicateStatus?.isDuplicate && (
                    <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-lg flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]">
                        <span className="material-icons-round text-red-600 text-base mt-0.5">report_problem</span>
                        <div>
                            <p className="text-xs font-bold text-red-700 uppercase">RAI EM DUPLICIDADE!</p>
                            <p className="text-xs text-red-600">
                                Registrado em: <span className="font-bold">{formatDateTime(duplicateStatus.previousRecord!.dataRegistro)}</span>
                            </p>
                            <p className="text-xs text-red-600">
                                Status: {duplicateStatus.previousRecord!.status}
                            </p>
                        </div>
                    </div>
                )}
                {/* Feedback Positivo */}
                {duplicateStatus?.isDuplicate === false && (
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1 pl-1">
                        <span className="material-icons-round text-sm">verified</span> RAI disponível para registro
                    </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-bold ${isExpired ? 'text-red-600' : 'text-slate-700'}`}>
                    Data da Ocorrência
                </label>
                <div className="relative group" onClick={handleIconClick}>
                  <input 
                    ref={dateInputRef}
                    name="dataOcorrencia"
                    value={formData.dataOcorrencia}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-12 py-3 border rounded-lg outline-none transition-all text-sm cursor-pointer
                        ${isExpired 
                            ? 'bg-red-50 border-red-500 text-red-700 focus:ring-2 focus:ring-red-500 placeholder-red-300' 
                            : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900'
                        }
                    `} 
                    type="date"
                    style={{ colorScheme: isExpired ? 'light' : 'light' }}
                  />
                  <div 
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 pointer-events-none z-20"
                  >
                    <span className={`material-icons-round text-2xl transition-colors ${isExpired ? 'text-red-500' : 'text-slate-400 group-hover:text-blue-600'}`}>
                      {isExpired ? 'event_busy' : 'calendar_month'}
                    </span>
                  </div>
                </div>
                {/* Alerta de Expiração */}
                {isExpired && (
                    <p className="text-xs font-black text-red-600 flex items-center gap-1 mt-1 animate-pulse">
                        <span className="material-icons-round text-sm">warning</span>
                        RAI EXPIRADO
                    </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Natureza da Ocorrência</label>
              <div className="relative">
                <select 
                  name="natureza"
                  value={formData.natureza}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm appearance-none"
                >
                  {activeNaturezas.map(natureza => (
                      <option key={natureza.id} value={`${natureza.natureza} (${natureza.pontos} pts)`}>
                          {natureza.natureza} ({natureza.pontos} pts)
                      </option>
                  ))}
                  {activeNaturezas.length === 0 && <option value="">Nenhuma natureza disponível</option>}
                </select>
                <span className="material-icons-round absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Anotações (Opcional)</label>
              <textarea 
                name="obs"
                value={formData.obs}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm resize-none" 
                placeholder="Descreva detalhes relevantes..." 
                rows={3}
              ></textarea>
            </div>

            <button 
                type="submit" 
                disabled={!!duplicateStatus?.isDuplicate}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    duplicateStatus?.isDuplicate 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                    : isExpired 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                }`}
            >
              <span className="material-icons-round text-lg">
                  {duplicateStatus?.isDuplicate ? 'block' : isExpired ? 'warning' : 'check'}
              </span>
              {isExpired ? 'Salvar como Expirado' : 'Salvar Registro'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-6">
        <div className="flex items-center gap-2 text-blue-800 mb-4">
          <span className="material-icons-round text-lg">info</span>
          <h3 className="font-bold text-sm uppercase tracking-wide">Regras de Validação</h3>
        </div>
        <ul className="space-y-2 text-xs text-blue-700 list-disc list-inside">
          <li><span className="font-bold">Limite de Uso:</span> Cada RAI pode ser compartilhado por até 3 policiais.</li>
          <li><span className="font-bold">Registro Único:</span> É proibido registrar o mesmo RAI mais de uma vez.</li>
          <li><span className="font-bold">Prazo de 90 Dias:</span> RAIs com mais de 90 dias não computam pontos automaticamente (Status: EXPIRADO).</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterRAI;