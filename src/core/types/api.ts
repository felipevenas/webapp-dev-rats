export type UUID = string;
export type IsoInstant = string;
export type IsoDate = string;

export type VerificationMode = 'SELECTED_REPOSITORIES' | 'OWN_REPOSITORIES';
export type ChallengeStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type GroupStatus = 'ACTIVE' | 'ARCHIVED';
export type GroupRole = 'OWNER' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'LEFT' | 'REMOVED';
export type ActivityDayStatus = 'VALID' | 'EMPTY' | 'FUTURE' | 'BEFORE_START' | 'AFTER_END';
export type ResultStatus = 'PROVISIONAL' | 'FINAL';
export type RepositoryAccessStatus = 'ACCESSIBLE' | 'UNKNOWN' | 'LOST';
export type ExperienceLevel = 'JUNIOR' | 'PLENO' | 'SENIOR' | 'ESPECIALISTA';
export type TechStack =
  | 'JAVA'
  | 'KOTLIN'
  | 'JAVASCRIPT'
  | 'TYPESCRIPT'
  | 'PYTHON'
  | 'GO'
  | 'CSHARP'
  | 'PHP'
  | 'RUBY'
  | 'RUST'
  | 'SWIFT'
  | 'REACT'
  | 'NODE'
  | 'SPRING'
  | 'DOTNET'
  | 'SQL'
  | 'DOCKER'
  | 'AWS';

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  traceId?: string;
  errors?: Array<{ field: string; message: string }>;
  retryAfterSeconds?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface User {
  id: UUID;
  displayName: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  timezone: string;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  experienceLevel?: ExperienceLevel | null;
  primaryStack?: TechStack[];
  notifyDailyGoal: boolean;
  notifyMilestones: boolean;
  notifyChallengeUpdates: boolean;
  notifyIntegration: boolean;
  githubConnected: boolean;
  githubUsername?: string | null;
  createdAt: IsoInstant;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
}

export interface GitHubStatus {
  appConfigured: boolean;
  connected: boolean;
  githubUsername?: string | null;
  githubUserId?: number | null;
  installationCount: number;
  repositoryCount: number;
  permissions?: string[];
  connectedAt?: IsoInstant | null;
  lastSyncedAt?: IsoInstant | null;
  message?: string | null;
}

export interface GitHubRepository {
  id: UUID;
  githubRepositoryId: number;
  fullName: string;
  ownerLogin: string;
  visibility: string;
  privateRepository: boolean;
  fork: boolean;
  accessStatus: RepositoryAccessStatus;
}

export interface ChallengeRepository {
  id: UUID;
  githubRepositoryId: UUID;
  externalRepositoryId: number;
  fullName: string;
  ownerLogin: string;
  slot: number;
}

export interface Challenge {
  id: UUID;
  groupId: UUID;
  sequenceNo: number;
  verificationMode: VerificationMode;
  targetValidDays: number;
  timezone: string;
  status: ChallengeStatus;
  startsAt: IsoInstant;
  endsAt?: IsoInstant | null;
  admissionEndsAt?: IsoInstant | null;
  startedAt?: IsoInstant | null;
  completedAt?: IsoInstant | null;
  cancelledAt?: IsoInstant | null;
  allowForks: boolean;
  repositories: ChallengeRepository[];
  participantCount: number;
}

export interface Group {
  id: UUID;
  name: string;
  description?: string | null;
  creatorId: UUID;
  timezone: string;
  maxMembers: number;
  status: GroupStatus;
  createdAt: IsoInstant;
  currentChallenge?: Challenge | null;
}

export interface GroupMember {
  id: UUID;
  userId: UUID;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  role: GroupRole;
  status: MemberStatus;
  joinedAt: IsoInstant;
}

export interface ProgressEntry {
  participantId: UUID;
  userId: UUID;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  validDays: number;
  targetValidDays: number;
  percent: number;
  currentStreak: number;
  bestStreak: number;
  lastValidDate?: IsoDate | null;
  completedAt?: IsoInstant | null;
  rank: number;
}

export interface ActivityDay {
  date: IsoDate;
  status: ActivityDayStatus;
}

export interface ActivityCalendar {
  challengeId: UUID;
  userId: UUID;
  timezone: string;
  from: IsoDate;
  to: IsoDate;
  days: ActivityDay[];
}

export interface ActivityCommit {
  sha: string;
  repositoryFullName: string;
  commitUrl: string;
  committedAt: IsoInstant;
  authorLogin?: string | null;
}

export interface FeedItem {
  id: UUID;
  type: string;
  message: string;
  createdAt: IsoInstant;
}

export interface ChallengeResult {
  challengeId: UUID;
  winnerUserId: UUID;
  winnerDisplayName: string;
  winnerUsername: string;
  achievedAt: IsoInstant;
  winningActivityDate: IsoDate;
  validDaysAtWin: number;
  status: ResultStatus;
  finalizedAt?: IsoInstant | null;
}

export interface DashboardGroup {
  groupId: UUID;
  groupName: string;
  challengeId: UUID;
  challengeStatus: ChallengeStatus;
  targetValidDays: number;
  validDays: number;
  percent: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  lastValidDate?: IsoDate | null;
  startsAt: IsoInstant;
  endsAt?: IsoInstant | null;
}

export interface Dashboard {
  groups: DashboardGroup[];
  github: GitHubStatus;
}

export interface Invite {
  id: UUID;
  token?: string | null;
  url?: string | null;
  createdAt: IsoInstant;
  expiresAt: IsoInstant;
  revokedAt?: IsoInstant | null;
  maxUses?: number | null;
  uses: number;
}

export interface InvitePreview {
  groupId: UUID;
  groupName: string;
  inviterName: string;
  expiresAt: IsoInstant;
  valid: boolean;
  reason?: string | null;
}

export type NotificationType =
  | 'DAILY_GOAL'
  | 'MILESTONE'
  | 'CHALLENGE_COMPLETED'
  | 'CHALLENGE_CANCELLED'
  | 'CHALLENGE_EXPIRED'
  | 'MEMBER_JOINED'
  | 'INVITE_ACCEPTED'
  | 'INTEGRATION_ATTENTION';

export interface AppNotification {
  id: UUID;
  type: NotificationType;
  challengeId?: UUID | null;
  payload?: string | null;
  readAt?: IsoInstant | null;
  createdAt: IsoInstant;
}
