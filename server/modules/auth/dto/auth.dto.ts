export interface RoleDto {
  id: number;
  slug: string;
  name: string;
}

export interface ProfileDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: RoleDto | null;
  mustChangePassword: boolean;
  isActive: boolean;
}

export interface SessionDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
}

export interface LoginResponseDto {
  session: SessionDto;
  profile: ProfileDto;
}
