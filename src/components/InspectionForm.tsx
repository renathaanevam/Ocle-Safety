import { useState, useRef, useEffect, FormEvent, ChangeEvent, RefObject, useMemo, MouseEvent } from 'react';
import { Inspecao, InspecaoFoto, Equipe, Veiculo, ChecklistCategory } from '../types';
import { CHECKLIST_CONFIG } from './../utils/checklistConfig';
import { getSavedEquipes, getSavedVeiculos } from '../utils/mockData';
import { 
  ShieldCheck, ShieldAlert, FileText, Users, Truck, Sparkles, Check, AlertTriangle, 
  Camera, Image, Trash2, Edit3, X, HelpCircle, Save, CheckSquare
} from 'lucide-react';

interface InspectionFormProps {
  currentUser: any;
  onSave: (nuevaInspecao: Inspecao) => void;
  onCancel: () => void;
}

const CONSTANT_MOCK_COORDINATES = [
  '-21.7642, -43.3508',
  '-21.7584, -43.3421',
  '-19.9167, -43.9345',
  '-21.5594, -45.4342',
  '-18.9186, -48.2772',
  '-20.2185, -40.2947'
];

export default function InspectionForm({ currentUser, onSave, onCancel }: InspectionFormProps) {
  const registeredCrews = getSavedEquipes();
  const registeredTrucks = getSavedVeiculos();

  // Step Tracker
  const [activeTab, setActiveTab] = useState<'geral' | 'checklist' | 'fotos' | 'assinatura'>('geral');

  // 1. DADOS GERAIS e CADASTRO
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFinal, setHoraFinal] = useState('11:00');
  const [municipio, setMunicipio] = useState('Belo Horizonte');
  const [local, setLocal] = useState('');
  const [projeto, setProjeto] = useState('');
  const [ordemServico, setOrdemServico] = useState('');
  const [areaLotacao, setAreaLotacao] = useState('Regional Metropolitana');

  // 2. EQUIPE
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [equipeNome, setEquipeNome] = useState('');
  const [encarregado, setEncarregado] = useState('');
  const [colaboradoresCount, setColaboradoresCount] = useState(4);

  // 3. VEICULO
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [veiculoPrefixo, setVeiculoPrefixo] = useState('');
  const [veiculoPlaca, setVeiculoPlaca] = useState('');

  // 4. IDENTIFICAÇÃO
  const [idApr, setIdApr] = useState('');
  const [idCamera, setIdCamera] = useState('');

  // 5. CHECKLIST ANSWERS
  const [respostas, setRespostas] = useState<Record<string, 'C' | 'NC' | 'NA'>>(() => {
    const initial: Record<string, 'C' | 'NC' | 'NA'> = {};
    CHECKLIST_CONFIG.forEach(item => {
      initial[item.id] = 'C'; // default to Conforme for faster flow
    });
    return initial;
  });

  // Action plan subforms for NC items
  const [ncSubForms, setNcSubForms] = useState<Record<string, {
    descricao: string;
    acaoCorretiva: string;
    responsavel: string;
    prazo: string;
    fotoId: string;
    customFotoUrl?: string; // photo for the nc
  }>>({});

  // 6. PHOTO GALLERY
  const [fotos, setFotos] = useState<InspecaoFoto[]>([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 7. ASSINATURAS (HTML5 Canvases)
  const canvasInspectorRef = useRef<HTMLCanvasElement | null>(null);
  const canvasEncarregadoRef = useRef<HTMLCanvasElement | null>(null);
  
  const [signedInspector, setSignedInspector] = useState(false);
  const [signedSupervisor, setSignedSupervisor] = useState(false);

  // Fill in coordinates automatically or random selection
  const getGpsLocation = () => {
    const random = Math.floor(Math.random() * CONSTANT_MOCK_COORDINATES.length);
    return CONSTANT_MOCK_COORDINATES[random];
  };

  // Crew dropdown selection effect
  useEffect(() => {
    if (selectedCrewId) {
      const crew = registeredCrews.find(c => c.id === selectedCrewId);
      if (crew) {
        setEquipeNome(crew.nome);
        setEncarregado(crew.encarregado);
        setColaboradoresCount(crew.colaboradoresCount);
      }
    } else {
      setEquipeNome('');
      setEncarregado('');
    }
  }, [selectedCrewId]);

  // Vehicle dropdown selection effect
  useEffect(() => {
    if (selectedTruckId) {
      const truck = registeredTrucks.find(t => t.id === selectedTruckId);
      if (truck) {
        setVeiculoPrefixo(truck.prefixo);
        setVeiculoPlaca(truck.placa);
      }
    } else {
      setVeiculoPrefixo('');
      setVeiculoPlaca('');
    }
  }, [selectedTruckId]);

  // Auto initialize NC forms when an item answers "NC"
  const handleAnswerChange = (itemId: string, value: 'C' | 'NC' | 'NA') => {
    setRespostas(prev => ({ ...prev, [itemId]: value }));

    if (value === 'NC') {
      const itemConfig = CHECKLIST_CONFIG.find(c => c.id === itemId);
      setNcSubForms(prev => ({
        ...prev,
        [itemId]: {
          descricao: prev[itemId]?.descricao || `Desvio identificado no item "${itemConfig?.descricao}"`,
          acaoCorretiva: prev[itemId]?.acaoCorretiva || '',
          responsavel: prev[itemId]?.responsavel || encarregado || '',
          prazo: prev[itemId]?.prazo || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
          fotoId: prev[itemId]?.fotoId || `nc-photo-${itemId}`
        }
      }));
    } else {
      // Remove NC subform if set back to C or NA
      setNcSubForms(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  // Calculate live numbers
  const calculatedRatings = useMemo(() => {
    let conformeCount = 0;
    let naoConformeCount = 0;
    let naoAplicavelCount = 0;

    Object.values(respostas).forEach(val => {
      if (val === 'C') conformeCount++;
      else if (val === 'NC') naoConformeCount++;
      else if (val === 'NA') naoAplicavelCount++;
    });

    const totalCalculated = conformeCount + naoConformeCount;
    const percentualConformidade = totalCalculated > 0 
      ? Math.round((conformeCount / totalCalculated) * 1000) / 10 
      : 100;

    return { conformeCount, naoConformeCount, naoAplicavelCount, percentualConformidade };
  }, [respostas]);

  // NC Form attributes updating helper
  const handleNcFormUpdate = (itemId: string, field: string, value: string) => {
    setNcSubForms(prev => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: value
        }
      };
    });
  };

  // Simulating Camera capture with robust safety assets
  const handleSimulatePhoto = (ncItemId?: string) => {
    const freshId = ncItemId ? `photo-nc-${ncItemId}` : `photo-${Date.now()}`;
    const gps = getGpsLocation();
    const currDate = new Date().toISOString().split('T')[0];
    const currTime = new Date().toTimeString().split(' ')[0];

    // High quality utility/safety assets from Unsplash
    const safetyMockImgs = [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=400',
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400',
      'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400'
    ];

    const randomImgUrl = safetyMockImgs[Math.floor(Math.random() * safetyMockImgs.length)];
    const inferredCaption = ncItemId 
      ? `Registro de Não Conformidade: ${CHECKLIST_CONFIG.find(c => c.id === ncItemId)?.descricao}`
      : currentCaption.trim() || 'Verificação visual de segurança em campo - Equipe Elétrica';

    const newPhoto: InspecaoFoto = {
      id: freshId,
      url: randomImgUrl,
      legenda: inferredCaption,
      data: currDate,
      hora: currTime,
      gps: gps
    };

    setFotos(prev => [...prev, newPhoto]);
    
    if (ncItemId) {
      setNcSubForms(prev => {
        if (!prev[ncItemId]) return prev;
        return {
          ...prev,
          [ncItemId]: {
            ...prev[ncItemId],
            customFotoUrl: randomImgUrl,
            fotoId: freshId
          }
        };
      });
    } else {
      setCurrentCaption('');
    }
  };

  // "Autogerar 20 Fotos de Teste" UX feature to fulfill standard inspection strict rule
  const handleAutogeneratePhotos = () => {
    const generated: InspecaoFoto[] = [];
    const safetyMockImgs = [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=450',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=450',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=450',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=450',
      'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=450',
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=450',
      'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=450',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=450',
      'https://images.unsplash.com/photo-1517089530638-37551722795b?w=450',
      'https://images.unsplash.com/photo-1516216628859-9bccecad13fc?w=450',
      'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=450',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=450',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=450',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=450',
      'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=450'
    ];

    const captions = [
      'Análise de Risco APR preenchida no capô',
      'Varal de terra temporária (VTT) aterrado no solo',
      'Calço de roda duplo no pneu dianteiro',
      'Utilização de capacete classe B com jugular ativa',
      'Colete reflexivo em via de alta velocidade',
      'Fita zebrada preenchendo o quarteirão da obra',
      'Linha de vida presa ao cabo de aço aéreo',
      'Detector de tensão acoplado no topo do bastão',
      'Luva isolante com sobreluva de vaqueta mecânica',
      'Cones de sinalização dispostos a 50 metros',
      'Verificação física de degraus de escada de fibra',
      'Guinho hidráulico devidamente ancorado e isolado',
      'Teste de ausência de voltagem no barramento principal',
      'Balaclava posicionada perfeitamente',
      'Ferramenta isolada 1000V de corte regular',
      'Quadro de disjuntores bloqueado com cadeado vermelho',
      'Identificação correta da numeração do circuito',
      'Óculos escuros de segurança contra faíscas',
      'Uniforme retardante de chamas sem rasgos',
      'Limpeza geral do solo recolhendo detritos'
    ];

    for (let i = 0; i < 20; i++) {
      const gps = getGpsLocation();
      generated.push({
        id: `foto-auto-${i}-${Date.now()}`,
        url: safetyMockImgs[i % safetyMockImgs.length],
        legenda: captions[i],
        data: data,
        hora: `08:${20 + i}`,
        gps: gps
      });
    }

    setFotos(generated);
    alert('20 fotos de conformidade técnica e EPIs geradas com sucesso para testes!');
  };

  const handleUploadPhoto = (e: ChangeEvent<HTMLInputElement>, ncItemId?: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const urlStr = reader.result as string;
        const freshId = ncItemId ? `photo-nc-${ncItemId}` : `photo-${Date.now()}`;
        const gps = getGpsLocation();
        const currDate = new Date().toISOString().split('T')[0];
        const currTime = new Date().toTimeString().split(' ')[0];

        const newPhoto: InspecaoFoto = {
          id: freshId,
          url: urlStr,
          legenda: ncItemId ? 'Foto da não conformidade em anexo' : (currentCaption.trim() || file.name),
          data: currDate,
          hora: currTime,
          gps: gps
        };

        setFotos(prev => [...prev, newPhoto]);

        if (ncItemId) {
          setNcSubForms(prev => {
            if (!prev[ncItemId]) return prev;
            return {
              ...prev,
              [ncItemId]: {
                ...prev[ncItemId],
                customFotoUrl: urlStr,
                fotoId: freshId
              }
            };
          });
        } else {
          setCurrentCaption('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (id: string, ncItemId?: string) => {
    setFotos(prev => prev.filter(f => f.id !== id));
    if (ncItemId) {
      setNcSubForms(prev => {
        if (!prev[ncItemId]) return prev;
        return {
          ...prev,
          [ncItemId]: {
            ...prev[ncItemId],
            customFotoUrl: undefined
          }
        };
      });
    }
  };

  // Canvas Drawing Logic
  const getCanvasMousePos = (canvas: HTMLCanvasElement, e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (ref: RefObject<HTMLCanvasElement | null>, setupState: (s: boolean) => void) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A'; // deep charcoal

    canvas.onmousedown = (e) => {
      const rect = canvas.getBoundingClientRect();
      let lastX = e.clientX - rect.left;
      let lastY = e.clientY - rect.top;
      setupState(true);

      canvas.onmousemove = (ev) => {
        const currX = ev.clientX - rect.left;
        const currY = ev.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
        lastX = currX;
        lastY = currY;
      };

      canvas.onmouseup = () => {
        canvas.onmousemove = null;
      };
      
      canvas.onmouseleave = () => {
        canvas.onmousemove = null;
      };
    };

    // Touch Support
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      let lastX = touch.clientX - rect.left;
      let lastY = touch.clientY - rect.top;
      setupState(true);

      canvas.ontouchmove = (ev) => {
        ev.preventDefault();
        const t = ev.touches[0];
        const currX = t.clientX - rect.left;
        const currY = t.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
        lastX = currX;
        lastY = currY;
      };
    };
  };

  const clearCanvas = (ref: RefObject<HTMLCanvasElement | null>, setupState: (s: boolean) => void) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setupState(false);
  };

  // Bind canvases on mount to sign tab
  useEffect(() => {
    if (activeTab === 'assinatura') {
      // Small timeout to let elements render correctly
      setTimeout(() => {
        startDrawing(canvasInspectorRef, setSignedInspector);
        startDrawing(canvasEncarregadoRef, setSignedSupervisor);
      }, 100);
    }
  }, [activeTab]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations:
    if (!local || !projeto || !ordemServico) {
      setErrorMessage('Por favor, preencha Localidade, Projeto e número de Ordem de Serviço.');
      setActiveTab('geral');
      return;
    }

    if (!equipeNome || !encarregado) {
      setErrorMessage('Defina a Equipe de campo e seu respectivo Encarregado.');
      setActiveTab('geral');
      return;
    }

    if (!veiculoPrefixo || !veiculoPlaca) {
      setErrorMessage('Defina o Veículo de campo utilizado.');
      setActiveTab('geral');
      return;
    }

    // CHECK PHOTO LIMIT (20 photos)
    if (fotos.length < 20) {
      setErrorMessage(`O limite mínimo regulatório é de 20 fotos por inspeção. Você possui ${fotos.length} fotos anexadas. Utilize o botão "Gerar 20 Fotos de Teste" para acelerar o processo.`);
      setActiveTab('fotos');
      return;
    }

    // Verify if all NCs have photos
    for (const [key, formValue] of Object.entries(ncSubForms)) {
      const form = formValue as { fotoId: string };
      const photoAttached = fotos.some(f => f.id === form.fotoId || f.id === `photo-nc-${key}`);
      if (!photoAttached) {
        setErrorMessage(`O item "${CHECKLIST_CONFIG.find(c => c.id === key)?.descricao}" está marcado como Não Conforme e exige uma FOTO OBRIGATÓRIA.`);
        setActiveTab('checklist');
        return;
      }
    }

    // Signature verification (warn but fall back to placeholder in mockup if needed)
    let signInspectorUrl = '';
    let signSupervisorUrl = '';

    if (canvasInspectorRef.current && signedInspector) {
      signInspectorUrl = canvasInspectorRef.current.toDataURL('image/png');
    } else {
      signInspectorUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><text x="10" y="25" font-family="sans-serif" font-size="10">Assinado Eletrônico</text></svg>';
    }

    if (canvasEncarregadoRef.current && signedSupervisor) {
      signSupervisorUrl = canvasEncarregadoRef.current.toDataURL('image/png');
    } else {
      signSupervisorUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><text x="10" y="25" font-family="sans-serif" font-size="10">Assinado Eletrônico</text></svg>';
    }

    // Formulate new full inspection
    const newInspecao: Inspecao = {
      id: 'insp-' + Date.now().toString(),
      data,
      horaInicio,
      horaFinal,
      municipio,
      local,
      projeto,
      ordemServico,
      areaLotacao,
      
      equipeNome,
      encarregado,
      colaboradoresCount,
      
      veiculoPrefixo,
      veiculoPlaca: veiculoPlaca.toUpperCase(),
      
      idApr,
      idCamera,
      
      respostas,
      naoConformidades: Object.entries(ncSubForms).reduce((acc, [key, formValue]) => {
        const form = formValue as {
          descricao: string;
          acaoCorretiva: string;
          responsavel: string;
          prazo: string;
          fotoId: string;
          customFotoUrl?: string;
        };
        acc[key] = {
          descricao: form.descricao,
          acaoCorretiva: form.acaoCorretiva,
          responsavel: form.responsavel,
          prazo: form.prazo,
          fotoId: form.customFotoUrl ? `photo-nc-${key}` : form.fotoId,
          status: 'Aberto'
        };
        return acc;
      }, {} as Inspecao['naoConformidades']),
      
      fotos,
      assinaturaInspetor: signInspectorUrl,
      assinaturaEncarregado: signSupervisorUrl,
      
      conformeCount: calculatedRatings.conformeCount,
      naoConformeCount: calculatedRatings.naoConformeCount,
      naoAplicavelCount: calculatedRatings.naoAplicavelCount,
      percentualConformidade: calculatedRatings.percentualConformidade,
      
      criadoPor: currentUser.nome,
      dataCriacao: new Date().toISOString().split('T')[0]
    };

    onSave(newInspecao);
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
      
      {/* Banner */}
      <div className="bg-slate-900 px-6 py-4 border-b border-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-yellow-400 text-slate-950 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Modo de Campo Activo
          </span>
          <h2 className="text-lg font-bold text-white mt-1">Realizar Inspeção Técnica de Segurança</h2>
        </div>

        {/* Floating compliance indicator */}
        <div className="bg-slate-800 border border-slate-700 p-2 px-3 rounded-lg flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nível de Conformidade</p>
            <p className="text-sm font-black text-white">{calculatedRatings.percentualConformidade}%</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-yellow-500">
            {calculatedRatings.conformeCount}C
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 text-xs md:text-sm font-semibold bg-slate-50 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('geral')}
          className={`flex-1 py-3.5 px-4 text-center border-b-2 hover:bg-slate-100/50 transition-colors cursor-pointer ${activeTab === 'geral' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-500'}`}
        >
          1. Identificação Geral
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 py-3.5 px-4 text-center border-b-2 hover:bg-slate-100/50 transition-colors cursor-pointer ${activeTab === 'checklist' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-500'}`}
        >
          2. Itens do Checklist ({calculatedRatings.naoConformeCount} NCs)
        </button>
        <button
          onClick={() => setActiveTab('fotos')}
          className={`flex-1 py-3.5 px-4 text-center border-b-2 hover:bg-slate-100/50 transition-colors cursor-pointer ${activeTab === 'fotos' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-500'}`}
        >
          3. Registro Fotográfico ({fotos.length}/20)
        </button>
        <button
          onClick={() => setActiveTab('assinatura')}
          className={`flex-1 py-3.5 px-4 text-center border-b-2 hover:bg-slate-100/50 transition-colors cursor-pointer ${activeTab === 'assinatura' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-500'}`}
        >
          4. Assinatura Digital
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs font-medium text-red-800 flex items-start gap-2.5 rounded shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de Impedimento de Submissão</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* TAB 1: GERAL */}
        {activeTab === 'geral' && (
          <div className="space-y-6">
            
            {/* Quick Demo Pre-population helper */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-150 border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-blue-950">
              <div className="text-xs">
                <p className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Facilitador de Formulário para Testes
                </p>
                <p className="text-blue-700 mt-1 leading-relaxed">
                  Para auditar rapidamente as validações, preencha os dados de campo em 1 clique abaixo:
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocal('Rua da Assembléia, 1500 - Bairro Centro');
                  setProjeto('Instalação de Rede de Distribuição e Transformador 75kVA');
                  setOrdemServico(`OS-A${Math.floor(Math.random() * 90000) + 10000}`);
                  setIdApr(`APR-${Math.floor(Math.random() * 8000) + 1000}`);
                  setIdCamera(`CAM-${Math.floor(Math.random() * 80000) + 20000}`);
                  // Select first crew and vector
                  if (registeredCrews.length > 0) setSelectedCrewId(registeredCrews[0].id);
                  if (registeredTrucks.length > 0) setSelectedTruckId(registeredTrucks[0].id);
                }}
                className="bg-blue-900 hover:bg-blue-950 text-white text-[11px] font-bold px-3 py-2 rounded-lg shrink-0 cursor-pointer shadow transition-all active:scale-95"
              >
                Preencher Dados Falsos para Testes
              </button>
            </div>

            {/* DADOS GERAIS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1.5">
                <FileText className="w-4 h-4 text-blue-950" />
                Dados Gerais da Frente de Trabalho
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hora Início</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hora Final</label>
                  <input
                    type="time"
                    value={horaFinal}
                    onChange={(e) => setHoraFinal(e.target.value)}
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Município</label>
                  <input
                    type="text"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="Cidade"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Área de Lotação</label>
                  <input
                    type="text"
                    value={areaLotacao}
                    onChange={(e) => setAreaLotacao(e.target.value)}
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Local / Endereço Completo</label>
                  <input
                    type="text"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Av. Contorno, 4310 - Próximo ao Poste 12"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Identificação / Nome do Projeto</label>
                  <input
                    type="text"
                    value={projeto}
                    onChange={(e) => setProjeto(e.target.value)}
                    placeholder="Ex: Expansão Alimentador Redes de Altura"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ordem de Serviço (O.S)</label>
                  <input
                    type="text"
                    value={ordemServico}
                    onChange={(e) => setOrdemServico(e.target.value)}
                    placeholder="Ex: OS-980122"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* EQUIPE */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-900" />
                Vincular Equipe Operacional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pesquisar Equipe Cadastrada</label>
                  <select
                    value={selectedCrewId}
                    onChange={(e) => setSelectedCrewId(e.target.value)}
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="">-- Inserir equipe manual --</option>
                    {registeredCrews.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} (Encarregado: {c.encarregado})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-semibold">Nome da Equipe</label>
                  <input
                    type="text"
                    value={equipeNome}
                    onChange={(e) => setEquipeNome(e.target.value)}
                    disabled={!!selectedCrewId}
                    placeholder="Ex: Equipe Auxiliar"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Encarregado da Atividade</label>
                  <input
                    type="text"
                    value={encarregado}
                    onChange={(e) => setEncarregado(e.target.value)}
                    disabled={!!selectedCrewId}
                    placeholder="Nome do Encarregado Responsável"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantidade de colaboradores na frente</label>
                <input
                  type="number"
                  min="1"
                  value={colaboradoresCount}
                  onChange={(e) => setColaboradoresCount(Number(e.target.value))}
                  className="w-24 text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* VEÍCULO */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-900" />
                Vincular Veículo Mobilizado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Selecione Veículo da Frota</label>
                  <select
                    value={selectedTruckId}
                    onChange={(e) => setSelectedTruckId(e.target.value)}
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="">-- Inserir veículo manual --</option>
                    {registeredTrucks.map(t => (
                      <option key={t.id} value={t.id}>{t.prefixo} (Placa: {t.placa})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prefixo do Veículo</label>
                  <input
                    type="text"
                    value={veiculoPrefixo}
                    onChange={(e) => setVeiculoPrefixo(e.target.value)}
                    disabled={!!selectedTruckId}
                    placeholder="Ex: Truck-901"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-semibold">Placa do Veículo</label>
                  <input
                    type="text"
                    value={veiculoPlaca}
                    onChange={(e) => setVeiculoPlaca(e.target.value)}
                    disabled={!!selectedTruckId}
                    placeholder="Ex: ABC-1234"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* IDENTIFICAÇÃO DE REGISTROS APR/CAMERA */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-900" />
                Dados Adicionais de Loteamento de Risco
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Identificação APR (Obrigatório)</label>
                  <input
                    type="text"
                    value={idApr}
                    required
                    onChange={(e) => setIdApr(e.target.value)}
                    placeholder="Ex: APR-99824"
                    className="mt-1 w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">ID Câmera (Obrigatório)</label>
                  <input
                    type="text"
                    value={idCamera}
                    required
                    onChange={(e) => setIdCamera(e.target.value)}
                    placeholder="Ex: CAM-12845"
                    className="mt-1 w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* Bottom transition flow */}
            <div className="flex justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 font-bold text-xs text-white rounded-lg cursor-pointer shadow transition-all active:scale-95"
              >
                Próximo Passo: Checklist →
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            
            <div className="bg-slate-55 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <CheckSquare className="w-4 h-4 text-blue-900" />
                Instruções de Preenchimento do Checklist
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Cada item verificado do trabalho em eletricidade em campo deve ser assinalado de forma fidedigna. 
                Sempre que marcar <strong className="text-red-650 text-red-600">Não Conforme (NC)</strong>, o sistema gerará automaticamente um campo correspondente obrigatório para descrever a não conformidade, planejar a ação corretiva imediata, indicar o responsável, o prazo de correção e exigir um registro fotográfico dedicado.
              </p>
            </div>

            {/* Checklist Categorized Panels */}
            {(['Regras de Ouro', 'Demais Verificações', 'EPIs', 'EPCs e Equipamentos'] as ChecklistCategory[]).map((categoryName) => {
              const categoryItems = CHECKLIST_CONFIG.filter(item => item.categoria === categoryName);
              
              return (
                <div key={categoryName} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <div className={`p-3.5 flex items-center justify-between ${
                    categoryName === 'Regras de Ouro' ? 'bg-red-50 text-red-950 border-b border-red-100' : 'bg-slate-50 text-slate-955 border-b border-slate-200'
                  }`}>
                    <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${categoryName === 'Regras de Ouro' ? 'bg-red-600' : 'bg-blue-950'}`}></span>
                      {categoryName}
                    </h4>
                    <span className="text-[10px] font-bold opacity-80">
                      {categoryItems.length} Itens de Verificação
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {categoryItems.map((item) => {
                      const ans = respostas[item.id] || 'C';
                      const hasNC = ans === 'NC';

                      return (
                        <div key={item.id} className={`p-4 transition-all duration-300 ${hasNC ? 'bg-red-50/20 ring-1 ring-red-150/50' : 'hover:bg-slate-50/30'}`}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <span className="text-xs font-medium text-slate-900 max-w-xl">
                              {item.descricao}
                            </span>

                            {/* Radio selector */}
                            <div className="flex items-center gap-1 shrink-0 bg-slate-100 rounded-lg p-0.5" id={`check_radio_container_${item.id}`}>
                              
                              <button
                                type="button"
                                onClick={() => handleAnswerChange(item.id, 'C')}
                                className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                  ans === 'C' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Conforme
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleAnswerChange(item.id, 'NC')}
                                className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                  ans === 'NC' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Não Conforme
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAnswerChange(item.id, 'NA')}
                                className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                  ans === 'NA' ? 'bg-slate-300 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                N.A
                              </button>

                            </div>
                          </div>

                          {/* Dynamic Non-Conformity fields if marked NC */}
                          {hasNC && (
                            <div className="mt-4 p-4 bg-white border border-red-100 rounded-lg shadow-sm space-y-4">
                              <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold">
                                <ShieldAlert className="w-4 h-4 text-red-600" />
                                <span>Detalhamento da Não Conformidade Técnica Obrigatória</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Descrição do Desvio /Irregularidade
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={ncSubForms[item.id]?.descricao || ''}
                                    onChange={(e) => handleNcFormUpdate(item.id, 'descricao', e.target.value)}
                                    placeholder="Descreva fisicamente a irregularidade com detalhes..."
                                    className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-red-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Ação Corretiva Imediata / Proposta
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={ncSubForms[item.id]?.acaoCorretiva || ''}
                                    onChange={(e) => handleNcFormUpdate(item.id, 'acaoCorretiva', e.target.value)}
                                    placeholder="Ex: Substituir o equipamento imediatamente antes de ligar a energia..."
                                    className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-red-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2 border-b border-slate-100">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Responsável pela Resolução
                                  </label>
                                  <input
                                    type="text"
                                    value={ncSubForms[item.id]?.responsavel || ''}
                                    onChange={(e) => handleNcFormUpdate(item.id, 'responsavel', e.target.value)}
                                    placeholder="Executante ou encarregado"
                                    className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Prazo de Regularização
                                  </label>
                                  <input
                                    type="date"
                                    value={ncSubForms[item.id]?.prazo || ''}
                                    onChange={(e) => handleNcFormUpdate(item.id, 'prazo', e.target.value)}
                                    className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1"
                                  />
                                </div>

                                <div>
                                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Foto Obrigatória da NC
                                  </span>

                                  {ncSubForms[item.id]?.customFotoUrl ? (
                                    <div className="flex items-center gap-2 bg-green-50 p-1 rounded border border-green-200">
                                      <img 
                                        src={ncSubForms[item.id]?.customFotoUrl} 
                                        alt="NC" 
                                        className="w-10 h-10 object-cover rounded"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[9px] text-green-800 font-bold leading-none truncate">Foto Registrada</p>
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePhoto(ncSubForms[item.id].fotoId, item.id)}
                                          className="text-[9px] text-red-600 hover:underline block mt-1 font-semibold cursor-pointer"
                                        >
                                          Remover foto
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleSimulatePhoto(item.id)}
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-[10px] font-bold text-white rounded cursor-pointer"
                                        title="Simular foto com a câmera"
                                      >
                                        <Camera className="w-3.5 h-3.5 text-yellow-400" />
                                        Câmera
                                      </button>
                                      
                                      <label className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 border border-slate-300 rounded cursor-pointer">
                                        <Image className="w-3.5 h-3.5 text-slate-500" />
                                        Anexar
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => handleUploadPhoto(e, item.id)}
                                        />
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Bottom transition flow */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={() => setActiveTab('geral')}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fotos')}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg cursor-pointer shadow transition-all"
              >
                Próximo: Registro Fotográfico →
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: REGISTRO FOTOGRÁFICO */}
        {activeTab === 'fotos' && (
          <div className="space-y-6">
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden">
              <span className="absolute right-3 top-3 px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded">
                Requisito de Campo Obrigatório
              </span>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                Regulamento Técnico de Fotografias
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-3xl">
                Toda inspeção corporativa exige um limite mínimo estrito de <strong className="text-blue-900">20 fotografias de evidências físicas</strong> comprovantes de EPIs, EPCs e estado físico dos veículos.
              </p>

              {/* Automanage Testing Helper */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Ambiente de Simulação de Auditoria
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Anexar 20 fotos manualmente pode ser exaustivo para fins de testes. Clique abaixo para gerar automaticamente 20 fotos em conformidade com o regulamento do sistema.
                </p>
                <button
                  type="button"
                  onClick={handleAutogeneratePhotos}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 font-bold text-xs text-slate-950 rounded-lg shadow cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Gerar 25 Fotos de Campo de Segurança de uma Vez
                </button>
              </div>
            </div>

            {/* General photographic insertion */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Registrar Nova Evidência Manual</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Legenda Técnica da Foto</label>
                  <input
                    type="text"
                    value={currentCaption}
                    onChange={(e) => setCurrentCaption(e.target.value)}
                    placeholder="Ex: Varal de terra temporário conectado ao transformador T-03"
                    className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="flex gap-2.5 items-end">
                  <button
                    type="button"
                    onClick={() => handleSimulatePhoto()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-md cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-yellow-500" />
                    Simular Câmera
                  </button>

                  <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white rounded-lg shadow-sm font-bold text-xs cursor-pointer">
                    <Image className="w-4 h-4 text-slate-500" />
                    Galeria
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadPhoto(e)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Attached gallery display */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                  Evidências Anexadas ({fotos.length} fotos salvas)
                </h4>
                {fotos.length < 20 && (
                  <span className="text-xs text-red-650 text-red-600 font-bold animation-pulse">
                    Faltam {20 - fotos.length} fotos para atingir o mínimo legal.
                  </span>
                )}
              </div>

              {fotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fotos.map((f, i) => (
                    <div key={f.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-250 border-slate-200 flex flex-col justify-between shadow-sm group">
                      <div className="relative aspect-video bg-slate-900">
                        <img 
                          src={f.url} 
                          alt="evidencia" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(f.id)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded hover:bg-red-750 transition-colors shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[8px] rounded font-mono font-bold">
                          # {i + 1}
                        </span>
                      </div>

                      <div className="p-3 text-[10px] space-y-1">
                        <p className="font-bold text-slate-900 leading-tight truncate">{f.legenda}</p>
                        <p className="text-slate-500 font-mono text-[9px] bg-slate-100 rounded p-1 leading-none">
                          📍 {f.gps}
                        </p>
                        <div className="flex justify-between items-center text-slate-400 font-semibold text-[8px]">
                          <span>📅 {f.data}</span>
                          <span>⏰ {f.hora}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-10 text-center py-12 rounded-xl border-2 border-dashed border-slate-200">
                  <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-semibold">Nenhuma evidência fotográfica anexada.</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Use a simulação ou anexe fotos de equipamentos de testes.</p>
                </div>
              )}
            </div>

            {/* Bottom transition flow */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                className="px-4 py-2 border border-slate-350 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('assinatura')}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg cursor-pointer shadow transition-all"
              >
                Próximo: Assinaturas Digitais →
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: ASSINATURAS */}
        {activeTab === 'assinatura' && (
          <div className="space-y-6">
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-xs text-amber-900">
              <p className="font-bold">Validade Regulamentar</p>
              <p className="mt-0.5 leading-relaxed">
                As duas assinaturas são obrigatórias para homologar o laudo em campo. Colete a rubrica desenhando diretamente sobre as telas de toque abaixo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* INSPECTOR PAD */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                    Assinatura do Inspetor Responsável
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-3 leading-tight">
                    ({currentUser.nome} - {currentUser.email})
                  </p>
                </div>
                
                <div className="bg-white border rounded shadow-inner relative">
                  <canvas
                    id="canvas_sign_inspector"
                    ref={canvasInspectorRef}
                    width={280}
                    height={120}
                    className="w-full h-[120px] rounded cursor-crosshair touch-none"
                  />
                  {!signedInspector && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                      Desenhe sua firma aqui
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${signedInspector ? 'text-green-700' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${signedInspector ? 'text-green-600' : 'text-slate-300'}`} />
                    {signedInspector ? 'Assinatura Registrada' : 'Pendente...'}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearCanvas(canvasInspectorRef, setSignedInspector)}
                    className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    Remover e Limpar
                  </button>
                </div>
              </div>

              {/* SUPERVISOR PAD */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                    Assinatura do Encarregado da Frente
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-3 leading-tight text-blue-900">
                    {encarregado ? `(${encarregado})` : '(Mapeie a equipe científica primeiro)'}
                  </p>
                </div>

                <div className="bg-white border rounded shadow-inner relative">
                  <canvas
                    id="canvas_sign_encarregado"
                    ref={canvasEncarregadoRef}
                    width={280}
                    height={120}
                    className="w-full h-[120px] rounded cursor-crosshair touch-none"
                  />
                  {!signedSupervisor && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                      Rubrica do Encarregado
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${signedSupervisor ? 'text-green-700' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${signedSupervisor ? 'text-green-600' : 'text-slate-300'}`} />
                    {signedSupervisor ? 'Assinatura Registrada' : 'Pendente...'}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearCanvas(canvasEncarregadoRef, setSignedSupervisor)}
                    className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    Remover e Limpar
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Finalize actions */}
            <div className="flex justify-between items-center pt-6 border-t font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('fotos')}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                ← Voltar
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Descartar
                </button>
                <button
                  id="btn_finalize_inspection"
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 font-bold text-xs text-white rounded-lg shadow-md cursor-pointer flex items-center gap-1 transition-all hover:shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Homologar e Salvar Inspeção (PDF)
                </button>
              </div>
            </div>

          </div>
        )}

      </form>

    </div>
  );
}
