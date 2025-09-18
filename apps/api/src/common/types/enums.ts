// Enum types for SQLite compatibility (stored as strings)

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export type TargetType = 'POST' | 'COMMENT' | 'USER' | 'MESSAGE';

export type ReactionType = 'LIKE' | 'LOVE' | 'LAUGH' | 'ANGRY' | 'SAD';

export type ChannelType = 'DIRECT_MESSAGE' | 'GROUP_CHAT';

export type ChannelRole = 'MEMBER' | 'ADMIN';

export type ReportReason = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'INAPPROPRIATE_CONTENT' | 'SELF_HARM' | 'VIOLENCE' | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export type ModerationActionType = 'HIDE_CONTENT' | 'DELETE_CONTENT' | 'WARN_USER' | 'SUSPEND_USER' | 'BAN_USER';

export type ResourceCategory = 'MENTAL_HEALTH' | 'ACADEMIC_SUPPORT' | 'CAREER_GUIDANCE' | 'FINANCIAL_AID' | 'CRISIS_SUPPORT';

// Constants for enum values
export const UserRole = {
  USER: 'USER' as const,
  MODERATOR: 'MODERATOR' as const,
  ADMIN: 'ADMIN' as const,
};

export const TargetType = {
  POST: 'POST' as const,
  COMMENT: 'COMMENT' as const,
  USER: 'USER' as const,
  MESSAGE: 'MESSAGE' as const,
};

export const ReactionType = {
  LIKE: 'LIKE' as const,
  LOVE: 'LOVE' as const,
  LAUGH: 'LAUGH' as const,
  ANGRY: 'ANGRY' as const,
  SAD: 'SAD' as const,
};

export const ChannelType = {
  DIRECT_MESSAGE: 'DIRECT_MESSAGE' as const,
  GROUP_CHAT: 'GROUP_CHAT' as const,
};

export const ChannelRole = {
  MEMBER: 'MEMBER' as const,
  ADMIN: 'ADMIN' as const,
};

export const ReportReason = {
  SPAM: 'SPAM' as const,
  HARASSMENT: 'HARASSMENT' as const,
  HATE_SPEECH: 'HATE_SPEECH' as const,
  INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT' as const,
  SELF_HARM: 'SELF_HARM' as const,
  VIOLENCE: 'VIOLENCE' as const,
  OTHER: 'OTHER' as const,
};

export const ReportStatus = {
  PENDING: 'PENDING' as const,
  REVIEWING: 'REVIEWING' as const,
  RESOLVED: 'RESOLVED' as const,
  DISMISSED: 'DISMISSED' as const,
};

export const ModerationActionType = {
  HIDE_CONTENT: 'HIDE_CONTENT' as const,
  DELETE_CONTENT: 'DELETE_CONTENT' as const,
  WARN_USER: 'WARN_USER' as const,
  SUSPEND_USER: 'SUSPEND_USER' as const,
  BAN_USER: 'BAN_USER' as const,
};

export const ResourceCategory = {
  MENTAL_HEALTH: 'MENTAL_HEALTH' as const,
  ACADEMIC_SUPPORT: 'ACADEMIC_SUPPORT' as const,
  CAREER_GUIDANCE: 'CAREER_GUIDANCE' as const,
  FINANCIAL_AID: 'FINANCIAL_AID' as const,
  CRISIS_SUPPORT: 'CRISIS_SUPPORT' as const,
};