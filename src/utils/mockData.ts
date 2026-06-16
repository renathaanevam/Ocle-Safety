import { Usuario, Equipe, Veiculo, Inspecao, PlanoAcao } from '../types';
import { CHECKLIST_CONFIG } from './checklistConfig';

// Usuário administrador inicial
export const DEFAULT_USERS: Usuario[] = [
  {
    id: '1',
    nome: 'Renatha Anevam',
    email: 'renatha.anevam@ocle.com.br',
    perfil: 'admin',
    senha: 'Renatha@2026'
  }
];
// Sem equipes fictícias
const INITIAL_EQUIPES: Equipe[] = [];

// Sem veículos fictícios
const INITIAL_VEICULOS: Veiculo[] = [];

// Sem inspeções fictícias
const INITIAL_INSPECOES: Inspecao[] = [];

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

// Planos de ação
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

export function updatePlanoAcaoStatus(
  inspecaoId: string,
  chave: string,
  novoStatus: 'Aberto' | 'Em andamento' | 'Concluído'
) {
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
