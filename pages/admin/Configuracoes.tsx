import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePoliceData } from '../../contexts/PoliceContext';

// Definição das Categorias do Menu
const SETTINGS_MENUS = [
  { id: 'RAI', label: 'Registro de RAIs', icon: 'description', subtitle: 'Validade, Pontuação e Regras' },
  { id: 'DISPENSAS', label: 'Dispensas & Escala', icon: 'event_available', subtitle: 'Vagas, Custos e Limites' },
  { id: 'IMAGENS', label: 'Imagens & Identidade', icon: 'palette', subtitle: 'Logotipo e Personalização' },
  { id: 'SISTEMA', label: 'Sistema & Documentação', icon: 'settings_suggest', subtitle: 'Manuais e Versão' },
];

const AdminConfiguracoes = () => {
  const { reportLogo, setReportLogo } = usePoliceData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado da Navegação
  const [activeMenu, setActiveMenu] = useState('RAI');

  // Estados dos Formulários (Configurações)
  const [config, setConfig] = useState({
    // RAIs
    validadeRai: 90,
    bloquearDuplicidade: true,
    pontuacaoAutomatica: true,
    // Dispensas
    vagasPorDia: 2,
    custoPadrao: 100,
    custoFimDeSemana: 140,
    limiteMensal: 1,
    // Sistema
    modoManutencao: false
  });

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Aqui seria a chamada para API para persistir as configurações
    alert("Configurações salvas e aplicadas com sucesso!");
  };

  // --- Lógica de Imagem (Mantida) ---
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setReportLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Lógica de PDF (Mantida e Atualizada) ---
  const generateManual = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const today = new Date().toLocaleDateString('pt-BR');

    // Cabeçalho
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    let textX = 14;
    if (reportLogo) {
        try {
            const imgProps = doc.getImageProperties(reportLogo);
            const ratio = imgProps.width / imgProps.height;
            const maxWidth = 35; const maxHeight = 30;
            let w = maxWidth; let h = w / ratio;
            if (h > maxHeight) { h = maxHeight; w = h * ratio; }
            doc.addImage(reportLogo, 'PNG', 14, (40 - h) / 2, w, h); 
            textX = 14 + w + 5; 
        } catch (e) { console.error(e); }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("MANUAL DO SISTEMA", textX, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`RAI ENVIOS - Configuração Atual`, textX, 28);
    
    let finalY = 50;

    // Tabela de Configurações Atuais
    doc.setTextColor(0,0,0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Parâmetros Ativos", 14, finalY);
    finalY += 5;

    const configData = [
        ['Categoria', 'Parâmetro', 'Valor Atual'],
        ['RAI', 'Validade (Dias)', `${config.validadeRai} dias`],
        ['RAI', 'Bloqueio Duplicidade', config.bloquearDuplicidade ? 'Ativo' : 'Inativo'],
        ['Dispensa', 'Vagas Diárias', `${config.vagasPorDia} vagas`],
        ['Dispensa', 'Custo Padrão', `${config.custoPadrao} pts`],
        ['Dispensa', 'Custo FDS/Feriado', `${config.custoFimDeSemana} pts`],
    ];

    autoTable(doc, {
        startY: finalY,
        head: [configData[0]],
        body: configData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Manual_Config_${today.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
      
      {/* Header da Página */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie parâmetros globais, regras de negócio e personalização.</p>
        </div>
        <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform active:scale-95"
        >
            <span className="material-icons-round">save</span>
            Salvar Alterações
        </button>
      </div>

      {/* Área Principal (Layout 2 Colunas) */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        
        {/* COLUNA ESQUERDA: MENU DE CATEGORIAS */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Categorias</span>
            </div>
            <div className="p-2 space-y-1 flex-1 overflow-y-auto">
                {SETTINGS_MENUS.map((menu) => (
                    <button
                        key={menu.id}
                        onClick={() => setActiveMenu(menu.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all group relative overflow-hidden ${
                            activeMenu === menu.id 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'hover:bg-slate-50 border-transparent'
                        } border`}
                    >
                        {activeMenu === menu.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"></div>
                        )}
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                activeMenu === menu.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                            }`}>
                                <span className="material-icons-round">{menu.icon}</span>
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${activeMenu === menu.id ? 'text-blue-800' : 'text-slate-700'}`}>{menu.label}</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{menu.subtitle}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* COLUNA DIREITA: CONTEÚDO CONFIGURÁVEL */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-y-auto relative">
            
            {/* --- SEÇÃO: REGISTRO DE RAIS --- */}
            {activeMenu === 'RAI' && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-icons-round text-blue-600">description</span>
                            Configurações de Registro
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Defina as regras para o envio e validação de produtividade.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Validade */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700 uppercase">
                                Validade do RAI (Dias)
                            </label>
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    className="w-full bg-white border-2 border-slate-200 rounded-xl pl-12 pr-4 py-4 font-black text-slate-900 text-lg focus:border-blue-500 focus:ring-0 outline-none transition-all"
                                    value={config.validadeRai}
                                    onChange={(e) => handleConfigChange('validadeRai', Number(e.target.value))}
                                />
                                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">history</span>
                            </div>
                            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="font-bold">Nota:</span> Registros mais antigos que este valor entrarão automaticamente como "EXPIRADO".
                            </p>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-slate-50/50">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Bloquear Duplicidade</h4>
                                    <p className="text-xs text-slate-500 mt-1">Impede o mesmo RAI para o mesmo policial.</p>
                                </div>
                                <button 
                                    onClick={() => handleConfigChange('bloquearDuplicidade', !config.bloquearDuplicidade)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${config.bloquearDuplicidade ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${config.bloquearDuplicidade ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-slate-50/50">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Pontuação Automática</h4>
                                    <p className="text-xs text-slate-500 mt-1">Credita pontos imediatamente após o envio.</p>
                                </div>
                                <button 
                                    onClick={() => handleConfigChange('pontuacaoAutomatica', !config.pontuacaoAutomatica)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${config.pontuacaoAutomatica ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${config.pontuacaoAutomatica ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SEÇÃO: DISPENSAS & ESCALA --- */}
            {activeMenu === 'DISPENSAS' && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-icons-round text-orange-500">event_available</span>
                            Regras de Dispensa
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Calibre a quantidade de vagas e o custo em pontos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vagas Diárias</label>
                            <input 
                                type="number"
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-black text-2xl text-center text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                                value={config.vagasPorDia}
                                onChange={(e) => handleConfigChange('vagasPorDia', Number(e.target.value))}
                            />
                            <p className="text-[10px] text-center text-slate-400 mt-2">Limite do calendário</p>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Custo Padrão</label>
                            <div className="flex items-center justify-center gap-1">
                                <input 
                                    type="number"
                                    className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-2 font-black text-2xl text-center text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={config.custoPadrao}
                                    onChange={(e) => handleConfigChange('custoPadrao', Number(e.target.value))}
                                />
                                <span className="text-xs font-bold text-slate-400">pts</span>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">Segunda a Quinta</p>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Custo Fim de Semana</label>
                            <div className="flex items-center justify-center gap-1">
                                <input 
                                    type="number"
                                    className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-2 font-black text-2xl text-center text-purple-600 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={config.custoFimDeSemana}
                                    onChange={(e) => handleConfigChange('custoFimDeSemana', Number(e.target.value))}
                                />
                                <span className="text-xs font-bold text-slate-400">pts</span>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">Sex, Sáb, Dom e Feriados</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-slate-700">Limite Mensal por Policial:</label>
                            <select 
                                className="bg-white border border-slate-300 rounded-lg px-4 py-2 font-bold text-slate-800 outline-none focus:border-blue-500"
                                value={config.limiteMensal}
                                onChange={(e) => handleConfigChange('limiteMensal', Number(e.target.value))}
                            >
                                <option value={1}>1 Dispensa</option>
                                <option value={2}>2 Dispensas</option>
                                <option value={3}>3 Dispensas</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SEÇÃO: IMAGENS & IDENTIDADE --- */}
            {activeMenu === 'IMAGENS' && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-icons-round text-purple-600">palette</span>
                            Identidade Visual
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Personalize o logotipo usado nos relatórios PDF gerados pelo sistema.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Preview */}
                        <div className="w-full md:w-1/3">
                            <div className="aspect-square bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative group overflow-hidden">
                                {reportLogo ? (
                                    <>
                                        <img src={reportLogo} alt="Logo Preview" className="max-w-[80%] max-h-[80%] object-contain shadow-sm" />
                                        <button 
                                            onClick={removeLogo}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                            title="Remover Logo"
                                        >
                                            <span className="material-icons-round text-sm block">delete</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center text-slate-400 p-4">
                                        <span className="material-icons-round text-5xl mb-2 block">image</span>
                                        <span className="text-xs font-bold uppercase">Sem Logo Definida</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex-1 space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                                <h4 className="font-bold text-blue-800 mb-2">Upload de Arquivo</h4>
                                <p className="text-xs text-blue-600 mb-4">
                                    Recomendamos o uso de imagens PNG com fundo transparente.<br/>
                                    Dimensões ideais: 300x300px.
                                </p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleLogoUpload} 
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/jpg" 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-3 bg-white border border-blue-200 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm flex items-center gap-2"
                                >
                                    <span className="material-icons-round">cloud_upload</span>
                                    {reportLogo ? 'Substituir Imagem' : 'Selecionar Imagem'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SEÇÃO: SISTEMA & DOCUMENTAÇÃO --- */}
            {activeMenu === 'SISTEMA' && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-icons-round text-slate-600">settings_suggest</span>
                            Sistema & Manuais
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Recursos técnicos e documentação para auditoria.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800">Manual de Regras & Parâmetros</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-md">
                                    Gera um PDF contendo todas as regras de negócio ativas, incluindo os valores configurados nas abas anteriores.
                                </p>
                            </div>
                            <button 
                                onClick={generateManual}
                                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-icons-round">picture_as_pdf</span>
                                Baixar PDF
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center justify-between opacity-80">
                            <div>
                                <h4 className="font-bold text-red-800">Modo de Manutenção</h4>
                                <p className="text-xs text-red-600 mt-1">
                                    Bloqueia o acesso de usuários comuns ao sistema temporariamente.
                                </p>
                            </div>
                            <button 
                                onClick={() => handleConfigChange('modoManutencao', !config.modoManutencao)}
                                className={`w-14 h-7 rounded-full p-1 transition-colors ${config.modoManutencao ? 'bg-red-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${config.modoManutencao ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase">Versão do Sistema</p>
                        <p className="text-xs font-mono text-slate-400">v2.1.0 (Stable)</p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracoes;