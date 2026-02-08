export interface User {
  name: string;
  username: string;
  avatar: string;
}

export interface Reply {
  id: number;
  user: string;
  text: string;
}

export interface Comment {
  id: number;
  user: string;
  text: string;
  replies: Reply[];
}

export interface Post {
  id: number;
  user: User;
  image: string;
  caption: string;
  likes: number;
  createdAt: string;
  comments: Comment[];
}
