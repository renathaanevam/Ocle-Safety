import { useState, useMemo, FormEvent } from 'react';
import { Veiculo } from '../types';
import { getSavedVeiculos, saveVeiculos } from '../utils/mockData';
import { Truck, Plus, Edit2, Trash2, Calendar, Search, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VeiculosListProps {
  isAdmin: boolean;
}

export default function VeiculosList({ isAdmin }: VeiculosListProps) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>(getSavedVeiculos());
  const [search, setSearch] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [prefixo, setPrefixo] = useState('');
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('');
  const [situacao, setSituacao] = useState<'Liberado' | 'Restrição' | 'Bloqueado'>('Liberado');
  const [ultimaInspecao, setUltimaInspecao] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered vehicles
  const filteredVeiculos = useMemo(() => {
    return veiculos.filter(v => 
      v.prefixo.toLowerCase().includes(search.toLowerCase()) ||
      v.placa.toLowerCase().includes(search.toLowerCase()) ||
      v.tipo.toLowerCase().includes(search.toLowerCase())
    );
  }, [veiculos, search]);

  const handleOpenCreateForm = () => {
    setEditId(null);
    setPrefixo('');
    setPlaca('');
    setTipo('');
    setSituacao('Liberado');
    setUltimaInspecao(new Date().toISOString().split('T')[0]);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleOpenEditForm = (v: Veiculo) => {
    setEditId(v.id);
    setPrefixo(v.prefixo);
    setPlaca(v.placa);
    setTipo(v.tipo);
    setSituacao(v.situacao);
    setUltimaInspecao(v.ultimaInspecao);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!prefixo.trim() || !placa.trim() || !tipo.trim() || !ultimaInspecao) {
      setErrorMessage('Todos os campos do formulário são de preenchimento obrigatório.');
      return;
    }

    // Plate validation regex format e.g. AAA-9999 or AAA9A99
    const regexPlaca = /^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/i;
    if (!regexPlaca.test(placa.replace(/\s+/g, ''))) {
      setErrorMessage('Formato de placa inválido. Insira no padrão Mercosul (ABC1D23) ou Tradicional (ABC-1234).');
      return;
    }

    let updatedList: Veiculo[];

    if (editId) {
      updatedList = veiculos.map(v => v.id === editId ? {
        ...v,
        prefixo,
        placa: placa.toUpperCase(),
        tipo,
        situacao,
        ultimaInspecao
      } : v);
    } else {
      const newVeh: Veiculo = {
        id: 'v-' + Date.now().toString(),
        prefixo,
        placa: placa.toUpperCase(),
        tipo,
        situacao,
        ultimaInspecao
      };
      updatedList = [...veiculos, newVeh];
    }

    setVeiculos(updatedList);
    saveVeiculos(updatedList);
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este veículo do cadastro corporativo?')) {
      const updatedList = veiculos.filter(v => v.id !== id);
      setVeiculos(updatedList);
      saveVeiculos(updatedList);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-900" />
            Frota de Veículos e Equipamentos
          </h2>
          <p className="text-sm text-slate-500">
            Frota de caminhões de linha viva, hidroelevadores NR12, e plataformas auxiliares de altura.
          </p>
        </div>

        {isAdmin && !isEditing && (
          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-950 transition-colors cursor-pointer text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            Novo Veículo
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-950 border-b pb-2">
            {editId ? 'Ajustar Cadastro do Veículo' : 'Ingressar Novo Veículo de Operação'}
          </h3>

          {errorMessage && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prefixo Corporativo</label>
              <input
                type="text"
                value={prefixo}
                onChange={(e) => setPrefixo(e.target.value)}
                placeholder="Ex: LV-4509"
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Placa do Veículo</label>
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Ex: ABC1D23 ou GTE-9501"
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Implemento / Cesta</label>
              <input
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Ex: Hidroelevador Duplo Cesto (NR12)"
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Situação de Segurança</label>
              <select
                value={situacao}
                onChange={(e) => setSituacao(e.target.value as any)}
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="Liberado">Liberado para Operação</option>
                <option value="Restrição">Restrição (Verificar pendências)</option>
                <option value="Bloqueado">Bloqueado (Grave imobilizado)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Data da Última Inspeção</label>
              <input
                type="date"
                value={ultimaInspecao}
                onChange={(e) => setUltimaInspecao(e.target.value)}
                className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer shadow"
            >
              <Check className="w-4 h-4" />
              Confirmar Cadastro
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          
          {/* Query filtering */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtre pela placa, prefixo ou guincho..."
              className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Grid Layout of Fleet */}
          {filteredVeiculos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredVeiculos.map((v) => {
                const isLiberado = v.situacao === 'Liberado';
                const isRestricao = v.situacao === 'Restrição';
                const isBloqueado = v.situacao === 'Bloqueado';

                return (
                  <div key={v.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:ring-1 hover:ring-blue-900/10 flex flex-col justify-between">
                    <div>
                      {/* Top ribbon */}
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-bold">
                          {v.placa}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLiberado ? 'bg-green-50 text-green-700' :
                          isRestricao ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {isLiberado ? <ShieldCheck className="w-3 h-3 text-green-600" /> : isRestricao ? <AlertTriangle className="w-3 h-3 text-amber-600" /> : <AlertTriangle className="w-3 h-3 text-red-600" />}
                          {v.situacao}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isLiberado ? 'bg-emerald-50 text-emerald-700' :
                          isRestricao ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{v.prefixo}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[160px]" title={v.tipo}>{v.tipo}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspeção: {v.ultimaInspecao}</span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditForm(v)}
                            className="p-1 text-slate-400 hover:text-blue-900 hover:bg-slate-50 rounded transition-colors"
                            title="Editar Dados"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded transition-colors"
                            title="Descartar Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white text-center py-12 rounded-xl border border-slate-200">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Nenhum veículo localizado.</p>
              <p className="text-slate-400 text-xs mt-1">Insira novos caminhões de trabalho no banco de dados.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
