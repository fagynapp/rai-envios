import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  Login, 
  Register, 
  AdminLogin, // Nova Importação
  UserDashboard, 
  RegisterRAI, 
  UserHistory, 
  UserCalendar,
  UserTelefones,
  AdminDashboard,
  AdminDispensas,
  AdminEscala,
  AdminAuditoria,
  AdminNatureza,
  AdminLiberacoes,
  AdminGestaoPoliciais,
  AdminAlmanaque,
  AdminRanking,
  AdminBancoDados,
  AdminConfiguracoes,
  AdminEscalaDashboard, // Nova Importação
  AdminEscalaGestaoPoliciais, // Nova Importação
  EscalaOrdinaria, // Nova Importação
  EscalaVirtual, // Nova Importação
  TILogin,
  TIDashboard
} from './pages';
import { PoliceProvider, usePoliceData } from './contexts/PoliceContext';

// --- Components ---

const SidebarItem = ({ icon, label, to, active, onClick, collapsed }: { icon: string; label: string; to: string; active?: boolean; onClick?: () => void; collapsed?: boolean }) => (
  <Link
    to={to}
    onClick={onClick}
    title={collapsed ? label : ''} 
    className={`flex items-center gap-3 py-3 font-medium rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    } ${collapsed ? 'justify-center px-2' : 'px-4'}`}
  >
    <span className="material-icons-round text-[20px]">{icon}</span>
    <span className={`whitespace-nowrap transition-all duration-200 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
      {label}
    </span>
  </Link>
);

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false); 
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside 
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 flex flex-col transform transition-all duration-300 ease-in-out 
        lg:translate-x-0 lg:static lg:inset-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        <div className={`p-6 flex items-center ${isDesktopCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${isDesktopCollapsed ? 'hidden' : 'flex'}`}>
            <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0">
              <span className="material-icons-round text-xl">shield</span>
            </div>
            <div className="whitespace-nowrap">
              <h1 className="font-bold text-slate-900 leading-tight">RAI ENVIOS</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BPM Terminal</p>
            </div>
          </div>
          {isDesktopCollapsed && (
             <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0 mb-2">
                <span className="material-icons-round text-xl">shield</span>
             </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
          <button 
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className={`hidden lg:flex p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ${isDesktopCollapsed ? 'absolute top-6' : ''}`}
            title={isDesktopCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            <span className="material-icons-round">{isDesktopCollapsed ? 'menu' : 'close'}</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-4 overflow-x-hidden">
          <SidebarItem collapsed={isDesktopCollapsed} icon="grid_view" label="Painel Geral" to="/admin/dashboard" active={isActive('/admin/dashboard')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="event_busy" label="Dispensas" to="/admin/dispensas" active={isActive('/admin/dispensas')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="calendar_month" label="Escala & Calendário" to="/admin/escala" active={isActive('/admin/escala')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="verified_user" label="Auditoria Produtividade" to="/admin/auditoria" active={isActive('/admin/auditoria')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="description" label="Registrar Natureza" to="/admin/natureza" active={isActive('/admin/natureza')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="lock_open" label="Liberações" to="/admin/liberacoes" active={isActive('/admin/liberacoes')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="groups" label="Gestão de Policiais" to="/admin/policiais" active={isActive('/admin/policiais')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="menu_book" label="Almanaque" to="/admin/almanaque" active={isActive('/admin/almanaque')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="military_tech" label="Ranking Resultados" to="/admin/ranking" active={isActive('/admin/ranking')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="storage" label="Banco de Dados" to="/admin/db" active={isActive('/admin/db')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="settings" label="Configurações" to="/admin/config" active={isActive('/admin/config')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link 
            to="/" 
            className={`flex items-center gap-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isDesktopCollapsed ? 'justify-center px-2' : 'px-4'}`}
            title={isDesktopCollapsed ? "Sair" : ""}
          >
            <span className="material-icons-round">logout</span>
            {!isDesktopCollapsed && <span>Sair</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all ${isSidebarOpen ? 'lg:hidden' : 'block'}`}
            >
              <span className="material-icons-round">menu</span>
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              Gestão Operacional (Admin)
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">Maj. Anderson Silva</p>
              <p className="text-[10px] text-slate-500 uppercase">Comandante</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-xs">AS</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// --- Novo Layout para Admin Escala ---
const AdminEscalaLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isActive = (path: string) => location.pathname === path;

  // Componente de botão customizado para Escala (Tema Indigo)
  const SidebarEscalaItem = ({ icon, label, to, active, onClick }: { icon: string; label: string; to: string; active?: boolean; onClick?: () => void }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 py-3 px-4 font-medium rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className="material-icons-round text-[20px]">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside 
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 flex flex-col transform transition-all duration-300 ease-in-out 
        lg:translate-x-0 lg:static lg:inset-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shrink-0">
              <span className="material-icons-round text-xl">calendar_month</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">RAI ENVIOS</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Admin Escala</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-full hover:bg-slate-100"><span className="material-icons-round">close</span></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-4">
          <SidebarEscalaItem icon="dashboard" label="Dashboard" to="/adminescala/dashboard" active={isActive('/adminescala/dashboard')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarEscalaItem icon="groups" label="Gestão de Policiais" to="/adminescala/policiais" active={isActive('/adminescala/policiais')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarEscalaItem icon="edit_calendar" label="Escala Ordinário" to="/adminescala/escala-ordinaria" active={isActive('/adminescala/escala-ordinaria')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarEscalaItem icon="devices" label="Escala Virtual" to="/adminescala/escala-virtual" active={isActive('/adminescala/escala-virtual')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link to="/" className="flex items-center gap-3 py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <span className="material-icons-round">logout</span>
            <span>Sair</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden`}><span className="material-icons-round">menu</span></button>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">Gestão de Escalas</div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-600 text-xs">AE</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const UserLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const isActive = (path: string) => location.pathname === path;
  const { userPoints } = usePoliceData();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside 
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 flex flex-col transform transition-all duration-300 ease-in-out 
        lg:translate-x-0 lg:static lg:inset-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        <div className={`p-6 flex items-center ${isDesktopCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${isDesktopCollapsed ? 'hidden' : 'flex'}`}>
            <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0">
              <span className="material-icons-round text-xl">verified_user</span>
            </div>
            <div className="whitespace-nowrap">
              <h1 className="font-bold text-slate-900 leading-tight">RAI ENVIOS</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operacional</p>
            </div>
          </div>
          {isDesktopCollapsed && (
             <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0 mb-2">
                <span className="material-icons-round text-xl">verified_user</span>
             </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
          <button 
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className={`hidden lg:flex p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ${isDesktopCollapsed ? 'absolute top-6' : ''}`}
            title={isDesktopCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            <span className="material-icons-round">{isDesktopCollapsed ? 'menu' : 'close'}</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-4 overflow-x-hidden">
          {!isDesktopCollapsed && (
            <div className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap transition-opacity">
              Operacional
            </div>
          )}
          <SidebarItem collapsed={isDesktopCollapsed} icon="grid_view" label="Dashboard" to="/user/dashboard" active={isActive('/user/dashboard')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="calendar_month" label="Calendário" to="/user/calendario" active={isActive('/user/calendario')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="description" label="Registrar RAI" to="/user/registro" active={isActive('/user/registro')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="history" label="Meu Histórico" to="/user/historico" active={isActive('/user/historico')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <SidebarItem collapsed={isDesktopCollapsed} icon="phone" label="Telefones" to="/user/telefones" active={isActive('/user/telefones')} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link 
            to="/" 
            className={`flex items-center gap-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isDesktopCollapsed ? 'justify-center px-2' : 'px-4'}`}
            title={isDesktopCollapsed ? "Sair" : ""}
          >
            <span className="material-icons-round">logout</span>
            {!isDesktopCollapsed && <span>Sair</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all ${isSidebarOpen ? 'lg:hidden' : 'block'}`}
            >
              <span className="material-icons-round">menu</span>
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span className="hidden sm:inline">Terminal BPM - Operacional</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Atual</p>
              <p className="text-lg font-bold text-blue-600 leading-none">{userPoints} <span className="text-xs">PTS</span></p>
            </div>
            <button className="relative p-1 rounded-full hover:bg-slate-50">
              <span className="material-icons-round text-slate-400">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <PoliceProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} /> {/* Rota Nova */}
          <Route path="/ti-login" element={<TILogin />} />
          
          {/* Admin Operacional Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="dispensas" element={<AdminDispensas />} />
            <Route path="escala" element={<AdminEscala />} />
            <Route path="auditoria" element={<AdminAuditoria />} />
            <Route path="natureza" element={<AdminNatureza />} />
            <Route path="liberacoes" element={<AdminLiberacoes />} />
            <Route path="policiais" element={<AdminGestaoPoliciais />} />
            <Route path="almanaque" element={<AdminAlmanaque />} />
            <Route path="ranking" element={<AdminRanking />} />
            <Route path="db" element={<AdminBancoDados />} />
            <Route path="config" element={<AdminConfiguracoes />} />
          </Route>

          {/* Admin Escala Routes (Nova Seção) */}
          <Route path="/adminescala" element={<AdminEscalaLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminEscalaDashboard />} />
            <Route path="policiais" element={<AdminEscalaGestaoPoliciais />} />
            <Route path="escala-ordinaria" element={<EscalaOrdinaria />} />
            <Route path="escala-virtual" element={<EscalaVirtual />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="calendario" element={<UserCalendar />} />
            <Route path="registro" element={<RegisterRAI />} />
            <Route path="historico" element={<UserHistory />} />
            <Route path="telefones" element={<UserTelefones />} />
          </Route>

          {/* TI Routes */}
          <Route path="/ti" element={<Outlet />}>
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="dashboard" element={<TIDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </PoliceProvider>
  );
};

export default App;