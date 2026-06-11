export interface ResumoDto {
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

export interface AgingFaixaDto {
  faixa: string;
  titulos: number;
  valor: number;
}

export interface PorMesDto {
  ano: number;
  mes: number;
  titulos: number;
  valor: number;
}

export interface TopClienteDto {
  clienteId: number;
  nome: string;
  razaoSocial: string | null;
  cidade: string | null;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}

export interface OverviewDto {
  resumo: ResumoDto;
  aging: AgingFaixaDto[];
  porMes: PorMesDto[];
  topClientes: TopClienteDto[];
}

export interface EquipeInadimplenciaDto {
  equipeId: number;
  equipe: string;
  representantes: number;
  clientes: number;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}

export interface RepresentanteInadimplenciaDto {
  representanteId: number;
  representante: string;
  clientes: number;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}

export interface ClienteInadimplenciaDto {
  clienteId: number;
  nome: string;
  razaoSocial: string | null;
  cidade: string | null;
  titulos: number;
  valor: number;
  maiorAtraso: number;
}
