export interface ModuleDto {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string;
  sortOrder: number;
  canEdit: boolean;
}
