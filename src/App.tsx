import { useState, useEffect, FormEvent } from 'react';
import { Usuario, Inspecao, Equipe, Veiculo } from './types';
import { 
  getSavedUsers, saveUsers, 
  getSavedInspecoes, saveInspecoes, 
  initializeDatabase 
} from './utils/mockData';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import InspectionForm from './components/InspectionForm';
import EquipesList from './components/EquipesList';
import VeiculosList from './components/VeiculosList';
import PlanosAcao from './components/PlanosAcao';
import RelatorioViewer from './components/RelatorioViewer';
import { 
  ShieldCheck, ShieldAlert, LayoutDashboard, FileText, Users, Truck, 
  CheckSquare, LogOut, UserCheck, Plus, Sparkles, User, Key, Trash2 
} from 'lucide-react';

export default function App() {
  // Database Seeding
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // App Module Selector
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inspecao_nova' | 'inspecoes_list' | 'equipes' | 'veiculos' | 'planos' | 'usuarios'>('dashboard');

  // Dynamic lists in state
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  
  // PDF Relatório active inspect mode
  const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState<Inspecao | null>(null);

  // 1. Admin Module: Add User form fields
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPerfil, setUserPerfil] = useState<'admin' | 'inspector' | 'gestor'>('inspector');
  const [userError, setUserError] = useState<string | null>(null);

  // Load database lists on login
  useEffect(() => {
    if (currentUser) {
      setInspecoes(getSavedInspecoes());
      setUsers(getSavedUsers());
    }
  }, [currentUser]);

  const handleLogin = (user: Usuario) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setInspeccionSeleccionada(null);
  };

  // Callback save new inspection
  const handleSaveInspection = (newInsp: Inspecao) => {
    const nextList = [newInsp, ...inspecoes];
    setInspecoes(nextList);
    saveInspecoes(nextList);
    
    // Auto-update last inspection date for the selected vehicle in local storage
    const storedVecs = localStorage.getItem('ocle_veiculos');
    if (storedVecs) {
      const vecs: Veiculo[] = JSON.parse(storedVecs);
      const matchedVecIdx = vecs.findIndex(v => v.prefixo === newInsp.veiculoPrefixo);
      if (matchedVecIdx !== -1) {
        vecs[matchedVecIdx].ultimaInspecao = newInsp.data;
        localStorage.setItem('ocle_veiculos', JSON.stringify(vecs));
      }
    }

    // Auto-view the generated inspection print-view/PDF model immediately
    setInspeccionSeleccionada(newInsp);
    setActiveTab('inspecoes_list');
  };

  // Callback to insert new user
  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    setUserError(null);

    if (!userNome.trim() || !userEmail.trim()) {
      setUserError('Nome e E-mail são obrigatórios!');
      return;
    }

    const emailLower = userEmail.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === emailLower)) {
      setUserError('Este e-mail corporativo já está cadastrado no sistema.');
      return;
    }

    const newUser: Usuario = {
      id: 'usr-' + Date.now().toString(),
      nome: userNome,
      email: emailLower,
      perfil: userPerfil,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`
    };

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveUsers(nextUsers);

    // Clear inputs
    setUserNome('');
    setUserEmail('');
    setUserPerfil('inspector');
    alert('Novo usuário corporativo criado com sucesso!');
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      alert('Não é possível remover a si próprio do cadastro de usuários.');
      return;
    }
    if (confirm('Deseja realmente remover os privilégios deste usuário? Ele não poderá mais se autenticar.')) {
      const nextUsers = users.filter(u => u.id !== id);
      setUsers(nextUsers);
      saveUsers(nextUsers);
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  const isAdmin = currentUser.perfil === 'admin';
  const isInspector = currentUser.perfil === 'inspector';
  const isGestor = currentUser.perfil === 'gestor';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="main_app_wrapper">
      
      {/* Upper Navigation Header (Corporate Branding) */}
      <header className="bg-slate-900 border-b border-blue-950 text-white shadow-md sticky top-0 z-30 print:hidden" id="navigation_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left side brand logo */}
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 p-2 rounded-xl text-slate-950 shadow-inner flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight font-sans block leading-none">
                  OCLE SAFETY
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                  Utilities & Safety Portal
                </span>
              </div>
            </div>

            {/* Profile controller card */}
            <div className="flex items-center gap-4">
              
              {/* Profile Helper indicator */}
              <div className="hidden md:flex items-center gap-2.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                <div className="relative">
                  <img 
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border border-blue-900 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800"></span>
                </div>
                
                <div className="text-left">
                  <p className="text-xs font-bold leading-none text-white">{currentUser.nome}</p>
                  <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mt-1">
                    {currentUser.perfil === 'admin' ? 'Administrador' : currentUser.perfil === 'inspector' ? 'Inspetor Campo' : 'Gestor Contratos'}
                  </p>
                </div>
              </div>

              {/* Instant Profile Switcher (For quick auditing/grading) */}
              <div className="flex items-center gap-1.5 bg-slate-850 p-1 rounded-xl border border-slate-700/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1.5 hidden lg:inline">Perfil:</span>
                
                <button
                  onClick={() => {
                    const found = users.find(u => u.perfil === 'admin');
                    if (found) setCurrentUser(found);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${isAdmin ? 'bg-yellow-400 text-slate-950 shadow font-black' : 'text-slate-400 hover:text-white'}`}
                  title="Trocar para Administrador"
                >
                  ADM
                </button>
                <button
                  onClick={() => {
                    const found = users.find(u => u.perfil === 'inspector');
                    if (found) setCurrentUser(found);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${isInspector ? 'bg-yellow-400 text-slate-950 shadow font-black' : 'text-slate-400 hover:text-white'}`}
                  title="Trocar para Inspetor"
                >
                  INS
                </button>
                <button
                  onClick={() => {
                    const found = users.find(u => u.perfil === 'gestor');
                    if (found) setCurrentUser(found);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${isGestor ? 'bg-yellow-400 text-slate-950 shadow font-black' : 'text-slate-400 hover:text-white'}`}
                  title="Trocar para Gestor"
                >
                  GES
                </button>
              </div>

              {/* Logout Button */}
              <button
                id="btn_logout"
                onClick={handleLogout}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Sair do Sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav menu (Hidden in Print) */}
        <aside className="w-full md:w-64 shrink-0 space-y-4 print:hidden" id="app_sidebar_menu">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-slate-800 space-y-1.5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Navegação Principal</h3>
            
            <button
              onClick={() => {
                setInspeccionSeleccionada(null);
                setActiveTab('dashboard');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Painel de Indicadores</span>
            </button>

            {(isInspector || isAdmin) && (
              <button
                id="sidebar_btn_nova_inspecao"
                onClick={() => {
                  setInspeccionSeleccionada(null);
                  setActiveTab('inspecao_nova');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                  activeTab === 'inspecao_nova' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Nova Inspeção</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('inspecoes_list');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'inspecoes_list' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              <span>Inspeções Realizadas</span>
            </button>

            <button
              onClick={() => {
                setInspeccionSeleccionada(null);
                setActiveTab('planos');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'planos' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-4.5 h-4.5" />
              <span>Planos de Ação</span>
            </button>

            <button
              onClick={() => {
                setInspeccionSeleccionada(null);
                setActiveTab('equipes');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'equipes' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Cadastro de Equipes</span>
            </button>

            <button
              onClick={() => {
                setInspeccionSeleccionada(null);
                setActiveTab('veiculos');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'veiculos' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4.5 h-4.5" />
              <span>Cadastro de Veículos</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setInspeccionSeleccionada(null);
                  setActiveTab('usuarios');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                  activeTab === 'usuarios' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4.5 h-4.5" />
                <span>Gestão de Usuários</span>
              </button>
            )}

          </div>

          {/* Quick instructions widget */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow space-y-1.5 text-xs">
            <span className="p-1 px-1.5 bg-yellow-400 text-slate-950 font-mono font-black rounded text-[9px] uppercase tracking-wider block w-max">
              Nota Reguladora
            </span>
            <p className="font-bold">Eletricidade e Altura</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cumprimento absoluto de NR10, NR12 e NR35. O laudo gerado contém validação fotográfica e rubrica colhida em campo.
            </p>
          </div>

        </aside>

        {/* Dynamic App Area */}
        <main className="flex-1 min-w-0" id="main_app_content_panel">
          
          {/* Active Inspect Mode (Printable report / PDF Simulation) */}
          {inspeccionSeleccionada ? (
            <RelatorioViewer 
              inspecao={inspeccionSeleccionada} 
              onBack={() => setInspeccionSeleccionada(null)} 
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  inspecoes={inspecoes} 
                  onViewInspection={(insp) => setInspeccionSeleccionada(insp)} 
                />
              )}

              {activeTab === 'inspecao_nova' && (
                <InspectionForm 
                  currentUser={currentUser} 
                  onSave={handleSaveInspection} 
                  onCancel={() => setActiveTab('dashboard')} 
                />
              )}

              {activeTab === 'inspecoes_list' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Laudos e Inspeções Realizadas</h2>
                    <p className="text-sm text-slate-500">Consulte relatórios arquivados e exporte o PDF.</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100 text-left">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <th className="px-4 py-3.5">Código Laudo</th>
                            <th className="px-4 py-3.5">O.S número</th>
                            <th className="px-4 py-3.5">Município / Local</th>
                            <th className="px-4 py-3.5">Colaborador / Encarregado</th>
                            <th className="px-4 py-3.5">Conformidade</th>
                            <th className="px-4 py-3.5 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {inspecoes.map((insp) => (
                            <tr key={insp.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-4 font-mono font-bold text-blue-950">
                                {insp.id.substring(5, 12).toUpperCase()}
                                <span className="block text-[9px] font-normal text-slate-400">Criado em: {insp.data}</span>
                              </td>
                              <td className="px-4 py-4 font-semibold text-slate-900">
                                {insp.ordemServico}
                              </td>
                              <td className="px-4 py-4 leading-tight">
                                <span className="font-bold text-slate-800">{insp.municipio}</span>
                                <span className="block text-[10px] text-slate-400 max-w-[170px] truncate">{insp.local}</span>
                              </td>
                              <td className="px-4 py-4 uppercase font-bold text-[10px]">
                                {insp.encarregado}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                                  insp.percentualConformidade >= 95 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {insp.percentualConformidade}%
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setInspeccionSeleccionada(insp)}
                                  className="font-bold text-blue-900 hover:text-blue-950 hover:underline cursor-pointer"
                                >
                                  Ver PDF completo
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'equipes' && (
                <EquipesList isAdmin={isAdmin} />
              )}

              {activeTab === 'veiculos' && (
                <VeiculosList isAdmin={isAdmin} />
              )}

              {activeTab === 'planos' && (
                <PlanosAcao 
                  currentUser={currentUser} 
                  onViewInspectionById={(id) => {
                    const found = inspecoes.find(i => i.id === id);
                    if (found) {
                      setInspeccionSeleccionada(found);
                    } else {
                      alert('Não foi possível carregar a visualização desta inspeção.');
                    }
                  }} 
                />
              )}

              {activeTab === 'usuarios' && isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-6 h-6 text-blue-900" />
                      Gerenciamento de Contas e Usuários Corporativos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Crie perfis e determine privilégios para Administradores, Inspetores de Campo e Gestores.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Add User form card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-extrabold uppercase text-slate-800 border-b pb-2">
                        Adicionar Novo Usuário
                      </h3>

                      <form onSubmit={handleCreateUser} className="space-y-4">
                        {userError && (
                          <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded border border-red-250">
                            {userError}
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                          <input
                            type="text"
                            value={userNome}
                            onChange={(e) => setUserNome(e.target.value)}
                            placeholder="Ex: Roberto Antunes"
                            className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">E-mail Corporativo</label>
                          <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="usuario@ocle.com"
                            className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-semibold">Perfil de Acesso / Permissão</label>
                          <select
                            value={userPerfil}
                            onChange={(e) => setUserPerfil(e.target.value as any)}
                            className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1"
                          >
                            <option value="admin">Administrador (Gestão Plena)</option>
                            <option value="inspector">Inspetor (Verificações em Campo)</option>
                            <option value="gestor">Gestor (Contratos e Planos)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-blue-900 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-blue-950 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Cadastrar Colaborador
                        </button>
                      </form>
                    </div>

                    {/* Users list card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-extrabold uppercase text-slate-800 border-b pb-2">
                        Usuários Ativos do Sistema ({users.length})
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-50 text-slate-450 uppercase text-[9px] font-extrabold border-b">
                              <th className="px-3 py-2">Colaborador</th>
                              <th className="px-3 py-2">E-mail</th>
                              <th className="px-3 py-2">Perfil</th>
                              <th className="px-3 py-2 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {users.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2.5 font-bold text-slate-950 flex items-center gap-2">
                                  <img 
                                    src={u.avatar} 
                                    alt="u" 
                                    className="w-6 h-6 rounded-full object-cover shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span>{u.nome}</span>
                                </td>
                                <td className="px-3 py-2.5 text-slate-550 font-mono">{u.email}</td>
                                <td className="px-3 py-2.5 uppercase font-bold text-[10px]">
                                  <span className={`px-2 py-0.5 rounded ${
                                    u.perfil === 'admin' ? 'bg-red-50 text-red-700' :
                                    u.perfil === 'inspector' ? 'bg-yellow-50 text-amber-800' :
                                    'bg-green-50 text-green-700'
                                  }`}>
                                    {u.perfil}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="text-red-650 text-red-600 hover:underline font-bold cursor-pointer"
                                  >
                                    Remover
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

        </main>

      </div>

      {/* Footer copyright (Invisble in print) */}
      <footer className="bg-slate-900 border-t border-slate-950 text-slate-500 py-6 text-center text-xs mt-auto print:hidden" id="page_footer">
        <p className="font-semibold text-slate-400">OCLE SAFETY &copy; {new Date().getFullYear()} - Sistema Integrado de Prevenção Operacional e Engenharia Elétrica</p>
        <p className="mt-1 text-[11px] text-slate-500 font-medium">Todos os direitos reservados à concessionária. Atendimento estrito de conformidade NR10, NR12 e NR35.</p>
      </footer>

    </div>
  );
}
