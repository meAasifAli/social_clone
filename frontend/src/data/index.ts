import type { Post } from "@/types/feed";

export const demoPosts: Post[] = [
  {
    id: 1,
    user: {
      name: "John Doe",
      username: "johndoe",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    image: "https://picsum.photos/600/600?random=1",
    caption: "Building a social media app with React 🚀",
    likes: 23,
    createdAt: "2h ago",
    comments: [],
  },
  {
    id: 2,
    user: {
      name: "Jane Smith",
      username: "janesmith",
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    image: "https://picsum.photos/600/600?random=2",
    caption: "UI inspiration everywhere ✨",
    likes: 87,
    createdAt: "5h ago",
    comments: [],
  },
  {
    id: 3,
    user: {
      name: "Alex Johnson",
      username: "alexj",
      avatar: "https://i.pravatar.cc/150?img=45",
    },
    image: "https://picsum.photos/600/600?random=3",
    caption: "Consistency beats motivation 💪",
    likes: 142,
    createdAt: "1d ago",
    comments: [],
  },
  {
    id: 4,
    user: {
      name: "Sara Khan",
      username: "sarak",
      avatar: "https://i.pravatar.cc/150?img=56",
    },
    image: "https://picsum.photos/600/600?random=4",
    caption: "Weekend vibes 🌿",
    likes: 64,
    createdAt: "2d ago",
    comments: [],
  },
];
