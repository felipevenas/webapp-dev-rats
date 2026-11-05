export const queryKeys = {
  me: ['me'] as const,
  dashboard: ['dashboard'] as const,
  groups: ['groups'] as const,
  group: (groupId: string) => ['groups', groupId] as const,
  groupMembers: (groupId: string) => ['groups', groupId, 'members'] as const,
  groupInvites: (groupId: string) => ['groups', groupId, 'invites'] as const,
  challenges: (groupId: string) => ['groups', groupId, 'challenges'] as const,
  challenge: (challengeId: string) => ['challenges', challengeId] as const,
  progress: (challengeId: string) => ['challenges', challengeId, 'progress'] as const,
  leaderboard: (challengeId: string) => ['challenges', challengeId, 'leaderboard'] as const,
  activity: (challengeId: string, userId: string, from: string, to: string) =>
    ['challenges', challengeId, 'activity', userId, from, to] as const,
  activityCommits: (challengeId: string, userId: string, date: string) =>
    ['challenges', challengeId, 'activity', userId, date, 'commits'] as const,
  result: (challengeId: string) => ['challenges', challengeId, 'result'] as const,
  feed: (challengeId: string) => ['challenges', challengeId, 'feed'] as const,
  notifications: (page: number) => ['notifications', page] as const,
  friends: (page: number, size = 12) => ['friends', 'list', page, size] as const,
  friendRequests: (direction: 'RECEIVED' | 'SENT', page: number, size = 12) =>
    ['friends', 'requests', direction, page, size] as const,
  friendRequestsCount: ['friends', 'requests', 'received', 'count'] as const,
  friendshipStatuses: (userIds: string[]) =>
    ['friends', 'status', [...userIds].sort().join(',')] as const,
  userSearch: (query: string) => ['users', 'search', query] as const,
  publicProfile: (username: string) => ['users', username, 'profile'] as const,
  github: ['integrations', 'github'] as const,
  repositories: (search: string, page: number) => ['github', 'repositories', search, page] as const,
  invitePreview: (token: string) => ['invites', token] as const,
  chatConversations: ['chat', 'conversation-list'] as const,
  chatConversation: (conversationId: string) => ['chat', 'conversation', conversationId] as const,
  chatMessages: (conversationId: string) => ['chat', 'conversation', conversationId, 'messages'] as const,
  chatUnread: ['chat', 'unread'] as const,
};
