export type Role = 'paciente' | 'doctor' | 'admin' | string;
export interface AccessPayload { sub: number | string; email: string; roles: Role[]; }
export interface RefreshPayload { sub: number | string; type: 'refresh'; }
export interface TokenPair { access: string; refresh: string; }
