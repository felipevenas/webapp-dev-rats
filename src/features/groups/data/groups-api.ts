import { api } from '@/core/http/api-client';
import type { Group, GroupMember, Invite } from '@/core/types/api';

export interface CreateGroupPayload {
  name: string;
  description?: string;
  timezone: string;
  maxMembers?: number;
  challenge: {
    verificationMode: 'SELECTED_REPOSITORIES' | 'OWN_REPOSITORIES';
    targetValidDays: number;
    startsAt: string;
    endsAt?: string;
    admissionEndsAt?: string;
    repositoryIds?: string[];
  };
}

export const groupsApi = {
  async create(payload: CreateGroupPayload) {
    const response = await api.post<Group>('/groups', payload);
    return response.data;
  },
  async list() {
    const response = await api.get<Group[]>('/groups');
    return response.data;
  },
  async get(groupId: string) {
    const response = await api.get<Group>(`/groups/${groupId}`);
    return response.data;
  },
  async update(groupId: string, payload: { name?: string; description?: string }) {
    const response = await api.patch<Group>(`/groups/${groupId}`, payload);
    return response.data;
  },
  async members(groupId: string) {
    const response = await api.get<GroupMember[]>(`/groups/${groupId}/members`);
    return response.data;
  },
  async removeMember(groupId: string, userId: string) {
    await api.delete(`/groups/${groupId}/members/${userId}`);
  },
  async leave(groupId: string) {
    await api.post(`/groups/${groupId}/leave`);
  },
  async invites(groupId: string) {
    const response = await api.get<Invite[]>(`/groups/${groupId}/invites`);
    return response.data;
  },
  async createInvite(groupId: string, payload: { expiresAt?: string; maxUses?: number }) {
    const response = await api.post<Invite>(`/groups/${groupId}/invites`, payload);
    return response.data;
  },
  async revokeInvite(groupId: string, inviteId: string) {
    await api.delete(`/groups/${groupId}/invites/${inviteId}`);
  },
};
