// types/suggestion.type.ts
export interface Suggestion {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  mutualFollowersCount: number;
}
