import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface Policial {
  id: number;
  nome: string;
  matricula: string;
  equipe: string;
  aniversario: string;
  telefone: string;
  email: string;
}

export interface NaturezaItem {
  id: number;
  natureza: string;
  descricao: string;
  pontos: number;
  nga: string;
  ativo: boolean;
}

export interface UserRaiRecord {
  id: string;
  raiNumber: string;
  dataOcorrencia: string;
  natureza: string;
  pontos: number;
  status: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | 'EXPIRADO';
  dataRegistro: string;
  obs?: string; // Campo adicionado para observações
}

// Interfaces para o Calendário
export interface DispensaRegistro {
  id: string;
  policial: string;
  matricula: string;
  tipo: string;
  obs: string;
  equipe?: string; // Adicionado para vincular dispensa à equipe
}

// Interface para Item da Fila CPC
export interface CpcQueueItem {
  posicao: number;
  matricula: string;
  nome: string;
  status: 'VEZ DE ESCOLHER' | 'AGUARDANDO';
  expiraEm?: string;
}

// Interface para Configuração da Fila CPC
export interface CpcQueueConfig {
  criterio: string;
  equipe: string;
  prazo: number;
}

interface PoliceContextData {
  policiais: Policial[];
  setPoliciais: React.Dispatch<React.SetStateAction<Policial[]>>;
  availableTeams: string[];
  setAvailableTeams: React.Dispatch<React.SetStateAction<string[]>>;
  naturezas: NaturezaItem[];
  setNaturezas: React.Dispatch<React.SetStateAction<NaturezaItem[]>>;
  userPoints: number;
  setUserPoints: React.Dispatch<React.SetStateAction<number>>;
  userRaiRecords: UserRaiRecord[];
  setUserRaiRecords: React.Dispatch<React.SetStateAction<UserRaiRecord[]>>;
  
  // Estados Globais de Calendário (Sincronização Admin <-> User)
  calendarRegistros: Record<string, DispensaRegistro[]>;
  setCalendarRegistros: React.Dispatch<React.SetStateAction<Record<string, DispensaRegistro[]>>>;
  calendarBloqueios: Record<string, string>;
  setCalendarBloqueios: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  // Estado Global da Fila CPC (Notificação)
  cpcQueue: CpcQueueItem[];
  setCpcQueue: React.Dispatch<React.SetStateAction<CpcQueueItem[]>>;
  cpcQueueConfig: CpcQueueConfig | null;
  setCpcQueueConfig: React.Dispatch<React.SetStateAction<CpcQueueConfig | null>>;

  // Logotipo Global para Relatórios
  reportLogo: string | null;
  setReportLogo: React.Dispatch<React.SetStateAction<string | null>>;
}

const PoliceContext = createContext<PoliceContextData>({} as PoliceContextData);

const INITIAL_TEAMS = [
  'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 
  'P2', 'P3', 'P4', 'ADJUNTO', 
  'TCO', 'REGIÃO 44', 'MANUTENÇÃO', 
  'COMANDO', 'SUBCMT', 'MOT CMT'
];

const INITIAL_NATUREZAS: NaturezaItem[] = [
  { 
    id: 1, 
    natureza: 'Prisão em Flagrante', 
    descricao: 'Homicídio / Latrocínio / Estupro', 
    pontos: 50, 
    nga: 'Portaria Nº 22/2024', 
    ativo: true 
  },
  { 
    id: 2, 
    natureza: 'Apreensão de Arma', 
    descricao: 'Arma de fogo (qualquer calibre)', 
    pontos: 30, 
    nga: 'Portaria Nº 22/2024', 
    ativo: true 
  },
  { 
    id: 3, 
    natureza: 'Recuperação de Veículo', 
    descricao: 'Veículo com registro de furto/roubo', 
    pontos: 20, 
    nga: 'Portaria Nº 22/2024', 
    ativo: true 
  },
  { 
    id: 4, 
    natureza: 'TCO', 
    descricao: 'Termo Circunstanciado de Ocorrência', 
    pontos: 10, 
    nga: 'Portaria Nº 22/2024', 
    ativo: false 
  },
];

const initialPoliciais: Policial[] = [
  { id: 1, nome: 'MAJ KAMINICHE', matricula: '33864', equipe: 'COMANDO', aniversario: '', telefone: '', email: '' },
  { id: 2, nome: 'CAP ERNANE', matricula: '36234', equipe: 'SUBCMT', aniversario: '', telefone: '', email: '' },
  { id: 3, nome: '1º TEN J. CARLOS', matricula: '25646', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 4, nome: '1º TEN SANTOS', matricula: '28702', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 5, nome: '1º TEN KLEBER', matricula: '28905', equipe: 'REGIÃO 44', aniversario: '', telefone: '', email: '' },
  { id: 6, nome: '1º TEN SERAFIM', matricula: '30220', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 7, nome: '1º TEN MONTES', matricula: '31123', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 8, nome: '1º TEN SANTIAGO', matricula: '38718', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 9, nome: 'ST ANDRADE', matricula: '28639', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 10, nome: 'ST CLEIBE', matricula: '30611', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 11, nome: 'ST MARCELO', matricula: '31141', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 12, nome: 'ST MARÇAL', matricula: '33073', equipe: 'P4', aniversario: '', telefone: '', email: '' },
  { id: 13, nome: '1º SGT RAMOS', matricula: '24955', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 14, nome: '1º SGT NUNES', matricula: '26624', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 15, nome: '1º SGT KLAUBER', matricula: '26808', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 16, nome: '1º SGT MACHADO', matricula: '27122', equipe: 'ADJUNTO', aniversario: '', telefone: '', email: '' },
  { id: 17, nome: '1º SGT MACEDO', matricula: '27733', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 18, nome: '1º SGT GONÇALVES', matricula: '28027', equipe: 'ADJUNTO', aniversario: '', telefone: '', email: '' },
  { id: 19, nome: '1º SGT LÚCIO', matricula: '28493', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 20, nome: '1º SGT MOREIRA', matricula: '28748', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 21, nome: '1º SGT JHONATAN', matricula: '31853', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 22, nome: '1º SGT SUDÁRIO', matricula: '32288', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 23, nome: '2º SGT DE PAULA', matricula: '27183', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 24, nome: '2º SGT LEUCIONE', matricula: '30245', equipe: 'MANUTENÇÃO', aniversario: '', telefone: '', email: '' },
  { id: 25, nome: '2º SGT FERNANDO', matricula: '31279', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 26, nome: '2º SGT PAULO VIEIRA', matricula: '32956', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 27, nome: '2º SGT CÂNDIDO FILHO', matricula: '33000', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 28, nome: '2º SGT VICTOY', matricula: '33142', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 29, nome: '2º SGT ÉDER', matricula: '33150', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 30, nome: '2º SGT CARNEIRO', matricula: '33949', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 31, nome: '2º SGT ANDRÉ AMARA', matricula: '34226', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 32, nome: '2º SGT MESSIAS', matricula: '34962', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 33, nome: '3º SGT MONTEIRO', matricula: '27310', equipe: 'ADJUNTO', aniversario: '', telefone: '', email: '' },
  { id: 34, nome: '3º SGT MORENO', matricula: '31600', equipe: 'ADJUNTO', aniversario: '', telefone: '', email: '' },
  { id: 35, nome: '3º SGT WALACE', matricula: '34208', equipe: 'REGIÃO 44', aniversario: '', telefone: '', email: '' },
  { id: 36, nome: '3º SGT DIAS', matricula: '34425', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 37, nome: '3º SGT NETTO', matricula: '34686', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 38, nome: '3º SGT BAYRON', matricula: '35447', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 39, nome: '3º SGT SANDER', matricula: '35534', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 40, nome: '3º SGT DARLAN', matricula: '35619', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 41, nome: '3º SGT ÉZIO', matricula: '35672', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 42, nome: '3º SGT ALENCAR', matricula: '35686', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 43, nome: '3º SGT JAIRO', matricula: '35768', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 44, nome: '3º SGT JUNIO', matricula: '35820', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 45, nome: '3º SGT MARK', matricula: '35893', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 46, nome: '3º SGT CÉSAR', matricula: '35928', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 47, nome: 'CB CASTRO', matricula: '36277', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 48, nome: 'CB PIRES', matricula: '36291', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 49, nome: 'CB CÉLIO', matricula: '36383', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 50, nome: 'CB RUFINA', matricula: '36490', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 51, nome: 'CB LIMA', matricula: '36507', equipe: 'P3', aniversario: '', telefone: '', email: '' },
  { id: 52, nome: 'CB SENA', matricula: '36713', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 53, nome: 'CB AQUINO', matricula: '36720', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 54, nome: 'CB FERREIRA', matricula: '36977', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 55, nome: 'CB EULLER', matricula: '37104', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 56, nome: 'CB SOARES', matricula: '37132', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 57, nome: 'CB AUGUSTO', matricula: '37138', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 58, nome: 'CB WARTELOO', matricula: '37190', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 59, nome: 'CB GILVAN', matricula: '37253', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 60, nome: 'CB DE LIMA', matricula: '37379', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 61, nome: 'CB VARGAS', matricula: '37566', equipe: 'MOT CMT', aniversario: '', telefone: '', email: '' },
  { id: 62, nome: 'CB DOS REIS', matricula: '37676', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 63, nome: 'CB EUGÊNIA', matricula: '37800', equipe: 'P3', aniversario: '', telefone: '', email: '' },
  { id: 64, nome: 'CB MENDES', matricula: '37829', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 65, nome: 'CB PADILHA', matricula: '37932', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 66, nome: 'CB REZENDE', matricula: '37958', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 67, nome: 'CB HENRIQUE', matricula: '38019', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 68, nome: 'CB PASSOS', matricula: '38183', equipe: 'P2', aniversario: '', telefone: '', email: '' },
  { id: 69, nome: 'CB SAITON', matricula: '38291', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 70, nome: 'CB GOMES', matricula: '38426', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 71, nome: 'CB MORAIS', matricula: '38657', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 72, nome: 'SD MARQUES', matricula: '38882', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 73, nome: 'SD BRENDON', matricula: '38937', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 74, nome: 'SD RIBEIRO', matricula: '38974', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 75, nome: 'SD VASCONCELLOS', matricula: '38984', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 76, nome: 'SD GERALDO', matricula: '39096', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 77, nome: 'SD GUEDES', matricula: '39203', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 78, nome: 'SD L SILVA', matricula: '39280', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 79, nome: 'SD CARNEIRO', matricula: '39357', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 80, nome: 'SD NIVALDO', matricula: '39396', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 81, nome: 'SD SUCUPIRA', matricula: '39417', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 82, nome: 'SD SARMENTO', matricula: '39435', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 83, nome: 'SD VENÂNCIO', matricula: '39505', equipe: 'TCO', aniversario: '', telefone: '', email: '' },
  { id: 84, nome: 'SD BRITO', matricula: '39580', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 85, nome: 'SD COIMBRA', matricula: '39780', equipe: 'ADJUNTO', aniversario: '', telefone: '', email: '' },
  { id: 86, nome: 'SD LUCAS MIGUEL', matricula: '39874', equipe: 'ALPHA', aniversario: '', telefone: '', email: '' },
  { id: 87, nome: 'SD NETO', matricula: '39948', equipe: 'BRAVO', aniversario: '', telefone: '', email: '' },
  { id: 88, nome: 'SD TARCIS', matricula: '39974', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
  { id: 89, nome: 'SD RENAN', matricula: '39989', equipe: 'DELTA', aniversario: '', telefone: '', email: '' },
  { id: 90, nome: 'SD OLIVEIRA', matricula: '40025', equipe: 'CHARLIE', aniversario: '', telefone: '', email: '' },
];

export const PoliceProvider = ({ children }: { children?: ReactNode }) => {
  const [policiais, setPoliciais] = useState<Policial[]>(initialPoliciais);
  const [availableTeams, setAvailableTeams] = useState<string[]>(INITIAL_TEAMS);
  const [naturezas, setNaturezas] = useState<NaturezaItem[]>(INITIAL_NATUREZAS);
  const [userPoints, setUserPoints] = useState<number>(0); 
  const [userRaiRecords, setUserRaiRecords] = useState<UserRaiRecord[]>([]);

  // Estados compartilhados de Calendário
  const [calendarRegistros, setCalendarRegistros] = useState<Record<string, DispensaRegistro[]>>({});
  const [calendarBloqueios, setCalendarBloqueios] = useState<Record<string, string>>({});

  // Estado Global da Fila CPC (NOVO)
  const [cpcQueue, setCpcQueue] = useState<CpcQueueItem[]>([]);
  const [cpcQueueConfig, setCpcQueueConfig] = useState<CpcQueueConfig | null>(null);

  // Estado Global do Logotipo com Persistência
  const [reportLogo, setReportLogo] = useState<string | null>(() => {
    return localStorage.getItem('global_report_logo');
  });

  // Efeito para persistir o logo sempre que mudar
  useEffect(() => {
    if (reportLogo) {
      localStorage.setItem('global_report_logo', reportLogo);
    } else {
      localStorage.removeItem('global_report_logo');
    }
  }, [reportLogo]);

  return (
    <PoliceContext.Provider value={{ 
      policiais, 
      setPoliciais, 
      availableTeams, 
      setAvailableTeams,
      naturezas,
      setNaturezas,
      userPoints,
      setUserPoints,
      userRaiRecords,
      setUserRaiRecords,
      calendarRegistros,
      setCalendarRegistros,
      calendarBloqueios,
      setCalendarBloqueios,
      cpcQueue,
      setCpcQueue,
      cpcQueueConfig,
      setCpcQueueConfig,
      reportLogo,
      setReportLogo
    }}>
      {children}
    </PoliceContext.Provider>
  );
};

export const usePoliceData = () => useContext(PoliceContext);