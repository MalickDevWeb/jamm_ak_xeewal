import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PermissionModuleItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
}

export interface ProfileItem {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  telephone?: string | null;
  role: string;
  actif: boolean;
  profileId?: string | null;
  createdAt: string;
  updatedAt?: string;
  profile?: {
    id: string;
    name: string;
    permissions: string[];
    isSystem: boolean;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileAdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- Permissions Catalogue ---
  getPermissions(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(
      `${this.apiUrl}/rbac/modules`
    );
  }

  // --- Profiles CRUD ---
  getProfiles(): Observable<{ success: boolean; data: ProfileItem[] }> {
    return this.http.get<{ success: boolean; data: ProfileItem[] }>(
      `${this.apiUrl}/rbac/roles`
    );
  }

  getProfile(id: string): Observable<{ success: boolean; data: ProfileItem }> {
    return this.http.get<{ success: boolean; data: ProfileItem }>(
      `${this.apiUrl}/rbac/roles/${id}`
    );
  }

  createProfile(data: {
    name: string;
    description?: string;
    permissions: string[];
  }): Observable<{ success: boolean; message: string; data: ProfileItem }> {
    return this.http.post<{ success: boolean; message: string; data: ProfileItem }>(
      `${this.apiUrl}/rbac/roles`,
      data
    );
  }

  updateProfile(
    id: string,
    data: { name?: string; description?: string; permissions?: string[] }
  ): Observable<{ success: boolean; message: string; data: ProfileItem }> {
    return this.http.put<{ success: boolean; message: string; data: ProfileItem }>(
      `${this.apiUrl}/rbac/roles/${id}`,
      data
    );
  }

  deleteProfile(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/rbac/roles/${id}`
    );
  }

  // --- Admin Users CRUD ---
  getUsers(): Observable<{ success: boolean; data: AdminUserItem[] }> {
    return this.http.get<{ success: boolean; data: AdminUserItem[] }>(
      `${this.apiUrl}/admin-users`
    );
  }

  getUser(id: string): Observable<{ success: boolean; data: AdminUserItem }> {
    return this.http.get<{ success: boolean; data: AdminUserItem }>(
      `${this.apiUrl}/admin-users/${id}`
    );
  }

  createUser(data: {
    name: string;
    email: string;
    password: string;
    telephone?: string;
    profileId?: string;
  }): Observable<{ success: boolean; message: string; data: AdminUserItem }> {
    return this.http.post<{ success: boolean; message: string; data: AdminUserItem }>(
      `${this.apiUrl}/admin-users`,
      data
    );
  }

  updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      telephone?: string;
      profileId?: string;
      actif?: boolean;
    }
  ): Observable<{ success: boolean; message: string; data: AdminUserItem }> {
    return this.http.put<{ success: boolean; message: string; data: AdminUserItem }>(
      `${this.apiUrl}/admin-users/${id}`,
      data
    );
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/admin-users/${id}`
    );
  }
}
