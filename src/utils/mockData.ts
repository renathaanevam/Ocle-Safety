import { Usuario, Equipe, Veiculo, Inspecao, PlanoAcao } from '../types';
import { CHECKLIST_CONFIG } from './checklistConfig';

// Seeding standard accounts
export const DEFAULT_USERS: Usuario[] = [
  { id: '1', nome: 'Renatha Admin (Admin)', email: 'admin@ocle.com', perfil: 'admin', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: '2', nome: 'Carlos Silva (Inspetor)', email: 'inspector@ocle.com', perfil: 'inspector', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '3', nome: 'Mariana Costa (Gestora)', email: 'gestor@ocle.com', perfil: 'gestor', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' }
];

// Initial mock teams
const INITIAL_EQUIPES: Equipe[] = [
  { id: 'eq-01', nome: 'Equipe Alfa Linha Viva', encarregado: 'Jorge de Souza', colaboradoresCount: 5, contrato: 'C-20042-CEMIG', regiao: 'Zona da Mata' },
  { id: 'eq-02', nome: 'Equipe Beta Manutenção', encarregado: 'Amarildo Pereira', colaboradoresCount: 4, contrato: 'C-21094-CEMIG', regiao: 'Sul de Minas' },
  { id: 'eq-03', nome: 'Equipe Gama Podas', encarregado: 'Sebastião Antunes', colaboradoresCount: 3, contrato: 'C-18302-CEMIG', regiao: 'Triângulo Mineiro' },
  { id: 'eq-04', nome: 'Equipe Delta Construção', encarregado: 'Felipe Marques', colaboradoresCount: 6, contrato: 'C-20412-CEMIG', regiao: 'Grande BH' }
];

// Initial mock vehicles
const INITIAL_VEICULOS: Veiculo[] = [
  { id: 'v-01', prefixo: 'LV-4202', placa: 'PUM-5G42', tipo: 'Hidroelevador Duplo Cesto (NR12)', situacao: 'Liberado', ultimaInspecao: '2026-05-20' },
  { id: 'v-02', prefixo: 'MAN-9012', placa: 'QOX-8B19', tipo: 'Caminhão Guauto Traçado', situacao: 'Liberado', ultimaInspecao: '2026-05-18' },
  { id: 'v-03', prefixo: 'POD-3301', placa: 'GTE-3392', tipo: 'Plataforma Elevatória', situacao: 'Restrição', ultimaInspecao: '2026-05-25' },
  { id: 'v-04', prefixo: 'LV-1004', placa: 'RTS-4F12', tipo: 'Cesta Hidráulica Simples', situacao: 'Bloqueado', ultimaInspecao: '2026-05-10' }
];

// Generate an inspection from history to populate dashboard stats
const INITIAL_INSPECOES: Inspecao[] = [
  {
    id: 'insp-01',
    data: '2026-05-28',
    horaInicio: '08:30',
    horaFinal: '10:00',
    municipio: 'Juiz de Fora',
    local: 'Rua São Mateus, 412',
    projeto: 'Expansão Alimentador JF-03',
    ordemServico: 'OS-884021',
    areaLotacao: 'Regional Zona da Mata',
    equipeNome: 'Equipe Alfa Linha Viva',
    encarregado: 'Jorge de Souza',
    colaboradoresCount: 5,
    veiculoPrefixo: 'LV-4202',
    veiculoPlaca: 'PUM-5G42',
    idApr: 'APR-99520',
    idCamera: 'CAM-8849',
    respostas: {
      apr: 'C',
      recusa: 'C',
      comunicar: 'C',
      testar: 'C',
      aterrar: 'C',
      corda_vida: 'C',
      estai_temporario: 'NA',
      equipe_suficiente: 'C',
      vmc: 'C',
      pop_atualizado: 'C',
      veiculo: 'C',
      hidroelevador_nr12: 'NC', // NC to generate a plan
      transito: 'C',
      estacionamento: 'C',
      sinalizacao_delimitacao: 'C',
      acesso_altura: 'C',
      resgate: 'C',
      adornos: 'C',
      operacao_chaves: 'C',
      distancia_seguranca: 'C',
      linha_viva: 'C',
      poda_rocada: 'NA',
      epi_capacete: 'C',
      epi_oculos: 'C',
      epi_calcado: 'C',
      epi_luva_vaqueta: 'C',
      epi_uniforme: 'C',
      epi_luvas_isolantes: 'NC', // NC also
      epi_conjunto_impermeavel: 'C',
      epi_oculos_graduados: 'NA',
      epi_protetor_facial: 'C',
      epi_balaclava: 'C',
      epc_vtt: 'C',
      epc_bastao_glv: 'C',
      epc_coberturas: 'C',
      epc_aterramento: 'C',
      epc_detector_tensao: 'C',
      epc_volt_amperimetro: 'C',
      epc_daqc: 'C',
      epc_multifuncional: 'C'
    },
    naoConformidades: {
      hidroelevador_nr12: {
        descricao: 'Vazamento leve de óleo hidráulico no pistão de elevação e comando sensível demais.',
        acaoCorretiva: 'Proceder com a troca das gaxetas de vedação na oficina autorizada.',
        responsavel: 'Alisson Castro (Manutenção)',
        prazo: '2026-06-05',
        fotoId: 'foto-nc-1',
        status: 'Em andamento'
      },
      epi_luvas_isolantes: {
        descricao: 'Luvas da classe 2 de borracha apresentando ressecamento visível na borda superior.',
        acaoCorretiva: 'Substituir o par de luvas isolantes imediatamente no almoxarifado regional.',
        responsavel: 'Jorge de Souza (Encarregado)',
        prazo: '2026-05-29',
        fotoId: 'foto-nc-2',
        status: 'Concluído'
      }
    },
    fotos: [
      {
        id: 'foto-nc-1',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        legenda: 'Vazamento de fluido no cilindro do hidroelevador',
        data: '2026-05-28',
        hora: '08:45',
        gps: '-21.7642, -43.3508'
      },
      {
        id: 'foto-nc-2',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
        legenda: 'Desgaste e ressecamento na extremidade da luva isolante class B',
        data: '2026-05-28',
        hora: '09:02',
        gps: '-21.7645, -43.3512'
      }
    ],
    assinaturaInspetor: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q30,5 50,35 T90,10" fill="none" stroke="black" stroke-width="2"/></svg>',
    assinaturaEncarregado: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M5,15 Q35,35 65,10 T95,30" fill="none" stroke="black" stroke-width="2"/></svg>',
    conformeCount: 35,
    naoConformeCount: 2,
    naoAplicavelCount: 3,
    percentualConformidade: 94.6,
    criadoPor: 'Carlos Silva (Inspetor)',
    dataCriacao: '2026-05-28'
  },
  {
    id: 'insp-02',
    data: '2026-05-29',
    horaInicio: '13:00',
    horaFinal: '14:30',
    municipio: 'Varginha',
    local: 'Av. Rui Barbosa, 1025',
    projeto: 'Instalação de Postes de Subestação',
    ordemServico: 'OS-885002',
    areaLotacao: 'Regional Sul de Minas',
    equipeNome: 'Equipe Beta Manutenção',
    encarregado: 'Amarildo Pereira',
    colaboradoresCount: 4,
    veiculoPrefixo: 'MAN-9012',
    veiculoPlaca: 'QOX-8B19',
    idApr: 'APR-29311',
    idCamera: 'CAM-4421',
    respostas: {
      apr: 'C',
      recusa: 'C',
      comunicar: 'C',
      testar: 'C',
      aterrar: 'C',
      corda_vida: 'C',
      estai_temporario: 'C',
      equipe_suficiente: 'C',
      vmc: 'C',
      pop_atualizado: 'C',
      veiculo: 'C',
      hidroelevador_nr12: 'C',
      transito: 'C',
      estacionamento: 'C',
      sinalizacao_delimitacao: 'NC', // NC
      acesso_altura: 'C',
      resgate: 'C',
      adornos: 'C',
      operacao_chaves: 'C',
      distancia_seguranca: 'C',
      linha_viva: 'C',
      poda_rocada: 'C',
      epi_capacete: 'C',
      epi_oculos: 'C',
      epi_calcado: 'C',
      epi_luva_vaqueta: 'C',
      epi_uniforme: 'C',
      epi_luvas_isolantes: 'C',
      epi_conjunto_impermeavel: 'NA',
      epi_oculos_graduados: 'NA',
      epi_protetor_facial: 'C',
      epi_balaclava: 'C',
      epc_vtt: 'C',
      epc_bastao_glv: 'C',
      epc_coberturas: 'C',
      epc_aterramento: 'C',
      epc_detector_tensao: 'C',
      epc_volt_amperimetro: 'C',
      epc_daqc: 'C',
      epc_multifuncional: 'C'
    },
    naoConformidades: {
      sinalizacao_delimitacao: {
        descricao: 'Falta de cones de sinalização na calçada de pedestres com fluxo intenso.',
        acaoCorretiva: 'Instalar fitas zebradas adicionais e cones extras para conter transeuntes.',
        responsavel: 'Amarildo Pereira (Encarregado)',
        prazo: '2026-05-29',
        fotoId: 'foto-nc-3',
        status: 'Aberto'
      }
    },
    fotos: [
      {
        id: 'foto-nc-3',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
        legenda: 'Calçadas sem barreiras físicas para proteção do fluxo',
        data: '2026-05-29',
        hora: '13:15',
        gps: '-21.5594, -45.4342'
      }
    ],
    assinaturaInspetor: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q30,5 50,35 T90,10" fill="none" stroke="black" stroke-width="2"/></svg>',
    assinaturaEncarregado: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M5,15 Q35,35 65,10 T95,30" fill="none" stroke="black" stroke-width="2"/></svg>',
    conformeCount: 37,
    naoConformeCount: 1,
    naoAplicavelCount: 2,
    percentualConformidade: 97.4,
    criadoPor: 'Carlos Silva (Inspetor)',
    dataCriacao: '2026-05-29'
  }
];

export function initializeDatabase() {
  if (!localStorage.getItem('ocle_seeded')) {
    localStorage.setItem('ocle_users', JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('ocle_equipes', JSON.stringify(INITIAL_EQUIPES));
    localStorage.setItem('ocle_veiculos', JSON.stringify(INITIAL_VEICULOS));
    localStorage.setItem('ocle_inspecoes', JSON.stringify(INITIAL_INSPECOES));
    localStorage.setItem('ocle_seeded', 'true');
  }
}

// Low-level helper functions for CRUD
export function getSavedUsers(): Usuario[] {
  initializeDatabase();
  const raw = localStorage.getItem('ocle_users');
  return raw ? JSON.parse(raw) : DEFAULT_USERS;
}

export function saveUsers(users: Usuario[]) {
  localStorage.setItem('ocle_users', JSON.stringify(users));
}

export function getSavedEquipes(): Equipe[] {
  initializeDatabase();
  const raw = localStorage.getItem('ocle_equipes');
  return raw ? JSON.parse(raw) : INITIAL_EQUIPES;
}

export function saveEquipes(equipes: Equipe[]) {
  localStorage.setItem('ocle_equipes', JSON.stringify(equipes));
}

export function getSavedVeiculos(): Veiculo[] {
  initializeDatabase();
  const raw = localStorage.getItem('ocle_veiculos');
  return raw ? JSON.parse(raw) : INITIAL_VEICULOS;
}

export function saveVeiculos(veiculos: Veiculo[]) {
  localStorage.setItem('ocle_veiculos', JSON.stringify(veiculos));
}

export function getSavedInspecoes(): Inspecao[] {
  initializeDatabase();
  const raw = localStorage.getItem('ocle_inspecoes');
  return raw ? JSON.parse(raw) : INITIAL_INSPECOES;
}

export function saveInspecoes(inspecoes: Inspecao[]) {
  localStorage.setItem('ocle_inspecoes', JSON.stringify(inspecoes));
}

// Planos de Ação are derived directly or managed
export function getPlanosAcao(): PlanoAcao[] {
  const inspecoes = getSavedInspecoes();
  const planos: PlanoAcao[] = [];
  
  inspecoes.forEach(insp => {
    Object.entries(insp.naoConformidades).forEach(([chave, info]) => {
      const itemConfig = CHECKLIST_CONFIG.find(c => c.id === chave);
      const associatedFoto = insp.fotos.find(f => f.id === info.fotoId);
      
      planos.push({
        id: `${insp.id}-${chave}`,
        inspecaoId: insp.id,
        inspecaoOS: insp.ordemServico,
        projeto: insp.projeto,
        chaveItem: chave,
        checklistDescricao: itemConfig ? itemConfig.descricao : chave,
        naoConformidade: info.descricao,
        acaoCorretiva: info.acaoCorretiva,
        responsavel: info.responsavel,
        prazo: info.prazo,
        status: info.status,
        fotoUrl: associatedFoto ? associatedFoto.url : undefined
      });
    });
  });
  
  return planos;
}

export function updatePlanoAcaoStatus(inspecaoId: string, chave: string, novoStatus: 'Aberto' | 'Em andamento' | 'Concluído') {
  const inspecoes = getSavedInspecoes();
  const index = inspecoes.findIndex(i => i.id === inspecaoId);
  if (index !== -1) {
    const inspection = inspecoes[index];
    if (inspection.naoConformidades[chave]) {
      inspection.naoConformidades[chave].status = novoStatus;
      inspecoes[index] = inspection;
      saveInspecoes(inspecoes);
    }
  }
}
