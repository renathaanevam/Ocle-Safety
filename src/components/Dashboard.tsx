import { useState, useMemo } from 'react';
import { Inspecao, ChecklistCategory } from '../types';
import { CHECKLIST_CONFIG } from '../utils/checklistConfig';
import { getSavedInspecoes, getPlanosAcao } from '../utils/mockData';
import { ShieldCheck, ShieldAlert, CheckCircle, TrendingUp, ChevronRight, AlertTriangle, Clock, BarChart3, PieChart, Activity } from 'lucide-react';

interface DashboardProps {
  inspecoes: Inspecao[];
  onViewInspection?: (inspecao: Inspecao) => void;
}

export default function Dashboard({ inspecoes, onViewInspection }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Computed Stats
  const stats = useMemo(() => {
    const totalInspections = inspecoes.length;
    
    let totalC = 0;
    let totalNC = 0;
    let totalNA = 0;
    
    inspecoes.forEach(insp => {
      totalC += insp.conformeCount || 0;
      totalNC += insp.naoConformeCount || 0;
      totalNA += insp.naoAplicavelCount || 0;
    });

    const compliancePercentage = totalC + totalNC > 0 
      ? Math.round((totalC / (totalC + totalNC)) * 1000) / 10 
      : 100;

    // Inspections per month tracking (for line chart)
    const months = ['Jan/26', 'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26'];
    const monthlyInspections = [2, 3, 5, 4, totalInspections, 0]; // seeded history

    // NCs by category
    const ncByCategory: Record<ChecklistCategory, number> = {
      'Regras de Ouro': 0,
      'Demais Verificações': 0,
      'EPIs': 0,
      'EPCs e Equipamentos': 0
    };

    const failedItemsCount: Record<string, { desc: string, count: number }> = {};

    inspecoes.forEach(insp => {
      Object.entries(insp.respostas).forEach(([key, val]) => {
        if (val === 'NC') {
          const config = CHECKLIST_CONFIG.find(c => c.id === key);
          if (config) {
            ncByCategory[config.categoria] = (ncByCategory[config.categoria] || 0) + 1;
            
            if (!failedItemsCount[key]) {
              failedItemsCount[key] = { desc: config.descricao, count: 0 };
            }
            failedItemsCount[key].count += 1;
          }
        }
      });
    });

    const totalNCsCount = Object.values(ncByCategory).reduce((a, b) => a + b, 0);

    const ranking = Object.values(failedItemsCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const actionPlans = getPlanosAcao();
    const openPlans = actionPlans.filter(p => p.status !== 'Concluído').length;

    return {
      totalInspections,
      totalNCsCount,
      compliancePercentage,
      monthlyInspections,
      months,
      ncByCategory,
      ranking,
      openPlans,
      categoryStats: Object.entries(ncByCategory).map(([cat, count]) => ({
        category: cat,
        count,
        percent: totalNCsCount > 0 ? Math.round((count / totalNCsCount) * 100) : 0
      }))
    };
  }, [inspecoes]);

  // Color mappings for mock charts
  const categoryCOLORS: Record<string, string> = {
    'Regras de Ouro': '#DC2626',       // Red-600
    'Demais Verificações': '#2563EB',  // Blue-600
    'EPIs': '#D97706',                // Amber-600
    'EPCs e Equipamentos': '#059669'   // Emerald-600
  };

  return (
    <div className="space-y-6">
      
      {/* Upper stats summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="bg-white overflow-hidden shadow rounded-xl border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg text-blue-900 border border-blue-100">
                <Activity className="h-6 w-6" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total de Inspeções
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold font-sans text-slate-900">
                      {stats.totalInspections}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg text-red-600 border border-red-100">
                <ShieldAlert className="h-6 w-6" id="card_nc_icon" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Não Conformidades
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold font-sans text-slate-900">
                      {stats.totalNCsCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-50 p-3 rounded-lg text-emerald-600 border border-emerald-100">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Conformidade Geral
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold font-sans text-slate-900">
                      {stats.compliancePercentage}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-50 p-3 rounded-lg text-amber-600 border border-amber-100">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Planos em Aberto
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold font-sans text-slate-900">
                      {stats.openPlans}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Compliance percentage SVG Pizza Chart */}
        <div className="bg-white p-6 shadow rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5 mb-4">
              <PieChart className="w-5 h-5 text-blue-900" />
              Índice de Conformidade Geral
            </h3>
            
            <div className="relative flex justify-center items-center py-6">
              {/* Radial gauge SVG */}
              <svg className="w-48 h-48 transform -rotate-90" id="gauge_conformity">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="76"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="16"
                />
                {/* Foreground circle displaying percentage */}
                <circle
                  cx="96"
                  cy="96"
                  r="76"
                  fill="none"
                  stroke={stats.compliancePercentage >= 95 ? '#059669' : stats.compliancePercentage >= 85 ? '#D97706' : '#DC2626'}
                  strokeWidth="16"
                  strokeDasharray={`${2 * Math.PI * 76}`}
                  strokeDashoffset={`${2 * Math.PI * 76 * (1 - stats.compliancePercentage / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center bg-white rounded-full p-2">
                <p className="text-3xl font-black text-slate-900">{stats.compliancePercentage}%</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Seguro</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                Meta Reguladora
              </span>
              <span className="font-bold text-slate-900">≥ 95%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Status Atual
              </span>
              <span className={`font-bold ${stats.compliancePercentage >= 95 ? 'text-emerald-700' : 'text-amber-600'}`}>
                {stats.compliancePercentage >= 95 ? 'Excelente' : 'Atenção'}
              </span>
            </div>
          </div>
        </div>

        {/* Non conformities by category Bar chart summary */}
        <div className="bg-white p-6 shadow rounded-xl border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-900" />
            NCs por Categoria do Checklist
          </h3>

          <div className="space-y-4 pt-2">
            {stats.categoryStats.map((item) => {
              const barColor = categoryCOLORS[item.category] || '#475569';
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{item.category}</span>
                    <span className="font-bold text-slate-900">
                      {item.count} NCs ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-700"
                      style={{ 
                        width: `${Math.max(item.percent, item.count > 0 ? 8 : 1)}%`,
                        backgroundColor: barColor 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500 leading-relaxed">
            As infrações de maior risco e ações prioritárias concentram-se na categoria <span className="font-bold text-red-600">Regras de Ouro</span>. Cada desvio deve possuir plano corretivo imediato.
          </div>
        </div>

        {/* Temporal active line chart mapping past inspections */}
        <div className="bg-white p-6 shadow rounded-xl border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-900" />
            Inspeções por Período Mensal
          </h3>

          {/* Simple custom interactive Line plot with pure SVG */}
          <div className="relative h-44 pb-4">
            <svg viewBox="0 0 300 120" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="10" y1="20" x2="290" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="10" y1="50" x2="290" y2="50" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="10" y1="80" x2="290" y2="80" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="10" y1="100" x2="290" y2="100" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Line path */}
              <path
                d="M 20 80 L 70 60 L 120 40 L 170 50 L 220 20 L 270 100"
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Dots with values */}
              {[
                { x: 20, y: 80, val: 2 },
                { x: 70, y: 60, val: 3 },
                { x: 120, y: 40, val: 5 },
                { x: 170, y: 50, val: 4 },
                { x: 220, y: 20, val: stats.totalInspections }, // Real time
                { x: 270, y: 100, val: 0 }
              ].map((dot, idx) => (
                <g key={idx}>
                  <circle cx={dot.x} cy={dot.y} r="4" fill="#EAB308" stroke="#1E3A8A" strokeWidth="1.5" />
                  <text x={dot.x} y={dot.y - 8} fontSize="7" fontWeight="bold" textAnchor="middle" fill="#0F172A">
                    {dot.val}
                  </text>
                </g>
              ))}
            </svg>

            {/* X Labels */}
            <div className="flex justify-between px-2 text-[10px] font-bold text-slate-500 font-sans mt-2">
              {stats.months.map((m, i) => <span key={i}>{m}</span>)}
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-2 mt-4">
            <span className="w-2 h-2 bg-blue-900 rounded-full"></span>
            <span className="text-[11px] font-medium text-blue-900">
              Foco contínuo nas frentes de Linha Viva com manutenções preventivas ativas.
            </span>
          </div>
        </div>

      </div>

      {/* Critical Items / Ranking / Recent Activities Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Most Failed Safety Checklist Items (Ranking) */}
        <div className="bg-white p-6 shadow rounded-xl border border-slate-200 lg:col-span-1">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-650 text-red-600" />
            Ranking de Itens Mais Reprovados
          </h3>

          <div className="space-y-3.5">
            {stats.ranking.length > 0 ? (
              stats.ranking.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${index === 0 ? 'bg-red-600 text-white' : index === 1 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-950 truncate leading-tight">
                      {item.desc}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Falta Grave reportada <span className="font-bold text-red-650 text-red-600">{item.count}x</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Nenhum desvio ou não conformidade registrada em campo atualmente.
              </div>
            )}
          </div>
        </div>

        {/* Recent Inspections List */}
        <div className="bg-white p-6 shadow rounded-xl border border-slate-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
              Últimas Inspeções Carregadas
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-2.5 rounded-l-lg">Data</th>
                  <th className="px-3 py-2.5">O.S / Projeto</th>
                  <th className="px-3 py-2.5">Encarregado</th>
                  <th className="px-3 py-2.5">Veículo</th>
                  <th className="px-3 py-2.5">Conformidade</th>
                  <th className="px-3 py-2.5 text-right rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {inspecoes.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {insp.data}
                      <span className="block text-[10px] font-normal text-slate-500">{insp.horaInicio} - {insp.horaFinal}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-bold text-blue-900 block leading-tight">{insp.ordemServico}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">{insp.projeto}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-650 text-slate-705 whitespace-nowrap font-medium">
                      {insp.encarregado}
                    </td>
                    <td className="px-3 py-3 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                      {insp.veiculoPrefixo}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${insp.percentualConformidade >= 95 ? 'bg-emerald-55 bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {insp.percentualConformidade}%
                      </span>
                      <span className="block text-[9px] text-slate-400 font-semibold mt-0.5">
                        {insp.conformeCount}C / {insp.naoConformeCount}NC
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onViewInspection?.(insp)}
                        className="inline-flex items-center gap-1 font-semibold text-blue-900 hover:text-blue-950 hover:underline cursor-pointer"
                      >
                        Ver Ficha
                        <ChevronRight className="w-3.5 h-3.5" />
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
  );
}
