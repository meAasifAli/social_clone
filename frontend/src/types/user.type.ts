export interface UserProfile {
  fullName: string;
  avatar?: string;
  bio?: string;
  website?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  profile: UserProfile;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  bio?: string;
  fullName?: string;
  website?: string;
  avatar?: string;
  mutualFollowersCount?: number;
}
