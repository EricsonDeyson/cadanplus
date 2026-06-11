export interface Role {
  id: number;
  slug: string;
  name: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: Role | null;
  mustChangePassword: boolean;
  isActive: boolean;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
}

export interface LoginResponse {
  session: Session;
  profile: Profile;
}

export interface ModuleGroup {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  sortOrder: number;
}

export interface ModuleItem {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string;
  sortOrder: number;
  canEdit: boolean;
  group: ModuleGroup | null;
}

// ---------- Dashboard: Inadimplência ----------

export interface Periodo {
  from?: string;
  to?: string;
}

export interface InadimplenciaResumo {
  valorOriginal: number;
  valorJuros: number;
  valorMulta: number;
  valorTotal: number;
  titulos: number;
  clientes: number;
  atrasoMedioDias: number;
  atrasoMedioPonderado: number;
  valorAcima90: number;
  pctAcima90: number;
}

export interface AgingFaixa {
  faixa: string;
  titulos: number;
  valor: number;
}

export interface PorMes {
  ano: number;
  mes: number;
  titulos: number;
  valor: number;
}

export interface TopCliente {
  clienteId: number;
  nome: string;
  razaoSocial: string | null;
  cidade: string | null;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}

export interface InadimplenciaOverview {
  resumo: InadimplenciaResumo;
  aging: AgingFaixa[];
  porMes: PorMes[];
  topClientes: TopCliente[];
}

export interface EquipeInadimplencia {
  equipeId: number;
  equipe: string;
  representantes: number;
  clientes: number;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}

export interface RepresentanteInadimplencia {
  representanteId: number;
  representante: string;
  clientes: number;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}

export interface ClienteInadimplencia {
  clienteId: number;
  nome: string;
  razaoSocial: string | null;
  cidade: string | null;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}

// ---------- Área Administrativa ----------

export interface AdminGroup {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  sortOrder: number;
}

export interface AdminModule {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string;
  sortOrder: number;
  isActive: boolean;
  groupId: number | null;
}

export interface AdminGroupsOverview {
  groups: AdminGroup[];
  modules: AdminModule[];
}
