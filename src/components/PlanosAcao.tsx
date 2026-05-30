import { useState } from 'react';
import { PlanoAcao } from '../types';
import { getPlanosAcao, updatePlanoAcaoStatus } from '../utils/mockData';
import { ShieldCheck, ShieldAlert, CheckCircle, Clock, AlertTriangle, Search, Filter, RefreshCcw, ExternalLink } from 'lucide-react';

interface PlanosAcaoProps {
  currentUser: any;
  onViewInspectionById?: (id: string) => void;
}

export default function PlanosAcao({ currentUser, onViewInspectionById }: PlanosAcaoProps) {
  const [planos, setPlanos] = useState<PlanoAcao[]>(getPlanosAcao());
  const [filterStatus, setFilterStatus] = useState<'all' | 'Aberto' | 'Em andamento' | 'Concluído'>('all');
  const [search, setSearch] = useState('');

  const canEditStatus = currentUser.perfil === 'admin' || currentUser.perfil === 'gestor';

  const handleStatusChange = (inspecaoId: string, itemChave: string, nuevoStatus: 'Aberto' | 'Em andamento' | 'Concluído') => {
    updatePlanoAcaoStatus(inspecaoId, itemChave, nuevoStatus);
    // Refresh state list
    setPlanos(getPlanosAcao());
  };

  const filteredPlanos = planos.filter(plano => {
    const matchesStatus = filterStatus === 'all' || plano.status === filterStatus;
    const matchesSearch = 
      plano.checklistDescricao.toLowerCase().includes(search.toLowerCase()) ||
      plano.naoConformidade.toLowerCase().includes(search.toLowerCase()) ||
      plano.responsavel.toLowerCase().includes(search.toLowerCase()) ||
      plano.inspecaoOS.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-900" />
            Controle de Planos de Ação (Ações Corretivas)
          </h2>
          <p className="text-sm text-slate-500">
            Acompanhamento e resolução de desvios e não conformidades em campo para regularização.
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'all' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Todos ({planos.length})
          </button>
          <button
            onClick={() => setFilterStatus('Aberto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'Aberto' ? 'bg-red-650 bg-red-600 text-white shadow' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
          >
            Aberto ({planos.filter(p => p.status === 'Aberto').length})
          </button>
          <button
            onClick={() => setFilterStatus('Em andamento')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'Em andamento' ? 'bg-amber-500 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}`}
          >
            Em Andamento ({planos.filter(p => p.status === 'Em andamento').length})
          </button>
          <button
            onClick={() => setFilterStatus('Concluído')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'Concluído' ? 'bg-emerald-605 bg-emerald-605 bg-emerald-650 bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
          >
            Concluído ({planos.filter(p => p.status === 'Concluído').length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar desvio ou responsável..."
            className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-900 focus:border-blue-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Plan list */}
      {filteredPlanos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlanos.map((plano) => {
            const isAberto = plano.status === 'Aberto';
            const isEmAndamento = plano.status === 'Em andamento';
            const isConcluido = plano.status === 'Concluído';

            return (
              <div key={plano.id} className="bg-white rounded-xl border border-slate-205 border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden hover:border-slate-300 transition-colors">
                
                {/* Left side preview image */}
                {plano.fotoUrl && (
                  <div className="w-full md:w-44 shrink-0 bg-slate-900 border-r border-slate-100 flex items-center justify-center relative aspect-video md:aspect-auto">
                    <img 
                      src={plano.fotoUrl} 
                      alt="nc" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Ocorrência O.S
                    </span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    
                    {/* Upper Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-blue-105 bg-blue-50 text-blue-900 px-2 py-0.5 rounded">
                          {plano.inspecaoOS}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          | Projeto: {plano.projeto}
                        </span>
                      </div>

                      {/* Status selectors */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-450 text-slate-500 uppercase tracking-widest mr-1">Status:</span>
                        
                        {canEditStatus ? (
                          <select
                            value={plano.status}
                            onChange={(e) => handleStatusChange(plano.inspecaoId, plano.chaveItem, e.target.value as any)}
                            className={`p-1 px-1.5 border text-[11px] font-bold rounded-lg cursor-pointer bg-white ${
                              isAberto ? 'text-red-750 border-red-500 text-red-700 bg-red-50/20' :
                              isEmAndamento ? 'text-amber-800 border-amber-500 bg-amber-50/20' :
                              'text-emerald-800 border-emerald-500 bg-emerald-50/20'
                            }`}
                          >
                            <option value="Aberto">🔴 Aberto</option>
                            <option value="Em andamento">🟡 Em andamento</option>
                            <option value="Concluído">🟢 Concluído</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isAberto ? 'bg-red-50 text-red-700' :
                            isEmAndamento ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {plano.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle block */}
                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        Desvio: {plano.checklistDescricao}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed italic bg-slate-50 p-2 rounded border border-slate-100">
                        "{plano.naoConformidade}"
                      </p>
                      
                      <div className="mt-3.5 space-y-1 text-slate-650">
                        <p className="text-xs font-semibold">
                          ⚙️ <span className="text-slate-500">Ação Corretiva:</span> {plano.acaoCorretiva}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Footer block */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Responsável</p>
                        <p className="font-bold text-slate-705 text-slate-800 mt-1 truncate max-w-[150px]">{plano.responsavel}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Prazo Limite</p>
                        <p className="font-bold text-red-650 text-red-600 mt-1">{plano.prazo}</p>
                      </div>
                    </div>

                    {onViewInspectionById && (
                      <button
                        onClick={() => onViewInspectionById(plano.inspecaoId)}
                        className="inline-flex items-center gap-1.5 font-bold text-blue-900 hover:text-blue-950 transition-colors cursor-pointer self-end hover:underline text-[11px]"
                      >
                        Ver Ficha Completa
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white text-center py-12 rounded-xl border border-slate-202 border-slate-200 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
          <p className="text-slate-600 font-bold text-sm">Nenhum plano de ação localizado para esses critérios.</p>
          <p className="text-slate-450 text-xs mt-1 text-slate-400">Todos os desvios estão sanados ou em conformidade.</p>
        </div>
      )}

      {/* Corporate Manager Warning */}
      {!canEditStatus && (
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-slate-600 font-semibold text-xs leading-relaxed max-w-3xl">
          ⚠️ Nota: Seu perfil atual de <strong>{currentUser.perfil === 'inspector' ? 'Inspetor' : 'Espectador'}</strong> permite a consulta de pendências. Somente Administradores e Gestores podem atualizar o quadro de status para regularizar os desvios.
        </div>
      )}

    </div>
  );
}
