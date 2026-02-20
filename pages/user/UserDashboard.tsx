import React, { useMemo } from 'react';
import { usePoliceData, DispensaRegistro } from '../../contexts/PoliceContext';

const StatCard = ({ icon, label, value, sub, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <span className="material-icons-round text-xl text-white">{icon}</span>
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  </div>
);

const UserDashboard = () => {
  const { userPoints, userRaiRecords, cpcQueue, cpcQueueConfig, calendarRegistros } = usePoliceData();

  // Mock do Usuário Atual (Em produção viria do AuthContext)
  const currentUser = {
    nome: 'SD LUCAS MIGUEL',
    matricula: '39874', // Matrícula que será usada para verificar a fila e o calendário
    aniversario: '24/01', 
    primeiroNome: 'Lucas Miguel'
  };

  // Cálculos de resumo
  const pendingCount = userRaiRecords.filter(r => r.status === 'PENDENTE').length;
  const approvedCount = userRaiRecords.filter(r => r.status === 'APROVADO').length;
  
  // Pegar as 3 atividades mais recentes
  const recentActivities = userRaiRecords.slice(0, 3);

  // --- LÓGICA PRÓXIMA DISPENSA ---
  const nextDispensa = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora para comparar apenas data

    // 1. Encontra todas as datas que possuem registro para a matrícula do usuário
    const myDates = Object.entries(calendarRegistros)
      .filter(([dateKey, registros]) => {
        return (registros as DispensaRegistro[]).some(r => r.matricula === currentUser.matricula);
      })
      .map(([dateKey]) => dateKey);

    // 2. Filtra apenas datas futuras ou hoje
    const futureDates = myDates.filter(dateKey => {
        const [ano, mes, dia] = dateKey.split('-').map(Number);
        const dateObj = new Date(ano, mes - 1, dia);
        return dateObj >= today;
    });

    // 3. Ordena (String 'YYYY-MM-DD' ordena corretamente alfabeticamente)
    futureDates.sort();

    // 4. Retorna a primeira formatada ou "---"
    if (futureDates.length > 0) {
        const [ano, mes, dia] = futureDates[0].split('-');
        return `${dia}/${mes}`;
    }
    return "---";
  }, [calendarRegistros, currentUser.matricula]);

  // --- LÓGICA DE NOTIFICAÇÕES (Prioridade) ---
  const notifications = useMemo(() => {
    const alerts = [];
    const today = new Date();
    const currentDayMonth = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    // 1. Verificação de Fila CPC (Prioridade Máxima - Notificação ADM)
    // Verifica se o usuário está na lista da fila
    const userInQueue = cpcQueue.find(item => item.matricula === currentUser.matricula);
    if (userInQueue) {
       alerts.push({
         type: 'QUEUE',
         priority: 1,
         data: userInQueue,
         queueList: cpcQueue.slice(0, 3) // Pega os top 3 da fila
       });
    }

    // 2. Aniversário
    if (currentUser.aniversario === currentDayMonth) {
        alerts.push({
            type: 'BIRTHDAY',
            priority: 2,
            message: `Parabéns, ${currentUser.nome}! O BPM Terminal deseja muitas felicidades.`
        });
    }

    // 3. Alerta de Vencimento de RAIs (RAIs entre 85 e 90 dias)
    const expiringRais = userRaiRecords.filter(r => {
        if (r.status === 'EXPIRADO') return false;
        const [ano, mes, dia] = r.dataOcorrencia.split('-').map(Number);
        const dataRai = new Date(ano, mes - 1, dia);
        const diffTime = today.getTime() - dataRai.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 85 && diffDays <= 90;
    });

    if (expiringRais.length > 0) {
        alerts.push({
            type: 'EXPIRING',
            priority: 3,
            count: expiringRais.length,
            message: `Você possui ${expiringRais.length} RAIs prestes a expirar (85+ dias).`
        });
    }

    // Ordena por prioridade (menor número = maior prioridade)
    return alerts.sort((a, b) => a.priority - b.priority);
  }, [cpcQueue, userRaiRecords]);

  // Pega a notificação mais importante para definir o estilo do banner
  const activeNotification = notifications.length > 0 ? notifications[0] : null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateStr;
  };

  // Renderização condicional do Banner
  const renderBanner = () => {
      // Caso 1: Fila CPC Ativa para o usuário (Notificação ADM - VERMELHO)
      if (activeNotification?.type === 'QUEUE') {
          const pos = activeNotification.data.posicao;
          const isFirst = pos === 1;
          const criterea = cpcQueueConfig?.criterio || 'Geral';
          
          return (
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl px-6 py-3 text-white relative overflow-hidden shadow-lg animate-[fadeIn_0.5s_ease-out]">
                {/* Etiqueta de Critério */}
                <div className="absolute top-0 left-0 bg-black px-4 py-2 rounded-br-lg shadow-md z-20">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                        DISPENSA CPC: FILA {criterea === 'ALMANAQUE' ? 'ALMANAQUE' : 'PRODUTIVIDADE'}
                    </p>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-4 pt-5">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">Atenção Necessária</span>
                            <span className="text-red-100 text-xs flex items-center gap-1 font-medium"><span className="material-icons-round text-sm">timer</span> Expira em breve</span>
                        </div>
                        {/* Fonte ajustada para igualar ao Banner Azul (text-2xl font-bold) */}
                        <h1 className="text-2xl font-bold mb-1 leading-tight uppercase">
                            {isFirst ? 'É SUA VEZ DE ESCOLHER!' : `VOCÊ É O ${pos}º DA FILA!`}
                        </h1>
                        {/* Texto ajustado com ícone de Ampulheta */}
                        <p className="text-red-50 text-sm font-medium opacity-95 w-full leading-snug flex items-center gap-1.5">
                            <span className="material-icons-round text-sm">hourglass_bottom</span>
                            {isFirst 
                                ? "A fila CPC chegou em você. Acesse o menu 'Calendário' agora para garantir sua data." 
                                : "Fique atento! A fila está andando e sua vez de escolher a dispensa está próxima."}
                        </p>
                    </div>

                    {/* Lista dos Top 3 da Fila (Ajustada para ser mais compacta) */}
                    <div className="bg-black/20 rounded-lg p-2 border border-white/10 w-full md:w-64 backdrop-blur-sm shrink-0">
                        <p className="text-[9px] font-bold text-red-100 uppercase mb-1 border-b border-white/10 pb-0.5">Status da Fila</p>
                        <div className="space-y-0.5">
                            {activeNotification.queueList.map((item: any) => (
                                <div key={item.matricula} className={`flex items-center justify-between text-xs px-2 py-0.5 rounded ${item.matricula === currentUser.matricula ? 'bg-white/20 font-bold text-white' : 'text-red-50 font-medium'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${item.matricula === currentUser.matricula ? 'bg-white text-red-600' : 'bg-white/90 text-red-500'}`}>{item.posicao}</span>
                                        <span className="truncate max-w-[120px] uppercase text-[10px]">{item.nome.split(' ').slice(0,2).join(' ')}</span>
                                    </div>
                                    {item.posicao === 1 && <span className="w-2 h-2 bg-green-400 rounded-full shadow-sm animate-pulse"></span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <span className="material-icons-round absolute -right-4 -bottom-8 text-[180px] opacity-10">format_list_numbered</span>
            </div>
          );
      }

      // Caso 2: Aniversário (Demais - AZUL)
      if (activeNotification?.type === 'BIRTHDAY') {
          return (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white relative overflow-hidden shadow-lg animate-[fadeIn_0.5s_ease-out]">
                <div className="relative z-10 flex items-center gap-6">
                    <div className="hidden md:flex w-20 h-20 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm shrink-0">
                        <span className="material-icons-round text-5xl">cake</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black mb-2">Feliz Aniversário, Guerreiro!</h1>
                        <p className="text-blue-100 text-sm opacity-90 max-w-xl leading-relaxed">
                            O Batalhão agradece por mais um ano de vida e dedicação. Que seu novo ciclo seja repleto de conquistas e segurança. Aproveite o seu dia!
                        </p>
                    </div>
                </div>
                {/* Confetes Decorativos (CSS Mock) */}
                <span className="material-icons-round absolute top-4 right-10 text-4xl opacity-20 rotate-12">celebration</span>
                <span className="material-icons-round absolute bottom-4 left-1/3 text-6xl opacity-10 -rotate-12">local_bar</span>
                <span className="material-icons-round absolute -right-4 -bottom-8 text-[180px] opacity-10">card_giftcard</span>
            </div>
          );
      }

      // Caso 3: Alerta de Vencimento (Demais - AZUL, ou Vermelho se crítico, mas seguindo a regra "Demais: AZUL", manterei padrão ou um azul de alerta)
      if (activeNotification?.type === 'EXPIRING') {
          return (
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-8 text-white relative overflow-hidden shadow-lg animate-[fadeIn_0.5s_ease-out]">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-blue-200">
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-400">Ação Necessária</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Atenção aos Prazos!</h1>
                    <p className="text-blue-100 text-sm opacity-90">
                        {activeNotification.message} Registre ou justifique-os antes que completem 90 dias para não perder a pontuação.
                    </p>
                </div>
                <span className="material-icons-round absolute -right-4 -bottom-8 text-[180px] opacity-10">history_toggle_off</span>
            </div>
          );
      }

      // Caso 4: Padrão (Sem notificações críticas - AZUL)
      return (
        <div className="bg-blue-600 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">Olá, {currentUser.primeiroNome}!</h1>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
                <span className="material-icons-round text-lg">schedule</span>
                <span>Acompanhe aqui o resumo da sua produtividade e saldo de pontos.</span>
            </div>
            </div>
            <span className="material-icons-round absolute -right-4 -bottom-8 text-[180px] opacity-10">military_tech</span>
        </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Banner Dinâmico */}
      {renderBanner()}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="trending_up" 
          label="Pontos Ativos" 
          value={userPoints} 
          sub="pts acumulados" 
          color="bg-green-500" 
        />
        <StatCard 
          icon="event" 
          label="Próxima Dispensa" 
          value={nextDispensa} 
          sub={nextDispensa !== "---" ? "Agendada" : "Sem registro"}
          color="bg-blue-500" 
        />
        <StatCard 
          icon="priority_high" 
          label="RAIs Pendentes" 
          value={pendingCount} 
          color="bg-orange-500" 
        />
        <StatCard 
          icon="check_circle" 
          label="RAIs Aprovados" 
          value={approvedCount} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[300px]">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <span className="material-icons-round text-blue-600">bar_chart</span>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Informativo de Produtividade</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Os pontos são computados automaticamente após o registro do RAI. Lembre-se que registros com mais de 90 dias precisam de validação administrativa.
                </p>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                   <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Dica de Pontuação</p>
                   <p className="text-xs text-blue-800">Naturezas como "Apreensão de Arma" e "Prisão em Flagrante" garantem as maiores pontuações do ciclo.</p>
                </div>
             </div>
             <div className="flex items-center justify-center border-l border-gray-50 pl-4">
                <div className="text-center">
                   <div className="w-24 h-24 rounded-full border-8 border-green-500 border-t-transparent flex items-center justify-center mx-auto mb-2 rotate-45">
                      <span className="text-xl font-black text-gray-800 -rotate-45">{Math.min(100, Math.round((userPoints/200)*100))}%</span>
                   </div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Meta para Dispensa</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[300px]">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <span className="material-icons-round text-orange-500">schedule</span>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Atividade Recente</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((rai) => (
                <div key={rai.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                       <span className="material-icons-round text-blue-600 text-sm">description</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 uppercase">RAI {rai.raiNumber}</p>
                      <p className="text-[9px] text-gray-400">{formatDate(rai.dataOcorrencia)} • {rai.natureza}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-green-600">+{rai.pontos} PTS</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <span className="material-icons-round text-gray-200 text-4xl mb-2">history</span>
                <p className="text-sm text-gray-400 italic">Nenhuma atividade registrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;