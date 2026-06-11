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

export interface ModuleItem {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string;
  sortOrder: number;
  canEdit: boolean;
}
