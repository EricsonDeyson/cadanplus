export interface GroupDto {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  sortOrder: number;
}

export interface AdminModuleDto {
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

export interface GroupsOverviewDto {
  groups: GroupDto[];
  modules: AdminModuleDto[];
}
