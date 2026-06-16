export type UserRole = 'admin' | 'inspector' | 'gestor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  senha: string;
  avatar?: string;
}

export interface Equipe {
  id: string;
  nome: string;
  encarregado: string;
  colaboradoresCount: number;
  contrato: string;
  regiao: string;
}

export interface Veiculo {
  id: string;
  prefixo: string;
  placa: string;
  tipo: string;
  situacao: 'Liberado' | 'Restrição' | 'Bloqueado';
  ultimaInspecao: string;
}

export type ChecklistCategory = 
  | 'Regras de Ouro' 
  | 'Demais Verificações' 
  | 'EPIs' 
  | 'EPCs e Equipamentos';

export interface ChecklistConfigItem {
  id: string;
  descricao: string;
  categoria: ChecklistCategory;
}

export interface NaoConformidadeInput {
  chave: string;
  descricao: string;
  acaoCorretiva: string;
  responsavel: string;
  prazo: string;
  fotoUrl: string;
  fotoLegenda?: string;
}

export interface InspecaoFoto {
  id: string;
  url: string;
  legenda: string;
  data: string;
  hora: string;
  gps: string;
}

export interface Inspecao {
  id: string;
  data: string;
  horaInicio: string;
  horaFinal: string;
  municipio: string;
  local: string;
  projeto: string;
  ordemServico: string;
  areaLotacao: string;
  
  // Equipe
  equipeNome: string;
  encarregado: string;
  colaboradoresCount: number;
  
  // Veículo
  veiculoPrefixo: string;
  veiculoPlaca: string;
  
  // Identificação
  idApr: string;
  idCamera: string;
  
  // Checklist State
  respostas: Record<string, 'C' | 'NC' | 'NA'>;
  naoConformidades: Record<string, {
    descricao: string;
    acaoCorretiva: string;
    responsavel: string;
    prazo: string;
    fotoId: string;
    status: 'Aberto' | 'Em andamento' | 'Concluído';
  }>;
  
  // Registro Fotográfico
  fotos: InspecaoFoto[];
  
  // Assinaturas (dataURLs)
  assinaturaInspetor: string;
  assinaturaEncarregado: string;
  
  // Cálculos Automáticos
  conformeCount: number;
  naoConformeCount: number;
  naoAplicavelCount: number;
  percentualConformidade: number;
  
  // Metadados
  criadoPor: string;
  dataCriacao: string;
}

export interface PlanoAcao {
  id: string;
  inspecaoId: string;
  inspecaoOS: string;
  projeto: string;
  chaveItem: string;
  checklistDescricao: string;
  naoConformidade: string;
  acaoCorretiva: string;
  responsavel: string;
  prazo: string;
  status: 'Aberto' | 'Em andamento' | 'Concluído';
  fotoUrl?: string;
}
