/**
 * Tipos comuns compartilhados pela aplicação
 */

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FormErrors {
  [key: string]: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  primaryForeground?: string;
  secondaryForeground?: string;
  accentForeground?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  user_count?: number;
}

export interface UserRole {
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'member';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

