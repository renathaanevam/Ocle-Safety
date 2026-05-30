import { ChecklistConfigItem } from '../types';

export const CHECKLIST_CONFIG: ChecklistConfigItem[] = [
  // REGRAS DE OURO
  { id: 'apr', descricao: 'APR (Análise Preliminar de Risco) preenchida e assinada', categoria: 'Regras de Ouro' },
  { id: 'recusa', descricao: 'Direito de Recusa exercido pelas condições de risco / análise', categoria: 'Regras de Ouro' },
  { id: 'comunicar', descricao: 'Comunicar início e término dos trabalhos ao COD (Centro de Operação)', categoria: 'Regras de Ouro' },
  { id: 'testar', descricao: 'Testar ausência de tensão antes de iniciar atividades secundárias', categoria: 'Regras de Ouro' },
  { id: 'aterrar', descricao: 'Aterrar rede temporária de forma visível e completa', categoria: 'Regras de Ouro' },
  { id: 'corda_vida', descricao: 'Corda de Vida instalada e utilizada corretamente em altura', categoria: 'Regras de Ouro' },
  { id: 'estai_temporario', descricao: 'Estai Temporário instalado antes de iniciar escaladas ou tração', categoria: 'Regras de Ouro' },

  // DEMAIS VERIFICAÇÕES
  { id: 'equipe_suficiente', descricao: 'Equipe em contingente suficiente para a tarefa programada', categoria: 'Demais Verificações' },
  { id: 'vmc', descricao: 'VMC (Verificação de Meio de Campo) preenchido', categoria: 'Demais Verificações' },
  { id: 'pop_atualizado', descricao: 'POP (Procedimento Operacional Padrão) atualizado e presente', categoria: 'Demais Verificações' },
  { id: 'veiculo', descricao: 'Veículo em condições físicas e operacionais seguras', categoria: 'Demais Verificações' },
  { id: 'hidroelevador_nr12', descricao: 'Hidroelevador e comandos elétricos regulares (conforme NR12)', categoria: 'Demais Verificações' },
  { id: 'transito', descricao: 'Plano de Trânsito atendido na localidade', categoria: 'Demais Verificações' },
  { id: 'estacionamento', descricao: 'Estacionamento em local seguro com calços de roda aplicados', categoria: 'Demais Verificações' },
  { id: 'sinalizacao_delimitacao', descricao: 'Sinalização e Delimitação da área de trabalho completa', categoria: 'Demais Verificações' },
  { id: 'acesso_altura', descricao: 'Acesso à Altura por escadas de fibra íntegras amarradas', categoria: 'Demais Verificações' },
  { id: 'resgate', descricao: 'Equipamento de Resgate em altura montado e pronto para uso', categoria: 'Demais Verificações' },
  { id: 'adornos', descricao: 'Ausência total de adornos pessoais (anéis, pulseiras, colares)', categoria: 'Demais Verificações' },
  { id: 'operacao_chaves', descricao: 'Dispositivo e bastões adequados para Operação de Chaves', categoria: 'Demais Verificações' },
  { id: 'distancia_seguranca', descricao: 'Distância de Segurança das partes energizadas respeitada', categoria: 'Demais Verificações' },
  { id: 'linha_viva', descricao: 'Ferramental e EPIs específicos para trabalho em Linha Viva regulados', categoria: 'Demais Verificações' },
  { id: 'poda_rocada', descricao: 'Condições seguras e EPIs para serviços de Poda e Roçada de galhos', categoria: 'Demais Verificações' },

  // EPIs
  { id: 'epi_capacete', descricao: 'Capacete de segurança com jugular resistente e classe B na validade', categoria: 'EPIs' },
  { id: 'epi_oculos', descricao: 'Óculos de proteção contra impactos e proteção Solar/UV', categoria: 'EPIs' },
  { id: 'epi_calcado', descricao: 'Calçado de segurança isolante elétrico sem componentes metálicos', categoria: 'EPIs' },
  { id: 'epi_luva_vaqueta', descricao: 'Luva de Vaqueta de proteção mecânica íntegra', categoria: 'EPIs' },
  { id: 'epi_uniforme', descricao: 'Uniforme de proteção contra arco elétrico e fogo repentino (A PV / FR)', categoria: 'EPIs' },
  { id: 'epi_luvas_isolantes', descricao: 'Luvas Isolantes de borracha testadas e na classe de tensão adequada', categoria: 'EPIs' },
  { id: 'epi_conjunto_impermeavel', descricao: 'Conjunto Impermeável de proteção chuva em boas condições de vedação', categoria: 'EPIs' },
  { id: 'epi_oculos_graduados', descricao: 'Óculos Graduados de segurança ou sobreposição com lentes certificadas', categoria: 'EPIs' },
  { id: 'epi_protetor_facial', descricao: 'Capacete com Protetor Facial contra raios de arco elétrico e calor', categoria: 'EPIs' },
  { id: 'epi_balaclava', descricao: 'Balaclava de proteção térmica para arco elétrico', categoria: 'EPIs' },

  // EPCS E EQUIPAMENTOS
  { id: 'epc_vtt', descricao: 'VTT (Varal de Terra Temporário) com fiação e grampos adequados', categoria: 'EPCs e Equipamentos' },
  { id: 'epc_bastao_glv', descricao: 'Bastão GLV (Garante Linha Viva) e bastões de manobra testados', categoria: 'EPCs e Equipamentos' },
  { id: 'epc_coberturas', descricao: 'Coberturas isolantes rígidas ou flexíveis em estado íntegro', categoria: 'EPCs e Equipamentos' },
  { id: 'epc_aterramento', descricao: 'Conjunto de Aterramento rápido de baixa e média tensão calibrados', categoria: 'EPCs e Equipamentos' },
  { id: 'epc_detector_tensao', descricao: 'Detector de Tensão portátil testado antes do uso e ativo', categoria: 'EPCs e Equipamentos' },
  { id: 'epc_volt_amperimetro', descricao: 'Volt Amperímetro tipo alicate com isolações regulares', categoria: 'EPCs e Equipamentos' },
  { id: 'epc_daqc', descricao: 'DAQC (Dispositivo de Aterramento Rápido de Chassi) operável', categoria: 'EPCs e Equipamentos' },
  { id: 'epc_multifuncional', descricao: 'Aparelho ou ferramentas Multifuncionais de rede estáveis', categoria: 'EPCs e Equipamentos' }
];
