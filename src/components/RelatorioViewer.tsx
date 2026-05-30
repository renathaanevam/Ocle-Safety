import { Inspecao } from '../types';
import { CHECKLIST_CONFIG } from './../utils/checklistConfig';
import { ArrowLeft, Printer, ShieldCheck, Mail, Calendar, HelpCircle, FileText, CheckCircle, AlertOctagon, CornerDownRight } from 'lucide-react';

interface RelatorioViewerProps {
  inspecao: Inspecao;
  onBack: () => void;
}

export default function RelatorioViewer({ inspecao, onBack }: RelatorioViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header bar (Invisible in Print) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 hover:underline cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Lista
        </button>

        <div className="flex gap-2">
          {/* Print option */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-lg hover:bg-blue-955 hover:bg-blue-950 cursor-pointer shadow transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimir ou Salvar PDF
          </button>
        </div>
      </div>

      {/* Styled Multi-page Simulator */}
      <div className="mx-auto max-w-4xl bg-slate-100 p-3 sm:p-6 rounded-2xl print:bg-white print:p-0 print:m-0 print:max-w-full">
        <div className="space-y-12 print:space-y-0 text-slate-900 bg-white">
          
          {/* ----------------- PAGE 1 ----------------- */}
          <div className="bg-white p-8 sm:p-12 border border-slate-300 shadow-md min-h-[29.7cm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 page-break">
            <div>
              {/* Header block */}
              <div className="pb-6 border-b-2 border-blue-900 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-blue-950 font-sans tracking-tight">
                    OCLE SAFETY
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
                    Relatório de Inspeção Técnica de Segurança do Trabalho
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-900 font-mono text-xs font-bold ring-1 ring-blue-200">
                    ID: {inspecao.id.substring(5, 12).toUpperCase()}
                  </span>
                  <p className="text-[9px] text-slate-400 font-bold mt-1.5">DATA DO LAUDO: {inspecao.data}</p>
                </div>
              </div>

              {/* SECTION: GENERAL DATA */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 text-slate-800 p-2 rounded tracking-widest">
                  1. Dados Gerais da Inspeção
                </h2>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Data da Execução</span>
                    <span className="font-semibold text-slate-900">{inspecao.data}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Período de Campo</span>
                    <span className="font-semibold text-slate-900">{inspecao.horaInicio} às {inspecao.horaFinal}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Município</span>
                    <span className="font-semibold text-slate-900">{inspecao.municipio}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Região / Lotação</span>
                    <span className="font-semibold text-slate-900">{inspecao.areaLotacao}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Localidade / Ponto de Rede</span>
                    <span className="font-semibold text-slate-900">{inspecao.local}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Identificação do Projeto</span>
                    <span className="font-semibold text-slate-900">{inspecao.projeto}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Ordem de Serviço (O.S)</span>
                    <span className="font-semibold text-blue-950 font-mono text-slate-900">{inspecao.ordemServico}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 text-slate-500 uppercase font-bold">Nível de Conformidade Técnica</span>
                    <span className={`font-black uppercase inline-block ${inspecao.percentualConformidade >= 95 ? 'text-green-700' : 'text-amber-700'}`}>
                      {inspecao.percentualConformidade}% ({inspecao.percentualConformidade >= 95 ? 'Seguro' : 'Sob Atenção'})
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: TEAM DATA */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 text-slate-800 p-2 rounded tracking-widest">
                  2. Dados da Equipe de Execução
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5 text-xs">
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] text-slate-550 text-slate-550 text-slate-500 uppercase font-bold">Denominação Técnica</span>
                    <span className="font-semibold text-slate-905 text-slate-900">{inspecao.equipeNome}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-550 text-slate-550 text-slate-500 uppercase font-bold">Efetivo de Campo</span>
                    <span className="font-semibold text-slate-905 text-slate-900">{inspecao.colaboradoresCount} Profissionais</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="block text-[10px] text-slate-550 text-slate-550 text-slate-500 uppercase font-bold">Encarregado Técnico Responsável</span>
                    <span className="font-semibold text-slate-905 text-slate-905 text-slate-900 text-sm">{inspecao.encarregado}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: VEHICLE DATA & IDs */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 text-slate-800 p-2 rounded tracking-widest">
                  3. Dados do Veículo e Identificação de Risco
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3.5 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Prefixo Frota</span>
                    <span className="font-semibold text-slate-900 font-mono text-sm">{inspecao.veiculoPrefixo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Placa Mercosul</span>
                    <span className="font-semibold text-slate-900 font-mono text-sm">{inspecao.veiculoPlaca}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold font-semibold">Código ID APR</span>
                    <span className="font-semibold text-red-750 text-red-700 font-mono">{inspecao.idApr || 'Não Declarado'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">ID Câmera de Vigilância</span>
                    <span className="font-semibold text-slate-900 font-mono">{inspecao.idCamera || 'Não Informado'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer page */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>OCLE SAFETY - SISTEMA AUTOMÁTICO DE SEGURANÇA</span>
              <span className="font-bold uppercase tracking-wider">Folha 1 / 4</span>
            </div>
          </div>

          <div className="print:block" style={{ pageBreakBefore: 'always' }}></div>

          {/* ----------------- PAGE 2 ----------------- */}
          <div className="bg-white p-8 sm:p-12 border border-slate-300 shadow-md min-h-[29.7cm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 page-break">
            <div>
              {/* Header block */}
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <p className="text-sm font-black text-blue-900 uppercase">OCLE SAFETY</p>
                <p className="text-[10px] text-slate-400">O.S: {inspecao.ordemServico} | Checklist Geral</p>
              </div>

              {/* CHECKLIST RESULTS TABLE */}
              <div className="mt-6 space-y-4">
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 text-slate-800 p-2 rounded tracking-widest">
                  4. Checklist Completo de Campo
                </h2>

                <div className="text-[11px] font-semibold text-slate-600 bg-slate-55 bg-slate-50 p-2.5 rounded border border-slate-150 flex justify-between">
                  <span>Conforme (C): {inspecao.conformeCount}</span>
                  <span>Não Conforme (NC): {inspecao.naoConformeCount}</span>
                  <span>Não Aplicável (N.A): {inspecao.naoAplicavelCount}</span>
                </div>

                <div className="overflow-hidden">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-300 text-slate-500 bg-slate-100 text-left">
                        <th className="py-2 px-2 text-[10px] font-bold uppercase tracking-wider">Item Verificado</th>
                        <th className="py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-center w-20">Resposta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {CHECKLIST_CONFIG.map((item) => {
                        const ans = inspecao.respostas[item.id] || 'C';
                        
                        return (
                          <tr key={item.id} className={ans === 'NC' ? 'bg-red-50/40' : ''}>
                            <td className="py-1.5 px-2 font-medium text-slate-800 leading-snug">
                              <span className="text-[10px] text-slate-400 font-mono inline-block w-28 shrink-0">
                                [{item.categoria}]
                              </span>
                              {item.descricao}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span className={`inline-block font-black text-center w-8 px-1 py-0.5 rounded leading-none text-[10px] ${
                                ans === 'C' ? 'bg-green-50 text-green-700' :
                                ans === 'NC' ? 'bg-red-50 text-red-700' :
                                'bg-slate-100 text-slate-650'
                              }`}>
                                {ans}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer page */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>OCLE SAFETY - SISTEMA AUTOMÁTICO DE SEGURANÇA</span>
              <span className="font-bold uppercase tracking-wider">Folha 2 / 4</span>
            </div>
          </div>

          <div className="print:block" style={{ pageBreakBefore: 'always' }}></div>

          {/* ----------------- PAGE 3 ----------------- */}
          <div className="bg-white p-8 sm:p-12 border border-slate-300 shadow-md min-h-[29.7cm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 page-break">
            <div>
              {/* Header block */}
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <p className="text-sm font-black text-blue-900 uppercase">OCLE SAFETY</p>
                <p className="text-[10px] text-slate-400">O.S: {inspecao.ordemServico} | Não Conformidades</p>
              </div>

              {/* LIST OF NON-CONFORMITIES AND PATH */}
              <div className="mt-6 space-y-5">
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 text-slate-850 text-slate-800 p-2 rounded tracking-widest">
                  5. Detalhamento Técnico das Não Conformidades Identificadas
                </h2>

                {Object.keys(inspecao.naoConformidades).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(inspecao.naoConformidades).map(([key, form]) => {
                      const itemConfig = CHECKLIST_CONFIG.find(c => c.id === key);
                      
                      return (
                        <div key={key} className="p-4 border-2 border-red-100 rounded-xl space-y-3 bg-red-50/5 text-xs">
                          <div className="flex items-center gap-1.5 text-red-750 font-bold border-b pb-1.5 border-red-50">
                            <AlertOctagon className="w-4 h-4 text-red-650 text-red-600" />
                            <span>Item Reprovado: {itemConfig?.descricao || key}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Irregularidade Física Constatada</p>
                              <p className="mt-1 font-semibold text-slate-800 p-2 bg-slate-50 border rounded italic leading-relaxed">
                                "{form.descricao}"
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Proposição de Ação Corretiva Imediata</p>
                              <p className="mt-1 font-semibold text-slate-800 p-2 bg-slate-50 border rounded leading-relaxed">
                                {form.acaoCorretiva}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px] pt-1.5">
                            <div>
                              <span className="text-slate-450 text-slate-500 font-bold">Colaborador Responsável:</span>
                              <span className="block font-semibold mt-0.5 text-slate-800">{form.responsavel}</span>
                            </div>
                            <div>
                              <span className="text-slate-450 text-slate-500 font-bold">Prazo Limite Legal:</span>
                              <span className="block font-black mt-0.5 text-red-650 text-red-600">{form.prazo}</span>
                            </div>
                            <div>
                              <span className="text-slate-450 text-slate-500 font-bold">Status Corretivo:</span>
                              <span className="block font-bold mt-0.5 text-slate-600 uppercase">
                                [{form.status}]
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 text-center rounded-xl border border-slate-150">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">Conformidade Plena Constatada</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Nenhuma infração de campo ou desvios associados foram detectados neste circuito elétrico. A frente de trabalho segue operando de acordo com as normas de engenharia e segurança.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Footer page */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>OCLE SAFETY - SISTEMA AUTOMÁTICO DE SEGURANÇA</span>
              <span className="font-bold uppercase tracking-wider">Folha 3 / 4</span>
            </div>
          </div>

          <div className="print:block" style={{ pageBreakBefore: 'always' }}></div>

          {/* ----------------- PAGE 4+ ----------------- */}
          <div className="bg-white p-8 sm:p-12 border border-slate-300 shadow-md min-h-[29.7cm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 page-break">
            <div>
              {/* Header block */}
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <p className="text-sm font-black text-blue-900 uppercase">OCLE SAFETY</p>
                <p className="text-[10px] text-slate-400">O.S: {inspecao.ordemServico} | Registros e Assinaturas</p>
              </div>

              {/* PHOTO EVIDENCE GRID */}
              <div className="mt-6 space-y-4">
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 text-slate-800 p-2 rounded tracking-widest">
                  6. Registros Fotográficos de Conformidade Técnica
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {inspecao.fotos.slice(0, 8).map((foto, index) => (
                    <div key={foto.id} className="border border-slate-200 rounded p-1.5 flex flex-col justify-between text-[10px] bg-slate-50 shadow-sm">
                      <img 
                        src={foto.url} 
                        alt="registro" 
                        className="w-full h-24 object-cover rounded"
                        referrerPolicy="no-referrer"
                      />
                      <div className="mt-1 space-y-0.5">
                        <p className="font-bold text-slate-800 truncate leading-tight">📷 Evidência #{index + 1}: {foto.legenda}</p>
                        <p className="text-slate-400 text-[8px] font-mono leading-none truncate">
                          📍 {foto.gps} | 📅 {foto.data} | ⏰ {foto.hora}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {inspecao.fotos.length > 8 && (
                  <p className="text-[10px] text-slate-400 italic text-center text-slate-500 pt-2 font-semibold">
                    *Exibindo primeiras 8 fotos de conformidade das {inspecao.fotos.length} evidências auditadas salvas em nuvem.
                  </p>
                )}
              </div>

              {/* FINAL AUTOGRAPHS / SIGNATURE DIVISION */}
              <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 gap-6">
                
                <div className="text-center space-y-2">
                  <div className="h-16 flex items-center justify-center p-2.5 bg-slate-50 rounded border border-dashed border-slate-300">
                    <img 
                      src={inspecao.assinaturaInspetor} 
                      alt="Assinatura Inspetor" 
                      className="max-h-full max-w-full object-contain"
                      id="pdf_inspector_signed"
                    />
                  </div>
                  <p className="text-xs font-bold leading-tight text-slate-905 text-slate-900">{inspecao.criadoPor}</p>
                  <p className="text-[9px] text-slate-450 text-slate-500 font-bold uppercase tracking-wider leading-none">Inspetor Corporativo Responsável</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="h-16 flex items-center justify-center p-2.5 bg-slate-50 rounded border border-dashed border-slate-300">
                    <img 
                      src={inspecao.assinaturaEncarregado} 
                      alt="Assinatura Encarregado" 
                      className="max-h-full max-w-full object-contain"
                      id="pdf_supervisor_signed"
                    />
                  </div>
                  <p className="text-xs font-bold leading-tight text-slate-905 text-slate-900">{inspecao.encarregado}</p>
                  <p className="text-[9px] text-slate-450 text-slate-500 font-bold uppercase tracking-wider leading-none">Encarregado Técnico de Obra</p>
                </div>

              </div>

            </div>

            {/* Footer page */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>OCLE SAFETY - SISTEMA AUTOMÁTICO DE SEGURANÇA</span>
              <span className="font-bold uppercase tracking-wider">Folha 4 / 4</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
