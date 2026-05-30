import { useState, useMemo, FormEvent } from 'react';
import { Equipe } from '../types';
import { getSavedEquipes, saveEquipes } from '../utils/mockData';
import { Users, Plus, Edit2, Trash2, MapPin, Search, FileText, Check, X, ShieldAlert } from 'lucide-react';

interface EquipesListProps {
  isAdmin: boolean;
}

export default function EquipesList({ isAdmin }: EquipesListProps) {
  const [equipes, setEquipes] = useState<Equipe[]>(getSavedEquipes());
  const [search, setSearch] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [encarregado, setEncarregado] = useState('');
  const [colaboradoresCount, setColaboradoresCount] = useState(4);
  const [contrato, setContrato] = useState('');
  const [regiao, setRegiao] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered teams list based on search key
  const filteredEquipes = useMemo(() => {
    return equipes.filter(eq => 
      eq.nome.toLowerCase().includes(search.toLowerCase()) ||
      eq.encarregado.toLowerCase().includes(search.toLowerCase()) ||
      eq.contrato.toLowerCase().includes(search.toLowerCase()) ||
      eq.regiao.toLowerCase().includes(search.toLowerCase())
    );
  }, [equipes, search]);

  const handleOpenCreateForm = () => {
    setEditId(null);
    setNome('');
    setEncarregado('');
    setColaboradoresCount(4);
    setContrato('');
    setRegiao('');
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleOpenEditForm = (eq: Equipe) => {
    setEditId(eq.id);
    setNome(eq.nome);
    setEncarregado(eq.encarregado);
    setColaboradoresCount(eq.colaboradoresCount);
    setContrato(eq.contrato);
    setRegiao(eq.regiao);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !encarregado.trim() || !contrato.trim() || !regiao.trim()) {
      setErrorMessage('Todos os campos do formulário são de preenchimento obrigatório.');
      return;
    }

    let updatedList: Equipe[];

    if (editId) {
      // Editing
      updatedList = equipes.map(eq => eq.id === editId ? {
        ...eq,
        nome,
        encarregado,
        colaboradoresCount: Number(colaboradoresCount),
        contrato,
        regiao
      } : eq);
    } else {
      // Create new crew
      const newCrew: Equipe = {
        id: 'eq-' + Date.now().toString(),
        nome,
        encarregado,
        colaboradoresCount: Number(colaboradoresCount),
        contrato,
        regiao
      };
      updatedList = [...equipes, newCrew];
    }

    setEquipes(updatedList);
    saveEquipes(updatedList);
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja remover esta equipe do cadastro? Esta ação não pode ser desfeita.')) {
      const updatedList = equipes.filter(eq => eq.id !== id);
      setEquipes(updatedList);
      saveEquipes(updatedList);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-900" />
            Cadastro de Equipes Operacionais
          </h2>
          <p className="text-sm text-slate-500">
            Gerenciamento das turmas de construção, manutenção e podas de distribuição.
          </p>
        </div>

        {isAdmin && !isEditing && (
          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-955 hover:bg-blue-950 transition-colors cursor-pointer text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nova Equipe
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-950 border-b pb-2">
            {editId ? 'Editar Cadastro da Equipe' : 'Cadastrar Nova Equipe Elétrica'}
          </h3>

          {errorMessage && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome da Equipe</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Equipe Epsilon Manutenção"
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Encarregado / Supervisor</label>
              <input
                type="text"
                value={encarregado}
                onChange={(e) => setEncarregado(e.target.value)}
                placeholder="Ex: Roberto Gomes"
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qtd. de Colaboradores</label>
              <input
                type="number"
                min="1"
                max="50"
                value={colaboradoresCount}
                onChange={(e) => setColaboradoresCount(Number(e.target.value))}
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Identificação do Contrato</label>
              <input
                type="text"
                value={contrato}
                onChange={(e) => setContrato(e.target.value)}
                placeholder="Ex: C-20194-CEMIG"
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Região de Lotação / Atuação</label>
              <input
                type="text"
                value={regiao}
                onChange={(e) => setRegiao(e.target.value)}
                placeholder="Ex: Zona da Mata, Vale do Aço, Norte"
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-350 border-slate-300 rounded-lg text-slate-750 text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer shadow"
            >
              <Check className="w-4 h-4" />
              Salvar Equipe
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar equipe, encarregado ou contrato..."
              className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Teams Table / Grid */}
          {filteredEquipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEquipes.map((eq) => (
                <div key={eq.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="bg-blue-50 text-blue-900 p-2.5 rounded-lg border border-blue-105 border-blue-100">
                        <Users className="w-5 h-5" />
                      </div>
                      
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditForm(eq)}
                            className="p-1.5 text-slate-500 hover:text-blue-900 rounded hover:bg-slate-50 transition-colors"
                            title="Editar equipe"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(eq.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-50 transition-colors"
                            title="Remover equipe"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-base font-bold text-slate-900">{eq.nome}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Contrato: <span className="font-mono text-slate-700 font-semibold">{eq.contrato}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Região: <span className="text-slate-700 font-semibold">{eq.regiao}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider text-slate-500">Encarregado</p>
                      <p className="font-semibold text-slate-900 truncate mt-0.5" title={eq.encarregado}>
                        {eq.encarregado}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider text-slate-500">Efetivo</p>
                      <p className="font-semibold text-slate-905 text-slate-900 mt-0.5">
                        {eq.colaboradoresCount} colaboradores
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white text-center py-12 rounded-xl border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Nenhuma equipe operacional localizada.</p>
              <p className="text-slate-400 text-xs mt-1">Refine o filtro ou cadastre novas turmas de campo.</p>
            </div>
          )}

          {!isAdmin && (
            <div className="bg-blue-50/70 p-4 border border-blue-100 rounded-xl text-blue-950 flex items-start gap-3 mt-4">
              <ShieldAlert className="w-5 h-5 shrink-0 text-blue-800" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Apenas Administradores podem adicionar, alterar ou excluir equipes.</p>
                <p className="leading-relaxed">Seu perfil atual de visualização permite a livre consulta e preenchimento de checklists vinculados a estas equipes.</p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
