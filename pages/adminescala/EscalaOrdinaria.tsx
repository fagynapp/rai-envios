import React, { useEffect, useMemo, useState } from 'react';
import { usePoliceData } from '../../contexts/PoliceContext';

// --- TIPOS ---
interface CellData {
  value: string;
}

// --- DADOS ESTÁTICOS PARA ESTRUTURA (SIMULANDO A PLANILHA) ---
const DATES = [
  { date: '19/02/2026 (QUI)', team: '1º PELOTÃO "ALPHA"', id: 'D1' },
  { date: '20/02/2026 (SEX)', team: '2º PELOTÃO "BRAVO"', id: 'D2' },
  { date: '21/02/2026 (SÁB)', team: '3º PELOTÃO "CHARLIE"', id: 'D3' },
  { date: '22/02/2026 (DOM)', team: '4º PELOTÃO "DELTA"', id: 'D4' }
];

const AREAS = [
  { id: 1, gvm: 'GYN', func: '62 9 9912-3615', desc: 'CPU' },
  { id: 2, gvm: 'ÁREA I', func: '62 9 9641-4977', desc: 'T. VERA CRUZ, T. PE. PELÁGIO ATÉ A ESTAÇÃO ANICUNS.' },
  { id: 3, gvm: 'ÁREA II', func: '62 9 9681-7279', desc: 'T. DERGO, T. PRAÇA A; ATÉ A ESTAÇÃO JOQUEI CLUBE.' },
  { id: 4, gvm: 'ÁREA III', func: '62 9 9968-6674', desc: 'ESTAÇÃO BANDEIRANTE OESTE, T. PRAÇA DA BÍBLIA, ATÉ O T. NOVO MUNDO' },
  { id: 5, gvm: 'ÁREA IV', func: '62 9 9660-6902', desc: 'TERMINAL ISIDÓRIA, T. BANDEIRAS, T. GYN VIVA, T. PQ OESTE.' },
  { id: 6, gvm: 'ÁREA V', func: '62 9 9969-7361', desc: 'REGIÃO DA 44, T PAULO GARCIA, T. HAILÉ PINHEIRO, T. RECANTO DO BOSQUE' },
];

const EscalaDigital = () => {
  // Estado único para armazenar todos os inputs da planilha
  // Chave: string (ex: "AREA_1_D1_CMT") -> Valor: string
  const [sheetData, setSheetData] = useState<Record<string, string>>({});

  const handleInputChange = (key: string, value: string) => {
    setSheetData(prev => ({ ...prev, [key]: value }));
  };

  // Componente de Célula de Input (Simula célula do Excel)
  const ExcelInput = ({ 
    id, 
    placeholder = "", 
    className = "", 
    center = false,
    bold = false 
  }: { id: string, placeholder?: string, className?: string, center?: boolean, bold?: boolean }) => (
    <input
      type="text"
      value={sheetData[id] || ''}
      onChange={(e) => handleInputChange(id, e.target.value)}
      className={`w-full h-full bg-transparent outline-none px-1 text-xs text-slate-800 uppercase
        ${center ? 'text-center' : 'text-left'}
        ${bold ? 'font-black' : 'font-medium'}
        ${className}
      `}
      placeholder={placeholder}
    />
  );

  return (
    <div className="bg-gray-200 p-4 min-h-screen font-sans overflow-x-auto">
      {/* CONTAINER PRINCIPAL (PAPEL) */}
      <div className="bg-white min-w-[1600px] border border-gray-400 shadow-xl mx-auto pb-10" style={{ printColorAdjust: 'exact' }}>
        
        {/* =================================================================================
            1. CABEÇALHO SUPERIOR
           ================================================================================= */}
        <header className="flex border-b-2 border-black">
          {/* Logo e Título */}
          <div className="w-[200px] bg-[#4472c4] border-r border-white flex flex-col items-center justify-center p-2">
             <div className="w-16 h-16 bg-white/20 rounded-full mb-1 flex items-center justify-center text-white text-[10px]">LOGO</div>
          </div>
          
          <div className="flex-1 bg-[#4472c4] flex flex-col items-center justify-center py-2 text-white">
            <h1 className="text-3xl font-black uppercase tracking-wide">Escalas de Serviço - BPM Terminal</h1>
          </div>
        </header>

        {/* Sub-cabeçalho de Horários */}
        <div className="bg-[#d9d9d9] border-b-2 border-black text-center py-1">
           <span className="text-sm font-black uppercase text-black">HORÁRIO DAS 05:00 ÀS 23:59 E CORUJÃO DAS 05H ÀS 05H</span>
        </div>

        {/* =================================================================================
            2. TABELA PRINCIPAL - OPERACIONAL
           ================================================================================= */}
        <div className="grid grid-cols-[40px_80px_100px_400px_1fr_1fr_1fr_1fr] border-l-2 border-r-2 border-black">
          
          {/* --- HEADER DA TABELA --- */}
          {/* Linha 1: Títulos Fixos + Datas */}
          <div className="col-span-4 bg-[#4472c4] border-r border-white border-b border-white flex items-center justify-center text-white font-bold text-sm">
             DESCRIÇÃO DETALHADA DA ÁREA
          </div>
          {DATES.map(d => (
            <div key={d.id} className="bg-[#ffff00] border-r border-black border-b border-black text-center p-1">
              <span className="text-xs font-black text-black block uppercase">{d.date}</span>
            </div>
          ))}

          {/* Linha 2: Sub-títulos Fixos + Pelotões */}
          <div className="bg-[#4472c4] text-white flex items-center justify-center border-r border-white border-b-2 border-black text-xs font-bold py-1">Nº</div>
          <div className="bg-[#4472c4] text-white flex items-center justify-center border-r border-white border-b-2 border-black text-xs font-bold">ÁREA</div>
          <div className="bg-[#4472c4] text-white flex items-center justify-center border-r border-white border-b-2 border-black text-xs font-bold">FUNCIONAL</div>
          <div className="bg-[#4472c4] text-white flex items-center justify-center border-r border-black border-b-2 border-black text-xs font-bold">DESCRIÇÃO</div>
          
          {DATES.map(d => (
            <div key={`pel-${d.id}`} className="bg-[#4472c4] border-r border-black border-b-2 border-black text-center p-1">
              <span className="text-xs font-bold text-white uppercase">{d.team}</span>
            </div>
          ))}

          {/* --- CORPO DA TABELA (ÁREAS) --- */}
          {AREAS.map((area, idx) => {
             const rowColor = idx % 2 === 0 ? 'bg-[#e9eff7]' : 'bg-white'; // Alternância sutil
             return (
              <React.Fragment key={area.id}>
                {/* Colunas Fixas */}
                <div className={`row-span-2 ${rowColor} border-r border-black border-b border-black flex items-center justify-center font-black text-sm`}>{area.id}</div>
                <div className={`row-span-2 bg-[#d9e1f2] border-r border-black border-b border-black flex items-center justify-center font-bold text-xs text-center px-1`}>{area.gvm}</div>
                <div className={`row-span-2 bg-white border-r border-black border-b border-black flex items-center justify-center font-medium text-[10px] text-center px-1`}>{area.func}</div>
                <div className={`row-span-2 bg-white border-r-2 border-black border-b border-black flex items-center px-2 py-1 text-[10px] font-bold leading-tight uppercase`}>{area.desc}</div>

                {/* Colunas Dinâmicas (Datas) - LINHA CMT */}
                {DATES.map(date => (
                  <div key={`cmt-${area.id}-${date.id}`} className="bg-white border-r border-black border-b border-gray-300 h-8 flex">
                    <div className="w-8 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-500">CMT</div>
                    <div className="flex-1">
                      <ExcelInput id={`AREA_${area.id}_${date.id}_CMT`} bold />
                    </div>
                  </div>
                ))}

                {/* Colunas Dinâmicas (Datas) - LINHA MOT */}
                {DATES.map(date => (
                  <div key={`mot-${area.id}-${date.id}`} className="bg-white border-r border-black border-b border-black h-8 flex">
                    <div className="w-8 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-500">MOT</div>
                    <div className="flex-1">
                      <ExcelInput id={`AREA_${area.id}_${date.id}_MOT`} />
                    </div>
                  </div>
                ))}
              </React.Fragment>
             );
          })}

          {/* =================================================================================
              3. EQUIPE DE PRONTO EMPREGO – EPE / CDC
             ================================================================================= */}
          
          {/* Header EPE */}
          <div className="col-span-4 bg-[#4472c4] border-r-2 border-black border-b border-black h-6"></div> {/* Spacer Left */}
          {DATES.map(d => (
             <div key={`epe-header-${d.id}`} className="bg-[#4472c4] text-white text-center text-xs font-bold border-r border-black border-b border-black h-6 flex items-center justify-center">
                EPE / CDC
             </div>
          ))}

          {/* Rows EPE (3 Equipes) */}
          {[1, 2, 3].map((epeId) => (
            <React.Fragment key={`epe-row-${epeId}`}>
               {/* Fixed Info */}
               <div className="bg-[#d9e1f2] border-r border-black border-b border-black flex items-center justify-center font-black text-sm">REC</div>
               <div className="bg-white border-r border-black border-b border-black flex items-center justify-center text-xs">-</div>
               <div className="bg-white border-r border-black border-b border-black"></div>
               <div className="bg-[#e7e6e6] border-r-2 border-black border-b border-black px-2 flex items-center font-bold text-xs uppercase">
                  EQUIPE DE PRONTO EMPREGO - EPE/CDC {epeId}
               </div>

               {/* Dynamic Date Cells for EPE */}
               {DATES.map(date => (
                 <div key={`epe-${epeId}-${date.id}`} className="border-r border-black border-b border-black">
                    <div className="flex border-b border-gray-300 h-6">
                        <div className="w-8 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px]">CMT</div>
                        <ExcelInput id={`EPE_${epeId}_${date.id}_CMT`} bold />
                    </div>
                    <div className="flex h-6">
                        <div className="w-8 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px]">MOT</div>
                        <ExcelInput id={`EPE_${epeId}_${date.id}_MOT`} />
                    </div>
                 </div>
               ))}
            </React.Fragment>
          ))}

          {/* =================================================================================
              4. REC – RECOBRIMENTO
             ================================================================================= */}
          
          {[1, 2, 3].map((recId) => (
            <React.Fragment key={`rec-row-${recId}`}>
               <div className="bg-[#d9e1f2] border-r border-black border-b border-black flex items-center justify-center font-black text-sm">{recId + 7}</div>
               <div className="bg-white border-r border-black border-b border-black flex items-center justify-center text-xs">-</div>
               <div className="bg-white border-r border-black border-b border-black"></div>
               <div className="bg-[#e7e6e6] border-r-2 border-black border-b border-black px-2 flex items-center font-bold text-xs uppercase">
                  EPE/CDC (REC) - RECOBRIMENTO {recId}
               </div>

               {DATES.map(date => (
                 <div key={`rec-${recId}-${date.id}`} className="border-r border-black border-b border-black">
                    <div className="flex border-b border-gray-300 h-6">
                        <div className="w-8 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px]">CMT</div>
                        <ExcelInput id={`REC_${recId}_${date.id}_CMT`} bold />
                    </div>
                    <div className="flex h-6">
                        <div className="w-8 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px]">MOT</div>
                        <ExcelInput id={`REC_${recId}_${date.id}_MOT`} />
                    </div>
                 </div>
               ))}
            </React.Fragment>
          ))}

          {/* =================================================================================
              11. ESCALA ADJUNTOS 24x72 (Barra Separadora)
             ================================================================================= */}
          <div className="col-span-4 bg-[#4472c4] text-white border-r-2 border-black border-b border-black text-center font-bold text-sm py-1 uppercase">
             ESCALA DE ADJUNTO: 24X72
          </div>
          {DATES.map(date => (
             <div key={`adj-header-${date.id}`} className="bg-[#4472c4] text-white border-r border-black border-b border-black text-center font-bold text-xs py-1 uppercase">
                ADJUNTO
             </div>
          ))}

          <div className="col-span-4 bg-[#d9d9d9] border-r-2 border-black border-b-2 border-black text-center font-bold text-xs py-2 uppercase">
             HORÁRIO: 07:00H ÀS 07:00
          </div>
          {DATES.map(date => (
             <div key={`adj-cell-${date.id}`} className="bg-white border-r border-black border-b-2 border-black flex h-10">
                <div className="w-8 bg-gray-200 border-r border-gray-300 flex items-center justify-center text-[9px] font-bold">ADJ</div>
                <div className="flex-1">
                   <ExcelInput id={`ADJUNTO_${date.id}`} center bold />
                </div>
             </div>
          ))}

        </div> 
        {/* FIM DO GRID PRINCIPAL */}

        {/* =================================================================================
            5, 6, 7, 8, 9, 10, 12 - BLOCOS INFERIORES (GRID SEPARADO)
           ================================================================================= */}
        
        <div className="grid grid-cols-5 gap-4 mt-6 px-1">
            
            {/* BLOCO 5: EXPEDIENTE */}
            <div className="border-2 border-black">
               <div className="bg-[#4472c4] text-white text-center font-bold text-xs py-1 uppercase border-b border-black">EXPEDIENTE</div>
               
               <div className="grid grid-cols-[80px_1fr] border-b border-black">
                  <div className="bg-[#4472c4] text-white text-center text-[10px] font-bold py-1 border-r border-black">HORÁRIO</div>
                  <div className="bg-[#d9d9d9] text-center text-[10px] font-bold py-1">08H ÀS 18H</div>
               </div>

               {/* Linhas Expediente */}
               {[
                 { role: 'COMANDO', ph: 'MAJ KAMINICHE' },
                 { role: 'SUBCMT', ph: 'CAP ERNANE' },
                 { role: 'P1', ph: 'CB EUGÊNIA' },
                 { role: 'P2', ph: '1º TEN SANTOS' },
                 { role: 'P3', ph: 'CB LIMA' },
                 { role: 'P4', ph: 'ST MARÇAL' },
                 { role: 'MOT CMD', ph: 'CB VARGAS' },
                 { role: 'TCO', ph: 'SD VENÂNCIO' },
               ].map((item, i) => (
                 <div key={i} className="border-b border-black last:border-0 h-7">
                    <ExcelInput id={`EXP_${item.role}`} placeholder={`${item.ph} [${item.role}]`} className="text-[10px] px-2" bold />
                 </div>
               ))}

               {/* Bloco 6: Escala 12x36 (Dentro da coluna esquerda) */}
               <div className="bg-[#4472c4] text-white text-center font-bold text-xs py-1 uppercase border-t-2 border-b border-black mt-0">ESCALA 12X36</div>
               <div className="grid grid-cols-[80px_1fr] border-b border-black">
                  <div className="bg-[#4472c4] text-white text-center text-[10px] font-bold py-1 border-r border-black">HORÁRIO</div>
                  <div className="bg-[#d9d9d9] text-center text-[10px] font-bold py-1">07H ÀS 19H</div>
               </div>
               {[
                 { role: 'CMD 44', ph: '1º TEN KLEBER' },
                 { role: 'MOT CMD 44', ph: '3º SGT WALACE' },
                 { role: 'AUX P2', ph: '1º SGT JHONATAN' },
                 { role: 'MANUTENÇÃO', ph: '2º SGT LEUCIONE' },
               ].map((item, i) => (
                 <div key={i} className="border-b border-black last:border-0 h-7">
                    <ExcelInput id={`12X36_${item.role}`} placeholder={`${item.ph} [${item.role}]`} className="text-[10px] px-2" bold />
                 </div>
               ))}
            </div>

            {/* BLOCO 10: DISPENSA RECOMPENSA */}
            <div className="border-2 border-black">
               <div className="bg-[#4472c4] text-white text-center font-bold text-xs py-1 uppercase border-b border-black">DISPENSA RECOMPENSA</div>
               <div className="grid grid-cols-[80px_1fr] border-b border-black bg-[#4472c4] text-white text-[10px] font-bold">
                  <div className="text-center py-1 border-r border-white">DATA</div>
                  <div className="text-center py-1">NOME DO POLICIAL</div>
               </div>
               {/* 16 Linhas para preencher com renderização garantida (Ajustado para uniformidade) */}
               {Array.from({ length: 16 }).map((_, i) => (
                  <div key={`dispensa-${i}`} className="grid grid-cols-[80px_1fr] border-b border-black h-6 last:border-0 bg-white">
                     <div className="border-r border-black h-full">
                        <ExcelInput id={`DISP_DATA_${i}`} center />
                     </div>
                     <div className="h-full">
                        <ExcelInput id={`DISP_NOME_${i}`} className="px-2" />
                     </div>
                  </div>
               ))}
            </div>

            {/* BLOCO 7, 8, 9: AFASTAMENTOS */}
            <div className="col-span-2 border-2 border-black">
                <div className="bg-[#4472c4] text-white text-center font-bold text-xs py-1 uppercase border-b border-black">AFASTAMENTOS</div>
                <div className="grid grid-cols-[80px_80px_1fr_100px] border-b border-black bg-[#4472c4] text-white text-[10px] font-bold text-center">
                   <div className="py-1 border-r border-white">INÍCIO</div>
                   <div className="py-1 border-r border-white">FINAL</div>
                   <div className="py-1 border-r border-white">NOME DO POLICIAL</div>
                   <div className="py-1">TIPO</div>
                </div>
                {/* 16 Linhas para Afastamentos com renderização garantida (Ajustado para uniformidade) */}
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={`afastamento-${i}`} className="grid grid-cols-[80px_80px_1fr_100px] border-b border-black h-6 last:border-0 bg-white">
                     <div className="border-r border-black h-full"><ExcelInput id={`AFAST_INI_${i}`} center /></div>
                     <div className="border-r border-black h-full"><ExcelInput id={`AFAST_FIM_${i}`} center /></div>
                     <div className="border-r border-black h-full"><ExcelInput id={`AFAST_NOME_${i}`} className="px-2" /></div>
                     <div className="h-full"><ExcelInput id={`AFAST_TIPO_${i}`} className="px-2" placeholder={i === 0 ? "FÉRIAS" : i === 1 ? "LICENÇA ESPECIAL" : i === 2 ? "BAIXA MÉDICA" : ""} /></div>
                  </div>
               ))}
            </div>

            {/* BLOCO 12: P2 (NOVO) */}
            <div className="border-2 border-black">
               <div className="bg-[#4472c4] text-white text-center font-bold text-xs py-1 uppercase border-b border-black">P2</div>
               
               <div className="grid grid-cols-[100px_1fr] border-b border-black">
                  <div className="bg-[#4472c4] text-white text-center text-[10px] font-bold py-1 border-r border-black">HORÁRIO</div>
                  <div className="bg-[#d9d9d9] text-center text-[10px] font-bold py-1">05:00 ÀS 00:00</div>
               </div>

               {/* Linhas P2 com grid consistente */}
               <div className="grid grid-cols-[100px_1fr] border-b border-black h-6 bg-white">
                  <div className="border-r border-black flex items-center px-1 text-[10px] font-bold">ANÁLISE</div>
                  <div className="h-full"><ExcelInput id="P2_ANALISE" className="px-1" /></div>
               </div>

               {[
                 { label: 'PELOTÃO: ALPHA', id: 'ALPHA_1', ph: '2ºSGT EDER' },
                 { label: 'PELOTÃO: ALPHA', id: 'ALPHA_2', ph: '3ºSGT SANDER' },
                 { label: 'PELOTÃO: BRAVO', id: 'BRAVO_1', ph: 'CB PASSOS' },
                 { label: 'PELOTÃO: BRAVO', id: 'BRAVO_2', ph: 'CB WARTELOO' },
                 { label: 'PELOTÃO: CHARLIE', id: 'CHARLIE_1', ph: 'CB SENA' },
                 { label: 'PELOTÃO: CHARLIE', id: 'CHARLIE_2', ph: 'CB MENDES' },
                 { label: 'PELOTÃO: DELTA', id: 'DELTA_1', ph: '3ºSGT NETTO' },
                 { label: 'PELOTÃO: DELTA', id: 'DELTA_2', ph: 'PM DE FÉRIAS' },
               ].map((item, i) => (
                 <div key={i} className="grid grid-cols-[100px_1fr] border-b border-black h-6 bg-white">
                    <div className="border-r border-black flex items-center px-1 text-[9px] font-bold uppercase">{item.label}</div>
                    <div className="h-full">
                        <ExcelInput id={`P2_${item.id}`} placeholder={item.ph} className="text-[10px] px-1" />
                    </div>
                 </div>
               ))}
               
               {/* Linhas Vazias de Preenchimento para P2 (Ajustado para totalizar 16 linhas: 9 fixas + 7 vazias) */}
               {Array.from({ length: 7 }).map((_, i) => (
                  <div key={`p2-empty-${i}`} className="grid grid-cols-[100px_1fr] border-b border-black h-6 last:border-0 bg-white">
                     <div className="border-r border-black h-full"></div>
                     <div className="h-full">
                        <ExcelInput id={`P2_EMPTY_${i}`} className="px-1" />
                     </div>
                  </div>
               ))}
            </div>

        </div>

      </div>
    </div>
  );
};


// =================================================================================
//  ABA "REGISTRAR" (NOVA) — CADASTRO ESTRUTURADO PARA A ADM (SEM ALTERAR A ESCALA DIGITAL)
//  Observação: nesta etapa, os registros ficam em localStorage. Na próxima etapa,
//  conectaremos esses dados para preencher automaticamente a Escala Digital.
// =================================================================================

type SituacaoCadastro =
  | 'PM ESCALADO'
  | 'PM DISPENSADO'
  | 'PM DE FÉRIAS'
  | 'PM DE ATESTADO'
  | 'PM DE LICENÇA ESPECIAL';

type SecaoCadastro =
  | 'ESCALA OPERACIONAL'
  | 'EPE/CDC'
  | 'REC'
  | 'ESCALA EXPEDIENTE'
  | 'ESCALA 12X36'
  | 'ESCALA P2'
  | 'ESCALA ADJUNTOS 24X72';

interface RegistroEscala {
  id: string;
  dataISO: string; // yyyy-mm-dd
  secao: SecaoCadastro;

  // Operacional: pelotão + slots (para cadastro rápido e drag-and-drop)
  pelotao?: string;
  slotId?: string; // ex: "OP:ALPHA:CPU:CMT"

  // Identificação do policial (para integração futura e consistência)
  policialId?: number;
  matricula?: string;

  // Exibição
  equipe?: string;  // ALPHA/BRAVO/CHARLIE/DELTA/P2/...
  area?: string;    // CPU / ÁREA I / ...
  funcao?: string;  // CMT / MOT / ...
  policial: string; // texto: "NOME RG XXXX"
  situacao: SituacaoCadastro;
  auxiliar?: {
    policialId?: number;
    nome: string;
    matricula?: string;
    situacao: SituacaoCadastro;
  } | null;
  obs?: string;
  createdAtISO?: string;
}

const ESCALA_REGISTRAR_STORAGE_KEY = 'bpmterminal:escala:ordinaria:registrar:v1';

function uid() {
  return Math.random().toString(16).slice(2) + '-' + Date.now().toString(16);
}

function toDate(dISO: string) {
  const [y, m, d] = dISO.split('-').map((x) => parseInt(x, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

function shiftISODate(dISO: string, delta: number) {
  const d = toDate(dISO);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadRegistrar(): RegistroEscala[] {
  try {
    const raw = localStorage.getItem(ESCALA_REGISTRAR_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RegistroEscala[]) : [];
  } catch {
    return [];
  }
}

function saveRegistrar(rows: RegistroEscala[]) {
  localStorage.setItem(ESCALA_REGISTRAR_STORAGE_KEY, JSON.stringify(rows));
}

const SITUACOES: SituacaoCadastro[] = [
  'PM ESCALADO',
  'PM DISPENSADO',
  'PM DE FÉRIAS',
  'PM DE ATESTADO',
  'PM DE LICENÇA ESPECIAL',
];

const SECOES: SecaoCadastro[] = [
  'ESCALA OPERACIONAL',
  'EPE/CDC',
  'REC',
  'ESCALA EXPEDIENTE',
  'ESCALA 12X36',
  'ESCALA P2',
];

const EQUIPES_BASE = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'P2', 'P3', 'P4', 'ADJUNTO', 'TCO', 'COMANDO', 'SUBCMT'];

const TEMPLATE = {
  'ESCALA OPERACIONAL': {
    areas: ['CPU', 'ÁREA I', 'ÁREA II', 'ÁREA III', 'ÁREA IV', 'ÁREA V'],
    funcoes: ['CMT', 'MOT', 'AUX', 'OBS'],
    equipeDefault: 'ALPHA',
  },
  'EPE/CDC': {
    areas: ['EPE/CDC 1', 'EPE/CDC 2', 'EPE/CDC 3'],
    funcoes: ['CMT', 'MOT'],
    equipeDefault: 'EPE/CDC',
  },
  'REC': {
    areas: ['REC 1', 'REC 2', 'REC 3'],
    funcoes: ['CMT', 'MOT'],
    equipeDefault: 'REC',
  },
  'ESCALA EXPEDIENTE': {
    areas: ['EXPEDIENTE'],
    funcoes: ['COMANDO', 'SUBCMT', 'P/1', 'P/2', 'P/3', 'P/4', 'MOT CMD', 'TCO'],
    equipeDefault: 'EXPEDIENTE',
  },
  'ESCALA 12X36': {
    areas: ['12X36'],
    funcoes: ['CMD 44', 'MOT CMD 44', 'AUX P/2', 'MANUTENÇÃO'],
    equipeDefault: '12X36',
  },
  'ESCALA P2': {
    areas: ['P2'],
    funcoes: ['ANÁLISE', 'EQUIPE A', 'EQUIPE B', 'EQUIPE C', 'EQUIPE D'],
    equipeDefault: 'P2',
  },
} as const;

function RegistrarTab() {
  const { policiais, afastamentos } = usePoliceData();

  type RegistrarSection = 'OPERACIONAL' | 'EXPEDIENTE' | 'DOZE_36' | 'ADJUNTOS_24X72' | 'P2';
  type DragPayload =
    | { kind: 'policial'; policialId: number }
    | { kind: 'team'; teamKey: string }
    | { kind: 'auxiliar' };

  interface TeamConfig {
    id: string;
    name: string;
    sigla: string;
    defaultDate?: string;
  }

  const [rows, setRows] = useState<RegistroEscala[]>([]);
  const [dataISO, setDataISO] = useState<string>(todayISO());
  const [section, setSection] = useState<RegistrarSection>('OPERACIONAL');

  const [teams, setTeams] = useState<TeamConfig[]>(() => {
    const saved = localStorage.getItem('bpmterminal:escala:teams');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ALPHA', name: '1º PELOTÃO', sigla: 'ALPHA', defaultDate: '2026-02-19' },
      { id: 'BRAVO', name: '2º PELOTÃO', sigla: 'BRAVO', defaultDate: '2026-02-20' },
      { id: 'CHARLIE', name: '3º PELOTÃO', sigla: 'CHARLIE', defaultDate: '2026-02-21' },
      { id: 'DELTA', name: '4º PELOTÃO', sigla: 'DELTA', defaultDate: '2026-02-22' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('bpmterminal:escala:teams', JSON.stringify(teams));
  }, [teams]);

  // Operacional
  const [pelotao, setPelotao] = useState<string>('ALPHA');
  const [search, setSearch] = useState<string>('');
  const [poolFilter, setPoolFilter] = useState<'TODOS' | 'DISPONIVEIS' | 'INATIVOS'>('TODOS');
  const [listMode, setListMode] = useState<'INDIVIDUAL' | 'EQUIPE'>('INDIVIDUAL');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  function handlePelotaoChange(newPel: string) {
    setPelotao(newPel);
    const config = teams.find(t => t.id === newPel);
    if (config?.defaultDate) {
      setDataISO(config.defaultDate);
    }
  }

  useEffect(() => {
    const loaded = loadRegistrar();
    setRows(loaded);
  }, []);

  useEffect(() => {
    saveRegistrar(rows);
  }, [rows]);

  // ---------- helpers ----------
  const findAfast = useMemo(() => {
    return (matricula: string | number, dateIso: string) => {
      const dt = toDate(dateIso).getTime();
      return (afastamentos || []).find((a) => {
        if ((a.matricula || '').trim() !== String(matricula || '').trim()) return false;
        const ini = toDate(a.inicio).getTime();
        const ret = toDate(a.retorno).getTime();
        return dt >= ini && dt <= ret;
      });
    };
  }, [afastamentos]);

  function prevent(e: React.DragEvent) {
    e.preventDefault();
  }

  function setDragPayload(e: React.DragEvent, payload: DragPayload) {
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  }

  function getDragPayload(e: React.DragEvent): DragPayload | null {
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function slotTone(situacao?: SituacaoCadastro) {
    // 🟩 Escalado / 🟨 Dispensa / 🟥 Afastamento
    if (!situacao || situacao === 'PM ESCALADO') {
      return {
        wrap: 'border-green-700 ring-1 ring-green-100 bg-green-50/30',
        badge: 'bg-green-600 text-white',
      };
    }
    if (situacao === 'PM DISPENSADO') {
      return {
        wrap: 'border-amber-400 ring-1 ring-amber-100 bg-amber-50/40',
        badge: 'bg-amber-500 text-white',
      };
    }
    // Férias / Atestado / Licença Especial = afastamento
    return {
      wrap: 'border-red-400 ring-1 ring-red-100 bg-red-50/40',
      badge: 'bg-red-600 text-white',
    };
  }

  function isAfastamento(situacao?: SituacaoCadastro) {
    return (
      situacao === 'PM DE ATESTADO' ||
      situacao === 'PM DE FÉRIAS' ||
      situacao === 'PM DE LICENÇA ESPECIAL'
    );
  }

  function shouldShowNameInSlot(situacao?: SituacaoCadastro) {
    // Para manter leitura limpa (como você pediu): se não estiver ESCALADO, mostra só a situação.
    return situacao === 'PM ESCALADO';
  }

  // ---------- slots ----------
  const OP_AREAS = ['CPU', 'ÁREA I', 'ÁREA II', 'ÁREA III', 'ÁREA IV', 'ÁREA V'] as const;
  const OP_FUNCOES = ['CMT', 'MOT'] as const;

  type SlotDef = { slotId: string; title: string; secao: SecaoCadastro; pelotao?: string; area?: string; funcao?: string };

  const slots: SlotDef[] = useMemo(() => {
    if (section === 'OPERACIONAL') {
      const defs: SlotDef[] = [];
      OP_AREAS.forEach((area) => {
        OP_FUNCOES.forEach((funcao) => {
          defs.push({
            slotId: `OP:${pelotao}:${area}:${funcao}`,
            title: `${area} • ${funcao}`,
            secao: 'ESCALA OPERACIONAL',
            pelotao,
            area,
            funcao,
          });
        });
      });
      // EPE/CDC (3 equipes) – slots padrão (CMT/MOT)
      for (let i = 1; i <= 3; i++) {
        defs.push({
          slotId: `EPE:${pelotao}:EPE${i}:CMT`,
          title: `EPE/CDC ${i} • CMT`,
          secao: 'EPE/CDC',
          pelotao,
          area: `EPE/CDC ${i}`,
          funcao: 'CMT',
        });
        defs.push({
          slotId: `EPE:${pelotao}:EPE${i}:MOT`,
          title: `EPE/CDC ${i} • MOT`,
          secao: 'EPE/CDC',
          pelotao,
          area: `EPE/CDC ${i}`,
          funcao: 'MOT',
        });
      }
      return defs;
    }

    if (section === 'EXPEDIENTE') {
      const defs: SlotDef[] = [
        { slotId: 'EXP:COMANDO', title: 'COMANDO', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'COMANDO' },
        { slotId: 'EXP:SUBCMT', title: 'SUBCMT', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'SUBCMT' },
        { slotId: 'EXP:P1', title: 'P/1', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'P/1' },
        { slotId: 'EXP:P2', title: 'P/2', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'P/2' },
        { slotId: 'EXP:P3', title: 'P/3', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'P/3' },
        { slotId: 'EXP:P4', title: 'P/4', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'P/4' },
        { slotId: 'EXP:MOTCMD', title: 'MOT CMD', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'MOT CMD' },
        { slotId: 'EXP:TCO', title: 'TCO', secao: 'ESCALA EXPEDIENTE', area: 'EXPEDIENTE', funcao: 'TCO' },
      ];
      return defs;
    }

    if (section === 'DOZE_36') {
      const defs: SlotDef[] = [
        { slotId: '1236:CMD44', title: 'CMD 44', secao: 'ESCALA 12X36', area: '12X36', funcao: 'CMD 44' },
        { slotId: '1236:MOTCMD44', title: 'MOT CMD 44', secao: 'ESCALA 12X36', area: '12X36', funcao: 'MOT CMD 44' },
        { slotId: '1236:AUXP2', title: 'AUX P/2', secao: 'ESCALA 12X36', area: '12X36', funcao: 'AUX P/2' },
        { slotId: '1236:MANUT', title: 'MANUTENÇÃO', secao: 'ESCALA 12X36', area: '12X36', funcao: 'MANUTENÇÃO' },
      ];
      return defs;
    }

    if (section === 'ADJUNTOS_24X72') {
      const defs: SlotDef[] = [
        { slotId: 'ADJ:A', title: 'PELOTÃO A (Adjunto)', secao: 'ESCALA ADJUNTOS 24X72', area: 'ADJUNTOS', funcao: 'PELOTÃO A' },
        { slotId: 'ADJ:B', title: 'PELOTÃO B (Adjunto)', secao: 'ESCALA ADJUNTOS 24X72', area: 'ADJUNTOS', funcao: 'PELOTÃO B' },
        { slotId: 'ADJ:C', title: 'PELOTÃO C (Adjunto)', secao: 'ESCALA ADJUNTOS 24X72', area: 'ADJUNTOS', funcao: 'PELOTÃO C' },
        { slotId: 'ADJ:D', title: 'PELOTÃO D (Adjunto)', secao: 'ESCALA ADJUNTOS 24X72', area: 'ADJUNTOS', funcao: 'PELOTÃO D' },
      ];
      return defs;
    }

    // P2
    const defs: SlotDef[] = [
      { slotId: 'P2:ANALISE', title: 'ANÁLISE (revezamento)', secao: 'ESCALA P2', area: 'P2', funcao: 'ANÁLISE' },
      { slotId: 'P2:A:CMT', title: 'EQUIPE A - CMT', secao: 'ESCALA P2', area: 'P2', funcao: 'CMT' },
      { slotId: 'P2:A:MOT', title: 'EQUIPE A - MOT', secao: 'ESCALA P2', area: 'P2', funcao: 'MOT' },
      { slotId: 'P2:B:CMT', title: 'EQUIPE B - CMT', secao: 'ESCALA P2', area: 'P2', funcao: 'CMT' },
      { slotId: 'P2:B:MOT', title: 'EQUIPE B - MOT', secao: 'ESCALA P2', area: 'P2', funcao: 'MOT' },
      { slotId: 'P2:C:CMT', title: 'EQUIPE C - CMT', secao: 'ESCALA P2', area: 'P2', funcao: 'CMT' },
      { slotId: 'P2:C:MOT', title: 'EQUIPE C - MOT', secao: 'ESCALA P2', area: 'P2', funcao: 'MOT' },
      { slotId: 'P2:D:CMT', title: 'EQUIPE D - CMT', secao: 'ESCALA P2', area: 'P2', funcao: 'CMT' },
      { slotId: 'P2:D:MOT', title: 'EQUIPE D - MOT', secao: 'ESCALA P2', area: 'P2', funcao: 'MOT' },
    ];
    return defs;
  }, [section, pelotao]);

  const [opTeams, setOpTeams] = useState<Record<string, Array<{ key: string; label: string; area: string; members: Array<{ funcao: string; policial?: string; situacao?: SituacaoCadastro }> }>>>(() => {
    const saved = localStorage.getItem('bpmterminal:escala:opTeams');
    if (saved) return JSON.parse(saved);
    return {
      ALPHA: [
        { key: 'CPU', label: 'CPU (Supervisão)', area: 'CPU', members: [
          { funcao: 'CMT', policial: '1º TEN SANTIAGO 38.718' },
          { funcao: 'MOT', policial: 'CB REZENDE 37.958' },
        ]},
        { key: 'E1', label: 'Equipe 1', area: 'ÁREA I', members: [
          { funcao: 'CMT', policial: '1º SGT RAMOS 24.955' },
          { funcao: 'MOT', policial: 'SD SARMENTO 39.435' },
        ]},
        { key: 'E2', label: 'Equipe 2', area: 'ÁREA II', members: [
          { funcao: 'CMT', policial: '3º SGT JUNIO 35.820' },
          { funcao: 'MOT', policial: 'CB SAITON 38.291' },
          { funcao: 'AUX', policial: 'SD C. RIBEIRO 38.974' },
        ]},
        { key: 'E3', label: 'Equipe 3', area: 'ÁREA III', members: [
          { funcao: 'OBS', situacao: 'PM DISPENSADO' },
        ]},
        { key: 'EPE1', label: 'EPE/CDC 1', area: 'EPE/CDC 1', members: [
          { funcao: 'CMT', policial: 'CB MORAIS 38.657' },
          { funcao: 'MOT', policial: 'SD LUCAS MIGUEL 39.874' },
        ]},
        { key: 'EPE2', label: 'EPE/CDC 2', area: 'EPE/CDC 2', members: [
          { funcao: 'CMT', policial: 'CB EULLER 37.104' },
          { funcao: 'MOT', policial: 'SD GERALDO 39.096' },
        ]},
        { key: 'EPE3', label: 'EPE/CDC 3', area: 'EPE/CDC 3', members: [
          { funcao: 'CMT', policial: '2º SGT MESSIAS 34.962' },
          { funcao: 'MOT', policial: 'SD CARNEIRO 39.357' },
        ]},
      ],
      BRAVO: [
        { key: 'CPU', label: 'CPU (Supervisão)', area: 'CPU', members: [
          { funcao: 'CMT', policial: '1º SGT SUDÁRIO 32.288' },
          { funcao: 'MOT', policial: 'SD NETO 39.948' },
        ]},
        { key: 'E1', label: 'Equipe 1', area: 'ÁREA I', members: [
          { funcao: 'CMT', policial: '2º SGT DE PAULA 27.183' },
          { funcao: 'MOT', policial: 'CB DE LIMA 37.379' },
        ]},
        { key: 'E2', label: 'Equipe 2', area: 'ÁREA II', members: [
          { funcao: 'CMT', policial: '2º SGT VICTOY 33.142' },
          { funcao: 'MOT', policial: 'CB GILVAN 37.253' },
        ]},
        { key: 'E3', label: 'Equipe 3', area: 'ÁREA III', members: [
          { funcao: 'AUX', policial: '3º SGT CÉSAR 35.928' },
        ]},
        { key: 'EPE1', label: 'EPE/CDC 1', area: 'EPE/CDC 1', members: [
          { funcao: 'CMT', policial: '2º SGT CÂNDIDO FILHO 33.000' },
          { funcao: 'MOT', policial: 'SD VASCONCELLOS 38.984' },
        ]},
        { key: 'EPE2', label: 'EPE/CDC 2', area: 'EPE/CDC 2', members: [
          { funcao: 'CMT', policial: '3º SGT MARK 35.893' },
          { funcao: 'MOT', policial: 'CB GOMES 38.426' },
        ]},
        { key: 'EPE3', label: 'EPE/CDC 3', area: 'EPE/CDC 3', members: [
          { funcao: 'CMT', policial: '3º SGT DARLAN 35.619' },
          { funcao: 'MOT', policial: 'SD BRENDON 38.937' },
        ]},
      ],
      CHARLIE: [
        { key: 'CPU', label: 'CPU (Supervisão)', area: 'CPU', members: [
          { funcao: 'CMT', policial: '1º TEN SERAFIM 30.220' },
          { funcao: 'MOT', policial: 'CB HENRIQUE 38.019' },
        ]},
        { key: 'E1', label: 'Equipe 1', area: 'ÁREA I', members: [
          { funcao: 'CMT', policial: '2º SGT ANDRÉ AMARAL 34.226' },
          { funcao: 'MOT', policial: 'CB CÉLIO 36.383' },
        ]},
        { key: 'E2', label: 'Equipe 2', area: 'ÁREA II', members: [
          { funcao: 'OBS', situacao: 'PM DISPENSADO' },
        ]},
        { key: 'E3', label: 'Equipe 3', area: 'ÁREA III', members: [
          { funcao: 'OBS', situacao: 'PM DISPENSADO' },
        ]},
        { key: 'EPE1', label: 'EPE/CDC 1', area: 'EPE/CDC 1', members: [
          { funcao: 'CMT', policial: 'CB FERREIRA 36.977' },
          { funcao: 'MOT', policial: 'SD BRITO 39.580' },
        ]},
        { key: 'EPE2', label: 'EPE/CDC 2', area: 'EPE/CDC 2', members: [
          { funcao: 'CMT', policial: '2º SGT FERNANDO 31.279' },
          { funcao: 'MOT', policial: 'SD OLIVEIRA 40.025' },
        ]},
        { key: 'EPE3', label: 'EPE/CDC 3', area: 'EPE/CDC 3', members: [
          { funcao: 'CMT', policial: '3º SGT ÉZIO 35.672' },
          { funcao: 'MOT', policial: 'CB JOAQUINO 36.720' },
        ]},
      ],
      DELTA: [
        { key: 'CPU', label: 'CPU (Supervisão)', area: 'CPU', members: [
          { funcao: 'CMT', policial: '1º TEN MONTES 31.123' },
          { funcao: 'MOT', policial: 'SD RENAN 39.989' },
        ]},
        { key: 'E1', label: 'Equipe 1', area: 'ÁREA I', members: [
          { funcao: 'CMT', policial: '2º SGT KLAUBER 26.808' },
          { funcao: 'MOT', policial: 'SD MARQUES 38.882' },
        ]},
        { key: 'E2', label: 'Equipe 2', area: 'ÁREA II', members: [
          { funcao: 'AUX', policial: '3º SGT JAIRO 35.768' },
        ]},
        { key: 'E3', label: 'Equipe 3', area: 'ÁREA III', members: [
          { funcao: 'OBS', situacao: 'PM DISPENSADO' },
        ]},
        { key: 'EPE1', label: 'EPE/CDC 1', area: 'EPE/CDC 1', members: [
          { funcao: 'CMT', policial: '1º SGT MACEDO 27.733' },
          { funcao: 'MOT', policial: 'SD SILVA 39.280' },
        ]},
        { key: 'EPE2', label: 'EPE/CDC 2', area: 'EPE/CDC 2', members: [
          { funcao: 'CMT', policial: '2º SGT PAULO VIEIRA 32.956' },
          { funcao: 'MOT', policial: '3º SGT ABELNCAR 35.686' },
        ]},
        { key: 'EPE3', label: 'EPE/CDC 3', area: 'EPE/CDC 3', members: [
          { funcao: 'CMT', policial: '3º SGT DIAS 34.425' },
          { funcao: 'MOT', policial: 'SD NIVALDO 39.396' },
        ]},
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem('bpmterminal:escala:opTeams', JSON.stringify(opTeams));
  }, [opTeams]);

  const [usedTeams, setUsedTeams] = useState<Record<string, string[]>>(() => {
    try {
      const raw = localStorage.getItem('bpmterminal:escala:usedTeams:v1');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('bpmterminal:escala:usedTeams:v1', JSON.stringify(usedTeams));
  }, [usedTeams]);

  const teamScopeKey = useMemo(() => {
    // somente Operacional (modo Equipe) usa o anti-duplicidade por equipe
    return `${dataISO}:${pelotao}:OPERACIONAL`;
  }, [dataISO, pelotao]);

  const usedTeamSet = useMemo(() => new Set(usedTeams[teamScopeKey] || []), [usedTeams, teamScopeKey]);

  const DEFAULT_EXPEDIENTE = [
    { slotId: 'EXP:COMANDO', policial: 'MAJ KAMINICHE — RG 33864' },
    { slotId: 'EXP:SUBCMT', policial: 'CAP ERNANE — RG 36234' },
    { slotId: 'EXP:P1', policial: 'CB EUGÊNIA — RG 37800' },
    { slotId: 'EXP:P2', policial: '1º TEN SANTOS — RG 28.702' },
    { slotId: 'EXP:P3', policial: 'CB LIMA — RG 36.507' },
    { slotId: 'EXP:P4', policial: 'ST MARÇAL — RG 33.073' },
    { slotId: 'EXP:MOTCMD', policial: 'CB VARGAS — RG 37.566' },
    { slotId: 'EXP:TCO', policial: 'SD VENÂNCIO — RG 39.505' },
  ];

  const DEFAULT_12X36 = [
    { slotId: '1236:CMD44', policial: '1º TEN KLEBER — RG 28905' },
    { slotId: '1236:MOTCMD44', policial: '3º SGT WALACE — RG 34208' },
    { slotId: '1236:AUXP2', policial: '1º SGT JHONATAN — RG 31853' },
    { slotId: '1236:MANUT', policial: '2º SGT LEUCIONE — RG 30.245' },
  ];

  const DEFAULT_ADJUNTOS_BY_DATE: Record<string, Array<{ slotId: string; policial: string }>> = {
    '2026-02-19': [
      { slotId: 'ADJ:A', policial: '1º SGT MACHADO — RG 27.122' },
      { slotId: 'ADJ:B', policial: '3º SGT MORENO — RG 31.600' },
      { slotId: 'ADJ:C', policial: '3º SGT MONTEIRO — RG 27.310' },
      { slotId: 'ADJ:D', policial: 'SD COIMBRA — RG 39.780' },
    ],
    '2026-02-20': [
      { slotId: 'ADJ:A', policial: '1º SGT MACHADO — RG 27.122' },
      { slotId: 'ADJ:B', policial: '3º SGT MORENO — RG 31.600' },
      { slotId: 'ADJ:C', policial: '3º SGT MONTEIRO — RG 27.310' },
      { slotId: 'ADJ:D', policial: 'SD COIMBRA — RG 39.780' },
    ],
    '2026-02-21': [
      { slotId: 'ADJ:A', policial: '1º SGT MACHADO — RG 27.122' },
      { slotId: 'ADJ:B', policial: '3º SGT MORENO — RG 31.600' },
      { slotId: 'ADJ:C', policial: '3º SGT MONTEIRO — RG 27.310' },
      { slotId: 'ADJ:D', policial: 'SD COIMBRA — RG 39.780' },
    ],
    '2026-02-22': [
      { slotId: 'ADJ:A', policial: '1º SGT MACHADO — RG 27.122' },
      { slotId: 'ADJ:B', policial: '3º SGT MORENO — RG 31.600' },
      { slotId: 'ADJ:C', policial: '3º SGT MONTEIRO — RG 27.310' },
      { slotId: 'ADJ:D', policial: 'SD COIMBRA — RG 39.780' },
    ],
  };

  const DEFAULT_P2 = [
    { slotId: 'P2:A:CMT', policial: '2º SGT EDER — RG 33.150' },
    { slotId: 'P2:A:MOT', policial: '3º SGT SANDER — RG 35.534' },
    { slotId: 'P2:B:CMT', policial: 'CB PASSOS — RG 38.183' },
    { slotId: 'P2:B:MOT', policial: 'CB WARTELOO — RG 37.190' },
    { slotId: 'P2:C:CMT', policial: 'CB SENA — RG 36.713' },
    { slotId: 'P2:C:MOT', policial: 'CB MENDES — RG 37.829' },
    { slotId: 'P2:D:CMT', policial: '3º SGT NETTO — RG 34.686' },
    { slotId: 'P2:D:MOT', policial: 'CB PADILHA — RG 37.932' },
  ];

  // ---------- rows -> maps ----------
  const rowsForScope = useMemo(() => {
    // filtra para tela atual
    if (section === 'OPERACIONAL') {
      return rows.filter((r) => r.dataISO === dataISO && (r.secao === 'ESCALA OPERACIONAL' || r.secao === 'EPE/CDC') && r.pelotao === pelotao);
    }
    if (section === 'EXPEDIENTE') {
      return rows.filter((r) => r.dataISO === dataISO && r.secao === 'ESCALA EXPEDIENTE');
    }
    if (section === 'DOZE_36') {
      return rows.filter((r) => r.dataISO === dataISO && r.secao === 'ESCALA 12X36');
    }
    if (section === 'ADJUNTOS_24X72') {
      return rows.filter((r) => r.dataISO === dataISO && r.secao === 'ESCALA ADJUNTOS 24X72');
    }
    return rows.filter((r) => r.dataISO === dataISO && r.secao === 'ESCALA P2');
  }, [rows, section, dataISO, pelotao]);

  // ---------- police pool ----------
  const pelotaoTeam = useMemo(() => {
    // mapeia para o que existe no cadastro (equipe do policial)
    // No sistema, geralmente equipe é "ALPHA/BRAVO/CHARLIE/DELTA"
    return pelotao;
  }, [pelotao]);

  
  const policePool = useMemo(() => {
    const alreadyEscalatedIds = new Set(
      rowsForScope.flatMap(r => {
        const ids: number[] = [];
        if (r.policialId) ids.push(r.policialId);
        if (r.auxiliar?.policialId) ids.push(r.auxiliar.policialId);
        return ids;
      })
    );

    // Escopos de lista (Referência)
    function matchPool(p: any) {
      const eq = String(p?.equipe || '').toUpperCase().trim();

      if (section === 'OPERACIONAL') {
        return eq === pelotaoTeam;
      }

      if (section === 'EXPEDIENTE') {
        // Heurística: equipe cadastrada como EXPEDIENTE/COMANDO/SUBCMT/P1..P4/TCO
        if (eq.includes('EXP')) return true;
        return ['EXPEDIENTE', 'COMANDO', 'SUBCMT', 'P1', 'P/1', 'P3', 'P/3', 'P4', 'P/4', 'TCO'].includes(eq);
      }

      if (section === 'DOZE_36') {
        if (eq.includes('12')) return true;
        return ['12X36', '12X 36', '12X-36'].includes(eq);
      }

      if (section === 'P2') {
        return eq === 'P2' || eq.includes('P2');
      }

      if (section === 'ADJUNTOS_24X72') {
        return eq.includes('ADJ') || eq.includes('24X72');
      }

      return false;
    }

    const base = (policiais || [])
      .filter((p: any) => matchPool(p))
      .map((p: any) => {
        const a = findAfast(p.matricula, dataISO);
        return { ...p, __inactive: !!a, __afast: a };
      })
      .filter((p: any) => {
        // Busca
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
          String(p.nome || '').toLowerCase().includes(q) ||
          String(p.matricula || '').toLowerCase().includes(q)
        );
      })
      .filter((p: any) => {
        // Filtro rápido
        if (poolFilter === 'INATIVOS') return !!p.__inactive;
        if (poolFilter === 'DISPONIVEIS') return !p.__inactive && !alreadyEscalatedIds.has(p.id);
        return true; // TODOS
      })
      .sort((a: any, b: any) => {
        // ativos primeiro; depois por nome
        const ia = Number(a.__inactive);
        const ib = Number(b.__inactive);
        if (ia !== ib) return ia - ib;
        return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
      });

    // Regra de ouro: PM já escalado no escopo não aparece como disponível (mas pode aparecer em TODOS)
    if (poolFilter === 'DISPONIVEIS') return base;
    return base.map((p: any) => ({ ...p, __already: alreadyEscalatedIds.has(p.id) }));
  }, [policiais, pelotaoTeam, search, dataISO, findAfast, rowsForScope, section, poolFilter]);

  
  const poolCounts = useMemo(() => {
    const all = policePool.length;
    const inativos = policePool.filter((p: any) => !!p.__inactive).length;
    const jaEscalados = policePool.filter((p: any) => !!p.__already).length;
    const disponiveis = policePool.filter((p: any) => !p.__inactive && !p.__already).length;
    return { all, disponiveis, jaEscalados, inativos };
  }, [policePool]);
const slotMap = useMemo(() => {
    const map: Record<string, RegistroEscala> = {};
    rowsForScope.forEach((r) => {
      if (r.slotId) map[r.slotId] = r;
    });
    return map;
  }, [rowsForScope]);
  const validation = useMemo(() => {
    if (section !== 'OPERACIONAL') return null;

    const get = (area: string, funcao: string) => slotMap[`OP:${pelotao}:${area}:${funcao}`];
    const okCPU = !!get('CPU', 'CMT')?.policial && !!get('CPU', 'MOT')?.policial;

    const areaWarnings: string[] = [];
    (['ÁREA I', 'ÁREA II', 'ÁREA III', 'ÁREA IV', 'ÁREA V'] as const).forEach((a) => {
      const mot = get(a, 'MOT')?.policial;
      if (!mot) areaWarnings.push(`${a} sem MOT`);
    });

    // EPE/CDC 3 equipes: CMT e MOT devem estar preenchidos
    let epeMissing = 0;
    for (let i = 1; i <= 3; i++) {
      const c = slotMap[`EPE:${pelotao}:EPE${i}:CMT`]?.policial;
      const m = slotMap[`EPE:${pelotao}:EPE${i}:MOT`]?.policial;
      if (!c) epeMissing++;
      if (!m) epeMissing++;
    }

    const items: { kind: 'ok' | 'warn' | 'bad'; label: string }[] = [];
    items.push({ kind: okCPU ? 'ok' : 'bad', label: okCPU ? 'CPU ok' : 'CPU sem CMT/MOT' });

    areaWarnings.forEach((w) => items.push({ kind: 'warn', label: w }));

    items.push({
      kind: epeMissing === 0 ? 'ok' : 'bad',
      label: epeMissing === 0 ? 'EPE/CDC completo' : `EPE/CDC incompleto (${epeMissing} pendências)`,
    });

    return items;
  }, [section, slotMap, pelotao]);


  function upsertBySlot(slot: SlotDef, patch: Partial<RegistroEscala>) {
    setRows((prev) => {
      const idx = prev.findIndex((x) => x.slotId === slot.slotId && x.dataISO === dataISO);
      const base: RegistroEscala = idx >= 0 ? prev[idx] : {
        id: uid(),
        dataISO,
        secao: slot.secao,
        pelotao: slot.pelotao as any,
        slotId: slot.slotId,
        area: slot.area,
        funcao: slot.funcao,
        policial: '',
        policialId: undefined,
        situacao: 'PM ESCALADO',
        obs: '',
      };

      const nextItem: RegistroEscala = {
        ...base,
        ...patch,
        secao: slot.secao,
        pelotao: slot.pelotao as any,
        slotId: slot.slotId,
        area: slot.area,
        funcao: slot.funcao,
      };

      const next = [...prev];
      if (idx >= 0) next[idx] = nextItem;
      else next.unshift(nextItem);
      return next;
    });
  }

  function clearScope() {
    if (!confirm(`Confirmar limpeza desta seção para esta data/${section === 'OPERACIONAL' ? 'pelotão' : 'seção'}?`)) return;
    setRows((prev) => {
      const filtered = prev.filter((r) => {
        const isSameDate = r.dataISO === dataISO;
        if (section === 'OPERACIONAL') {
          return !(isSameDate && (r.secao === 'ESCALA OPERACIONAL' || r.secao === 'EPE/CDC') && r.pelotao === pelotao);
        }
        if (section === 'EXPEDIENTE') {
          return !(isSameDate && r.secao === 'ESCALA EXPEDIENTE');
        }
        if (section === 'DOZE_36') {
          return !(isSameDate && r.secao === 'ESCALA 12X36');
        }
        if (section === 'ADJUNTOS_24X72') {
          return !(isSameDate && r.secao === 'ESCALA ADJUNTOS 24X72');
        }
        return !(isSameDate && r.secao === 'ESCALA P2');
      });
      return filtered;
    });
  }

  function duplicatePrevDay() {
    const prevISO = shiftISODate(dataISO, -1);
    setRows((prev) => {
      const toCopy = prev.filter((r) => {
        if (section === 'OPERACIONAL') {
          return r.dataISO === prevISO && (r.secao === 'ESCALA OPERACIONAL' || r.secao === 'EPE/CDC') && r.pelotao === pelotao;
        }
        if (section === 'EXPEDIENTE') return r.dataISO === prevISO && r.secao === 'ESCALA EXPEDIENTE';
        if (section === 'DOZE_36') return r.dataISO === prevISO && r.secao === 'ESCALA 12X36';
        if (section === 'ADJUNTOS_24X72') return r.dataISO === prevISO && r.secao === 'ESCALA ADJUNTOS 24X72';
        return r.dataISO === prevISO && r.secao === 'ESCALA P2';
      });

      // remove o escopo atual antes de colar
      let cleaned = prev;
      if (section === 'OPERACIONAL') cleaned = cleaned.filter((r) => !(r.dataISO === dataISO && (r.secao === 'ESCALA OPERACIONAL' || r.secao === 'EPE/CDC') && r.pelotao === pelotao));
      if (section === 'EXPEDIENTE') cleaned = cleaned.filter((r) => !(r.dataISO === dataISO && r.secao === 'ESCALA EXPEDIENTE'));
      if (section === 'DOZE_36') cleaned = cleaned.filter((r) => !(r.dataISO === dataISO && r.secao === 'ESCALA 12X36'));
      if (section === 'ADJUNTOS_24X72') cleaned = cleaned.filter((r) => !(r.dataISO === dataISO && r.secao === 'ESCALA ADJUNTOS 24X72'));
      if (section === 'P2') cleaned = cleaned.filter((r) => !(r.dataISO === dataISO && r.secao === 'ESCALA P2'));

      const clones = toCopy.map((r) => ({ ...r, id: uid(), dataISO }));
      return [...clones, ...cleaned];
    });
  }

  function autoFill() {
    if (section === 'OPERACIONAL') {
      const teamsList = opTeams[pelotao];
      if (!teamsList) {
        alert('Nenhuma configuração padrão encontrada para este pelotão.');
        return;
      }
      const byAreaFunc: Record<string, { policial?: string; situacao?: SituacaoCadastro }> = {};

      teamsList.forEach((t) => {
        t.members.forEach((m) => {
          const key = `${t.area}:${m.funcao}`;
          byAreaFunc[key] = { policial: m.policial, situacao: m.situacao || 'PM ESCALADO' };
        });
      });

      slots.forEach((s) => {
        const k = `${s.area}:${s.funcao}`;
        const found = byAreaFunc[k];
        if (!found) return;
        upsertBySlot(s, {
          policial: found.policial || '',
          policialId: undefined,
          situacao: found.situacao || 'PM ESCALADO',
        });
      });
      return;
    }

    if (section === 'EXPEDIENTE') {
      DEFAULT_EXPEDIENTE.forEach((d) => {
        const s = slots.find((x) => x.slotId === d.slotId);
        if (!s) return;
        upsertBySlot(s, { policial: d.policial, policialId: undefined, situacao: 'PM ESCALADO' });
      });
      return;
    }

    if (section === 'DOZE_36') {
      DEFAULT_12X36.forEach((d) => {
        const s = slots.find((x) => x.slotId === d.slotId);
        if (!s) return;
        upsertBySlot(s, { policial: d.policial, policialId: undefined, situacao: 'PM ESCALADO' });
      });
      return;
    }

    if (section === 'ADJUNTOS_24X72') {
      const list = DEFAULT_ADJUNTOS_BY_DATE[dataISO] || [];
      list.forEach((d) => {
        const s = slots.find((x) => x.slotId === d.slotId);
        if (!s) return;
        upsertBySlot(s, { policial: d.policial, policialId: undefined, situacao: 'PM ESCALADO' });
      });
      return;
    }

    // P2
    DEFAULT_P2.forEach((d) => {
      const s = slots.find((x) => x.slotId === d.slotId);
      if (!s) return;
      upsertBySlot(s, { policial: d.policial, policialId: undefined, situacao: 'PM ESCALADO' });
    });
  }

  // ---------- drag & drop ----------
  function onDragStartPool(e: React.DragEvent, p: any) {
    setDragPayload(e, { kind: 'policial', policialId: p.id });
  }

  function onDragStartTeam(e: React.DragEvent, teamKey: string) {
    setDragPayload(e, { kind: 'team', teamKey });
  }

  function onDragStartSlot(e: React.DragEvent, slotId: string) {
    // arrastar slot -> slot (troca)
    setDragPayload(e, { kind: 'team', teamKey: `__SLOT__:${slotId}` });
  }

  function applyTeamToSlot(teamKey: string, dropSlot: SlotDef) {
    const teamList = opTeams[pelotao];
    if (!teamList) return;
    const t = teamList.find((x) => x.key === teamKey);
    if (!t) return;
    if (usedTeamSet.has(teamKey)) {
      alert('Esta equipe já foi aplicada neste dia/pelotão. Para reaplicar, desfaz a equipe em “Aplicadas”.');
      return;
    }

    // mapeia por área do time (CPU/ÁREAs ou EPE/CDC n)
    const affected = slots.filter((s) => s.area === t.area);
    t.members.forEach((m) => {
      const slot = affected.find((x) => x.funcao === m.funcao);
      if (!slot) return;
      upsertBySlot(slot, {
        policial: m.policial || '',
        policialId: undefined,
        situacao: m.situacao || 'PM ESCALADO',
      });
    });
  
    // marca equipe como aplicada (anti-duplicidade)
    setUsedTeams((prev) => {
      const cur = new Set(prev[teamScopeKey] || []);
      cur.add(teamKey);
      return { ...prev, [teamScopeKey]: Array.from(cur) };
    });
}

  
  function undoTeam(teamKey: string) {
    const teamList = opTeams[pelotao];
    if (!teamList) return;
    const t = teamList.find((x) => x.key === teamKey);
    if (!t) return;

    // limpa slots afetados (mesma área)
    const affected = slots.filter((s) => s.area === t.area);
    affected.forEach((slot) => {
      upsertBySlot(slot, { policial: '', policialId: undefined, situacao: 'PM ESCALADO', auxiliar: null, obs: '' });
    });

    // remove marca de uso
    setUsedTeams((prev) => {
      const cur = new Set(prev[teamScopeKey] || []);
      cur.delete(teamKey);
      const next = { ...prev, [teamScopeKey]: Array.from(cur) };
      if (next[teamScopeKey].length === 0) {
        // opcional: limpa chave vazia
        delete (next as any)[teamScopeKey];
      }
      return next;
    });
  }
function swapSlots(fromSlotId: string, toSlot: SlotDef) {
    const from = slotMap[fromSlotId];
    const to = slotMap[toSlot.slotId];

    // troca conteúdo (mantém metadados do slot)
    if (from) {
      upsertBySlot(toSlot, {
        policial: from.policial || '',
        policialId: from.policialId,
        situacao: from.situacao || 'PM ESCALADO',
        auxiliar: from.auxiliar,
        obs: from.obs || '',
      });
    } else {
      upsertBySlot(toSlot, { policial: '', policialId: undefined, situacao: 'PM ESCALADO', auxiliar: null, obs: '' });
    }

    if (to) {
      const fromSlotDef = slots.find((x) => x.slotId === fromSlotId);
      if (fromSlotDef) {
        upsertBySlot(fromSlotDef, {
          policial: to.policial || '',
          policialId: to.policialId,
          situacao: to.situacao || 'PM ESCALADO',
          auxiliar: to.auxiliar,
          obs: to.obs || '',
        });
      }
    } else {
      const fromSlotDef = slots.find((x) => x.slotId === fromSlotId);
      if (fromSlotDef) {
        upsertBySlot(fromSlotDef, { policial: '', policialId: undefined, situacao: 'PM ESCALADO', auxiliar: null, obs: '' });
      }
    }
  }

  function onDropOnSlot(e: React.DragEvent, slot: SlotDef) {
    e.preventDefault();
    const payload = getDragPayload(e);
    if (!payload) return;

    if (payload.kind === 'policial') {
      const p = (policiais || []).find((x: any) => x.id === payload.policialId);
      if (!p) return;

      // Verificação de duplicidade
      const alreadyEscalated = rows.find(r => r.dataISO === dataISO && (r.policialId === p.id || r.auxiliar?.policialId === p.id));
      if (alreadyEscalated) {
        alert(`Este policial já está escalado em outro slot: ${alreadyEscalated.area} - ${alreadyEscalated.funcao}`);
        return;
      }

      // se policial estiver inativo no dia, predefine a situação como AFASTAMENTO (ADM pode ajustar)
      const a = findAfast(p.matricula, dataISO);
      const situacao: SituacaoCadastro = a
        ? (a.status?.toUpperCase().includes('FÉRIAS')
            ? 'PM DE FÉRIAS'
            : a.status?.toUpperCase().includes('LICEN')
            ? 'PM DE LICENÇA ESPECIAL'
            : 'PM DE ATESTADO')
        : 'PM ESCALADO';

      upsertBySlot(slot, {
        policial: p.nome,
        policialId: p.id,
        situacao,
      });
      return;
    }

    if (payload.kind === 'auxiliar') {
      if (slot.area === 'CPU') {
        alert('Exceção: CPU geralmente não recebe auxiliar.');
      }
      upsertBySlot(slot, {
        auxiliar: { nome: '', situacao: 'PM ESCALADO' }
      });
      return;
    }

    if (payload.kind === 'team') {
      if (payload.teamKey.startsWith('__SLOT__:')) {
        const fromSlotId = payload.teamKey.replace('__SLOT__:', '');
        if (fromSlotId === slot.slotId) return;
        swapSlots(fromSlotId, slot);
        return;
      }
      applyTeamToSlot(payload.teamKey, slot);
      return;
    }
  }

  function selectSlot(slotId: string) {
    setSelectedSlotId(slotId);
  }

  // ---------- UI pools ----------
  const teamPool = useMemo(() => {
    const all = opTeams[pelotao] || [];
    // anti-duplicidade: se a equipe já foi aplicada no dia/pelotão, some da lista (e vai para "Aplicadas")
    if (section !== 'OPERACIONAL' || listMode !== 'EQUIPE') return all;
    return all.filter((t) => !usedTeamSet.has(t.key));
  }, [opTeams, pelotao, usedTeamSet, section, listMode]);

  // selectOptions para dropdown interno do slot (somente no modo individual)
  const selectOptions = useMemo(() => {
    return policePool.map((p: any) => ({
      id: p.id,
      nome: p.nome,
      matricula: p.matricula,
      inactive: p.__inactive,
      afast: p.__afast,
    }));
  }, [policePool]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black uppercase text-slate-900">Registrar Escala (ADM)</div>
            <div className="text-xs text-slate-600">
              Preencha por <b>Seções de Trabalho</b>. Na Operacional, selecione o <b>pelotão</b> e use <b>Individual</b> ou <b>Equipe</b> para arrastar para os slots.
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-black hover:bg-gray-50"
              onClick={() => autoFill()}
              type="button"
            >
              AUTO-PREENCHER
            </button>
            <button
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-black hover:bg-gray-50"
              onClick={() => duplicatePrevDay()}
              type="button"
            >
              DUPLICAR DIA ANTERIOR
            </button>
            <button
              className="px-3 py-2 rounded-lg border border-red-400 bg-white text-xs font-black text-red-700 hover:bg-red-50"
              onClick={() => clearScope()}
              type="button"
            >
              LIMPAR {section === 'OPERACIONAL' ? 'PELOTÃO' : 'SEÇÃO'}
            </button>
          </div>
        </div>

        {/* Linha: Abas + Data (alinhado) */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          {/* Abas */}
          <div className="flex items-center gap-1 flex-wrap border-b border-gray-200">
            {([
              { k: 'OPERACIONAL', label: 'ESCALA OPERACIONAL' },
              { k: 'ADJUNTOS_24X72', label: 'ESCALA ADJUNTOS' },
              { k: 'EXPEDIENTE', label: 'ESCALA EXPEDIENTE' },
              { k: 'DOZE_36', label: 'ESCALA 12X36' },
              { k: 'P2', label: 'ESCALA P2' },
            ] as const).map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setSection(t.k as any)}
                className={`px-3 py-2 -mb-px text-xs font-black rounded-t-lg border ${
                  section === t.k ? 'bg-white border-gray-200 border-b-white text-slate-900' : 'bg-slate-50 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Data */}
          <div className="flex items-end gap-2">
            <div className="min-w-[220px]">
              <div className="text-[10px] font-black text-slate-700 uppercase mb-1">Data</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDataISO(shiftISODate(dataISO, -1))}
                  className="h-10 w-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                  title="Dia anterior"
                >
                  <span className="material-icons-round text-base">chevron_left</span>
                </button>
                <input
                  type="date"
                  value={dataISO}
                  onChange={(e) => setDataISO(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white h-10"
                />
                <button
                  type="button"
                  onClick={() => setDataISO(shiftISODate(dataISO, 1))}
                  className="h-10 w-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                  title="Próximo dia"
                >
                  <span className="material-icons-round text-base">chevron_right</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDataISO(todayISO())}
                  className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs font-black hover:bg-gray-50"
                >
                  Hoje
                </button>
              </div>
              {section === 'OPERACIONAL' && (
                <div className="mt-1 text-[10px] text-slate-600 font-bold">
                  Dia do pelotão: <span className="text-slate-900">{pelotao}</span>
                </div>
              )}
            </div>
          </div>
        </div>
{/* Corpo */}
        <div className="grid grid-cols-12 gap-4">
          {/* Coluna esquerda: Pool */}
          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-4 h-fit">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              {section === 'OPERACIONAL' ? (
                <>
                  <div className="flex items-end gap-2 flex-wrap">
                    <div className="min-w-[180px] flex-1">
                      <div className="text-[10px] font-black text-slate-700 uppercase mb-1">Pelotão</div>
                      <select
                        value={pelotao}
                        onChange={(e) => handlePelotaoChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                      >
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.sigla})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 min-w-[160px]">
                      <div className="text-[10px] font-black text-slate-700 uppercase mb-1">Busca</div>
                      <div className="relative">
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="nome ou RG..."
                          className="w-full rounded-lg border border-gray-300 pl-3 pr-8 py-2 text-sm bg-white"
                        />
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <span className="material-icons-round text-sm">cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabs: Individual | Equipe | Auxiliar */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setListMode('INDIVIDUAL')}
                      className={`px-3 py-2 rounded-lg text-xs font-black border ${listMode === 'INDIVIDUAL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setListMode('EQUIPE')}
                      className={`px-3 py-2 rounded-lg text-xs font-black border ${listMode === 'EQUIPE' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                    >
                      Equipe (padrão)
                    </button>
                    <div
                      draggable
                      onDragStart={(e) => setDragPayload(e, { kind: 'auxiliar' })}
                      className="px-3 py-2 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50 text-xs font-black text-indigo-700 cursor-grab active:cursor-grabbing flex items-center gap-2"
                    >
                      <span className="material-icons-round text-sm">add_circle</span>
                      Auxiliar (Arraste)
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600">
                    {listMode === 'INDIVIDUAL' ? (
                      <>Arraste um <b>policial</b> para um slot. Policiais <b>INATIVOS</b> aparecem no final.</>
                    ) : (
                      <>Arraste uma <b>equipe</b> para preencher automaticamente os slots daquela área (CMT/MOT/AUX/OBS conforme o padrão).</>
                    )}
                  </div>

                  {/* Filtros rápidos + contadores */}
                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-[11px] text-slate-700">
                      <b>{poolCounts.disponiveis}</b> disponíveis · <b>{poolCounts.jaEscalados}</b> já escalados · <b>{poolCounts.inativos}</b> inativos
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPoolFilter('TODOS')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black border ${poolFilter === 'TODOS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoolFilter('DISPONIVEIS')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black border ${poolFilter === 'DISPONIVEIS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                      >
                        Apenas disponíveis
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoolFilter('INATIVOS')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black border ${poolFilter === 'INATIVOS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                      >
                        Inativos
                      </button>
                    </div>
                  </div>


                  <div className="mt-2 max-h-[520px] overflow-auto pr-1 space-y-2">
                    {listMode === 'INDIVIDUAL' ? (
                      policePool.length === 0 ? (
                        <div className="text-sm text-slate-600">Nenhum policial no pelotão.</div>
                      ) : (
                        policePool.map((p: any) => {
                          const a = p.__afast;
                          const inactive = !!p.__inactive;
                          return (
                            <div
                              key={p.id}
                              draggable
                              onDragStart={(e) => onDragStartPool(e, p)}
                              className={`rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing select-none
                                ${inactive ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}
                              `}
                              title={inactive ? `INATIVO: ${a?.status} (${a?.inicio} → ${a?.retorno})` : 'ATIVO'}
                            >
                              <div className="text-xs font-black text-slate-800">{p.nome}</div>
                              <div className="text-[11px] text-slate-600">
                                RG {p.matricula}{' '}
                                <span className={`ml-2 font-black ${inactive ? 'text-amber-700' : 'text-green-700'}`}>
                                  {inactive ? 'INATIVO' : 'ATIVO'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            const name = prompt('Nome da nova equipe:');
                            if (!name) return;
                            const area = prompt('Área (ex: ÁREA I):');
                            if (!area) return;
                            const newTeam = {
                              key: 'T' + Date.now(),
                              label: name,
                              area: area,
                              members: [
                                { funcao: 'CMT', policial: '' },
                                { funcao: 'MOT', policial: '' }
                              ]
                            };
                            setOpTeams(prev => ({
                              ...prev,
                              [pelotao]: [...(prev[pelotao] || []), newTeam]
                            }));
                          }}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-black text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition"
                        >
                          + CADASTRAR NOVA EQUIPE
                        </button>
                        {teamPool.map((t, tIdx) => (
                          <div
                            key={t.key}
                            draggable
                            onDragStart={(e) => onDragStartTeam(e, t.key)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 cursor-grab active:cursor-grabbing select-none group relative"
                            title="Arraste para preencher a área padrão da equipe"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-black text-slate-800">{t.label}</div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newLabel = prompt('Novo nome da equipe:', t.label);
                                    if (newLabel) {
                                      setOpTeams(prev => ({
                                        ...prev,
                                        [pelotao]: prev[pelotao].map(x => x.key === t.key ? { ...x, label: newLabel } : x)
                                      }));
                                    }
                                  }}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                >
                                  <span className="material-icons-round text-[14px]">edit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Excluir esta equipe?')) {
                                      setOpTeams(prev => ({
                                        ...prev,
                                        [pelotao]: prev[pelotao].filter(x => x.key !== t.key)
                                      }));
                                    }
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <span className="material-icons-round text-[14px]">delete</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Área: <b>{t.area}</b>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 space-y-1">
                              {t.members.map((m: any, i: number) => (
                                <div key={i} className="flex items-center gap-1">
                                  <b className="w-8">{m.funcao}:</b>
                                  <input
                                    type="text"
                                    value={m.policial || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setOpTeams(prev => ({
                                        ...prev,
                                        [pelotao]: prev[pelotao].map(x => x.key === t.key ? {
                                          ...x,
                                          members: x.members.map((mm, ii) => ii === i ? { ...mm, policial: val } : mm)
                                        } : x)
                                      }));
                                    }}
                                    className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none px-1"
                                    placeholder="Nome do PM..."
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              ))}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const func = prompt('Nova função (ex: AUX):');
                                  if (func) {
                                    setOpTeams(prev => ({
                                      ...prev,
                                      [pelotao]: prev[pelotao].map(x => x.key === t.key ? {
                                        ...x,
                                        members: [...x.members, { funcao: func.toUpperCase(), policial: '' }]
                                      } : x)
                                    }));
                                  }
                                }}
                                className="text-[9px] text-indigo-600 font-bold hover:underline"
                              >
                                + ADICIONAR COMPONENTE
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  
                  {section === 'OPERACIONAL' && listMode === 'EQUIPE' && (usedTeams[teamScopeKey] || []).length > 0 && (
                    <div className="mt-3 p-2 rounded-lg border border-gray-200 bg-slate-50">
                      <div className="text-[10px] font-black uppercase text-slate-700 mb-1">Equipes aplicadas (anti-duplicidade)</div>
                      <div className="space-y-1">
                        {(usedTeams[teamScopeKey] || []).map((k) => {
                          const t = (opTeams[pelotao] || []).find((x) => x.key === k);
                          return (
                            <div key={k} className="flex items-center justify-between gap-2 text-[11px]">
                              <div className="font-bold text-slate-800">{t?.label || k}</div>
                              <button
                                type="button"
                                onClick={() => undoTeam(k)}
                                className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-[10px] font-black hover:bg-gray-50"
                              >
                                DESFAZER
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-600">
                        Dica: desfazer limpa a área e devolve a equipe para a lista.
                      </div>
                    </div>
                  )}

</div>
                </>
              ) : section === 'ADJUNTOS_24X72' ? (
                <>
                  <div className="text-xs font-black uppercase text-slate-800 mb-2">Lista (referência)</div>
                  <div className="text-[11px] text-slate-600 mb-3">
                    Lista de adjuntos para controle e remanejamento.
                  </div>
                  <div className="space-y-2">
                    {[
                      { nome: '1º SGT MACHADO', rg: '27.122', pel: 'A' },
                      { nome: '3º SGT MORENO', rg: '31.600', pel: 'B' },
                      { nome: '3º SGT MONTEIRO', rg: '27.310', pel: 'C' },
                      { nome: 'SD COIMBRA', rg: '39.780', pel: 'D' },
                    ].map((adj, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 select-none"
                      >
                        <div className="text-xs font-black text-slate-800">{adj.nome}</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                          PELOTÃO {adj.pel} | RG {adj.rg}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : section === 'P2' ? (
                <>
                  <div className="text-xs font-black uppercase text-slate-800 mb-2">Lista (referência)</div>
                  <div className="text-[11px] text-slate-600 mb-3">
                    Lista de policiais que compõem o serviço de inteligência.
                  </div>
                  <div className="space-y-2">
                    {[
                      { nome: '1º SGT LÚCIO', rg: '28493' },
                      { nome: '2º SGT EDER', rg: '33.150' },
                      { nome: '3º SGT SANDER', rg: '35.534' },
                      { nome: 'CB PASSOS', rg: '38.183' },
                      { nome: 'CB WARTELOO', rg: '37.190' },
                      { nome: 'CB SENA', rg: '36.713' },
                      { nome: 'CB MENDES', rg: '37.829' },
                      { nome: '3º SGT NETTO', rg: '34.686' },
                      { nome: 'CB PADILHA', rg: '37.932' },
                    ].map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 select-none"
                      >
                        <div className="text-xs font-black text-slate-800">{p.nome}</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                          RG {p.rg}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : section === 'DOZE_36' ? (
                <>
                  <div className="text-xs font-black uppercase text-slate-800 mb-2">Lista (referência)</div>
                  <div className="text-[11px] text-slate-600 mb-3">
                    Lista de policiais da escala 12x36.
                  </div>
                  <div className="space-y-2">
                    {[
                      { nome: '1º TEN KLEBER', rg: '28905' },
                      { nome: '3º SGT WALACE', rg: '34208' },
                      { nome: '1º SGT JHONATAN', rg: '31853' },
                      { nome: '2º SGT LEUCIONE', rg: '30.245' },
                    ].map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 select-none"
                      >
                        <div className="text-xs font-black text-slate-800">{p.nome}</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                          RG {p.rg}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-black uppercase text-slate-800 mb-2">Lista (referência)</div>

                  {section === 'EXPEDIENTE' ? (
                    <>
                      <div className="flex items-end gap-2 flex-wrap">
                        <div className="flex-1 min-w-[160px]">
                          <div className="text-[10px] font-black text-slate-700 uppercase mb-1">Busca</div>
                          <div className="relative">
                            <input
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="nome ou RG..."
                              className="w-full rounded-lg border border-gray-300 pl-3 pr-8 py-2 text-sm bg-white"
                            />
                            {search && (
                              <button
                                onClick={() => setSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                type="button"
                              >
                                <span className="material-icons-round text-sm">cancel</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contadores + Filtros */}
                      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                        <div className="text-[11px] text-slate-700">
                          <b>{poolCounts.disponiveis}</b> disponíveis · <b>{poolCounts.jaEscalados}</b> já escalados · <b>{poolCounts.inativos}</b> inativos
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPoolFilter('TODOS')}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black border ${poolFilter === 'TODOS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                          >
                            Todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setPoolFilter('DISPONIVEIS')}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black border ${poolFilter === 'DISPONIVEIS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                          >
                            Apenas disponíveis
                          </button>
                          <button
                            type="button"
                            onClick={() => setPoolFilter('INATIVOS')}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black border ${poolFilter === 'INATIVOS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
                          >
                            Inativos
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 max-h-[520px] overflow-auto pr-1 space-y-2">
                        {policePool.length === 0 ? (
                          <div className="text-sm text-slate-600">Nenhum policial encontrado para esta seção.</div>
                        ) : (
                          policePool.map((p: any) => {
                            const a = p.__afast;
                            const inactive = !!p.__inactive;
                            const already = !!p.__already;
                            return (
                              <div
                                key={p.id}
                                draggable={!already}
                                onDragStart={(e) => !already && onDragStartPool(e, p)}
                                className={`rounded-xl border px-3 py-2 cursor-${already ? 'not-allowed' : 'grab'} active:cursor-grabbing ${
                                  inactive ? 'border-red-200 bg-red-50/40' : already ? 'border-slate-200 bg-slate-50/60 opacity-60' : 'border-gray-200 bg-white'
                                }`}
                                title={already ? 'Já escalado nesta data/seção' : 'Arraste para um slot'}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-xs font-black uppercase text-slate-800">{p.nome}</div>
                                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                                      RG {p.matricula || p.rg || '-'}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {inactive ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">INATIVO</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-600 text-white">ATIVO</span>
                                    )}
                                    {already && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-700 text-white">JÁ ESCALADO</span>
                                    )}
                                  </div>
                                </div>
                                {inactive && a && (
                                  <div className="mt-1 text-[10px] text-red-700 font-bold">
                                    {String(a.status || '').toUpperCase()} · {a.inicio} → {a.retorno}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600">
                        Dica: Policiais <b>já escalados</b> aparecem marcados e não podem ser arrastados novamente (evita duplicidade).
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-600">
                      Para esta seção, o cadastro é <b>individual</b>. Use <b>Auto-preencher</b> para manter o padrão e ajuste quando necessário.
                    </div>
                  )}
                </>
              )}

              {section === 'OPERACIONAL' && validation && (
                <div className="mt-4 p-2 rounded-lg border border-gray-200 bg-slate-50">
                  <div className="text-[10px] font-black uppercase text-slate-700 mb-1">Validação inteligente</div>
                  <div className="space-y-1">
                    {validation.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-black ${
                          it.kind === 'ok' ? 'bg-green-600 text-white' : it.kind === 'warn' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {it.kind === 'ok' ? '✓' : it.kind === 'warn' ? '!' : '×'}
                        </span>
                        <span className="text-slate-800">{it.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita: Slots */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-xs font-black uppercase text-slate-800">
                  {section === 'OPERACIONAL'
                    ? `Slots do PELOTÃO ${pelotao} — ${dataISO}`
                    : `Slots — ${dataISO}`}
                </div>
                <div className="text-[11px] text-slate-600">
                  Dica: arraste para preencher / trocar rapidamente.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slots.map((s) => {
                  const r = slotMap[s.slotId];
                  const isSelected = selectedSlotId === s.slotId;
                  const tone = slotTone(r?.situacao);
                  const isFullWidth = (section === 'P2' && s.funcao === 'ANÁLISE') || (section === 'ADJUNTOS_24X72');

                  return (
                    <div
                      key={s.slotId}
                      onClick={() => selectSlot(s.slotId)}
                      onDragOver={prevent}
                      onDrop={(e) => onDropOnSlot(e, s)}
                      className={`rounded-xl border p-3 transition
                        ${isSelected ? 'ring-2 ring-green-200 border-green-700' : 'border-gray-200'}
                        ${r ? tone.wrap : ''}
                        ${isFullWidth ? 'md:col-span-2' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="text-xs font-black uppercase text-slate-800">{s.title}</div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black ${tone.badge}`}>
                          {r?.situacao || '—'}
                        </span>
                      </div>

                      {/* Conteúdo do slot */}
                      {!r?.policial && !r?.situacao && !r?.auxiliar ? (
                        <div className="text-sm text-slate-500">Solte aqui</div>
                      ) : (
                        <div className="space-y-2">
                          {/* Titular (CMT/MOT) */}
                          {(r?.policial || r?.situacao) && (
                            <div
                              draggable
                              onDragStart={(e) => onDragStartSlot(e, s.slotId)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 cursor-grab active:cursor-grabbing"
                              title="Arraste para trocar de slot"
                            >
                              {shouldShowNameInSlot(r?.situacao) ? (
                                <div className="text-xs font-black text-slate-800">{r?.policial || '—'}</div>
                              ) : (
                                <div className="text-xs font-black text-slate-800">{r?.situacao}</div>
                              )}

                              {!shouldShowNameInSlot(r?.situacao) && r?.policial ? (
                                <div className="text-[11px] text-slate-600 mt-1">
                                  Policial (referência): <b>{r.policial}</b>
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-600">
                                  Situação: <b>{r?.situacao || 'PM ESCALADO'}</b>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Auxiliar */}
                          {r?.auxiliar && (
                            <div
                              onDragOver={prevent}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const payload = getDragPayload(e);
                                if (payload?.kind === 'policial') {
                                  const p = (policiais || []).find((x: any) => x.id === payload.policialId);
                                  if (!p) return;

                                  // Verificação de duplicidade
                                  const alreadyEscalated = rows.find(r => r.dataISO === dataISO && (r.policialId === p.id || r.auxiliar?.policialId === p.id));
                                  if (alreadyEscalated) {
                                    alert(`Este policial já está escalado em outro slot: ${alreadyEscalated.area} - ${alreadyEscalated.funcao}`);
                                    return;
                                  }

                                  upsertBySlot(s, {
                                    auxiliar: { ...r.auxiliar, policialId: p.id, nome: p.nome }
                                  });
                                }
                              }}
                              className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 px-3 py-2 relative group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[10px] font-black text-indigo-700 uppercase">Auxiliar</div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    upsertBySlot(s, { auxiliar: null });
                                  }}
                                  className="text-indigo-400 hover:text-red-500"
                                >
                                  <span className="material-icons-round text-sm">cancel</span>
                                </button>
                              </div>
                              {r.auxiliar.nome ? (
                                <div className="text-xs font-bold text-slate-800">{r.auxiliar.nome}</div>
                              ) : (
                                <div className="text-[11px] text-indigo-400 italic">Arraste um policial aqui</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Controles rápidos (dropdown) */}
                      <div className="mt-3 grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-7">
                          <div className="text-[10px] font-black text-slate-700 uppercase mb-1">Policial</div>
                          <select
                            value={String(r?.policialId || '')}
                            onChange={(e) => {
                              const id = parseInt(e.target.value, 10);
                              const p = selectOptions.find((x: any) => x.id === id);
                              if (!p) return;

                              const a = p.afast;
                              const situacao: SituacaoCadastro = a
                                ? (a.status?.toUpperCase().includes('FÉRIAS')
                                    ? 'PM DE FÉRIAS'
                                    : a.status?.toUpperCase().includes('LICEN')
                                    ? 'PM DE LICENÇA ESPECIAL'
                                    : 'PM DE ATESTADO')
                                : (r?.situacao || 'PM ESCALADO');

                              upsertBySlot(s, {
                                policial: p.nome,
                                policialId: p.id,
                                situacao,
                              });
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                            disabled={section === 'OPERACIONAL' && listMode === 'EQUIPE'} // em modo equipe, prioriza drag-and-drop
                          >
                            <option value="">Selecione...</option>
                            {selectOptions.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.nome} — RG {p.matricula} {p.inactive ? '• INATIVO' : '• ATIVO'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-5">
                          <div className="text-[10px] font-black text-slate-700 uppercase mb-1">Situação</div>
                          <select
                            value={r?.situacao || 'PM ESCALADO'}
                            onChange={(e) => {
                              const situacao = e.target.value as SituacaoCadastro;
                              // regra: quando não escalado, não poluir leitura: mantém nome em referência mas "slot" passa a ser só situação
                              upsertBySlot(s, {
                                situacao,
                              });
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                          >
                            <option value="PM ESCALADO">PM ESCALADO</option>
                            <option value="PM DISPENSADO">PM DISPENSADO</option>
                            <option value="PM DE FÉRIAS">PM DE FÉRIAS</option>
                            <option value="PM DE ATESTADO">PM DE ATESTADO</option>
                            <option value="PM DE LICENÇA ESPECIAL">PM DE LICENÇA ESPECIAL</option>
                          </select>
                        </div>

                        <div className="col-span-12 flex justify-end">
                          <button
                            type="button"
                            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-black hover:bg-gray-50"
                            onClick={() => upsertBySlot(s, { policial: '', policialId: undefined, situacao: 'PM ESCALADO', obs: '' })}
                          >
                            Remover
                          </button>
                        </div>
                      </div>

                      {/* Nota operacional importante */}
                      {section === 'OPERACIONAL' && r?.situacao && r.situacao !== 'PM ESCALADO' ? (
                        <div className="mt-2 text-[11px] text-slate-600">
                          Regra: quando um PM está <b>dispensado/afastado</b>, o <b>parceiro</b> pode compor outra equipe como <b>AUXILIAR</b> (ajuste por drag-and-drop).
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-[11px] text-slate-600">
                Próximo passo: conectar estes registros ao layout da <b>Escala Digital</b> para preencher automaticamente as células (sem alterar a estrutura visual).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabsShell() {
  const [tab, setTab] = useState<'REGISTRAR' | 'ESCALA_DIGITAL'>('REGISTRAR');

  return (
    <div className="p-4 min-h-screen bg-gray-200 font-sans">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-col">
            <div className="text-base font-black uppercase text-slate-800">Escala Ordinária</div>
            <div className="text-xs text-slate-600">Painel ADM — Registrar | Escala Digital</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('REGISTRAR')}
              className={`rounded-xl px-4 py-2 text-sm font-black uppercase border
                ${tab === 'REGISTRAR' ? 'bg-green-700 text-white border-green-800' : 'bg-white text-slate-800 border-gray-300'}
              `}
            >
              Registrar
            </button>
            <button
              onClick={() => setTab('ESCALA_DIGITAL')}
              className={`rounded-xl px-4 py-2 text-sm font-black uppercase border
                ${tab === 'ESCALA_DIGITAL' ? 'bg-green-700 text-white border-green-800' : 'bg-white text-slate-800 border-gray-300'}
              `}
            >
              Escala Digital
            </button>
          </div>
        </div>

        {tab === 'REGISTRAR' ? <RegistrarTab /> : <EscalaDigital />}
      </div>
    </div>
  );
}

// Componente exportado (mantém rota/integração existente)
const EscalaOrdinaria = () => <TabsShell />;


export default EscalaOrdinaria;
