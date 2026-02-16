import { baseApi } from "./base-api";

export type Post = {
  id: string;
  content: string;
  image?: string | null;

  likeCount: number;
  commentCount: number;
  repostCount: number;

  backgroundColor?: string;

  createdAt: string;
  updatedAt: string;

  author: {
    id: string;
    email: string;
    username?: string;
    profile?: {
      fullName?: string;
      avatar?: string;
    };
  };

  viewer?: {
    liked: boolean;
    reposted: boolean;
  };
};

export type FeedResponse = {
  total: number;
  limit: number;
  offset: number;
  data: Post[];
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;

  author: {
    id: string;
    email: string;
    profile?: {
      fullName?: string;
      avatar?: string;
    };
  };

  replies?: Comment[];
};

export type CommentsResponse = {
  total: number;
  limit: number;
  offset: number;
  data: Comment[];
};

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<
      FeedResponse,
      { limit?: number; offset?: number; authorId?: string }
    >({
      query: ({ limit = 10, offset = 0, authorId }) => ({
        url: "/post/feed",
        method: "GET",
        params: { limit, offset, authorId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({ type: "Post" as const, id: p.id })),
              { type: "Post", id: "FEED" },
            ]
          : [{ type: "Post", id: "FEED" }],
    }),

    getPostById: builder.query<Post, string>({
      query: (id) => `/post/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Post", id }],
    }),

    createPost: builder.mutation<Post, FormData>({
      query: (body) => ({
        url: "/post",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Post", id: "FEED" }],
    }),

    updatePost: builder.mutation<Post, { postId: string; body: FormData }>({
      query: ({ postId, body }) => ({
        url: `/post/${postId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, args) => [
        { type: "Post", id: args.postId },
        { type: "Post", id: "FEED" },
      ],
    }),

    deletePost: builder.mutation<{ success: true }, string>({
      query: (postId) => ({
        url: `/post/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, postId) => [
        { type: "Post", id: postId },
        { type: "Post", id: "FEED" },
      ],
    }),

    likePost: builder.mutation<{ success: true }, string>({
      query: (postId) => ({
        url: `/post/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, postId) => [
        { type: "Post", id: postId },
        { type: "Post", id: "FEED" },
      ],
    }),

    unlikePost: builder.mutation<{ success: true }, string>({
      query: (postId) => ({
        url: `/post/${postId}/unlike`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, postId) => [
        { type: "Post", id: postId },
        { type: "Post", id: "FEED" },
      ],
    }),

    repost: builder.mutation<{ success: true }, string>({
      query: (postId) => ({
        url: `/post/${postId}/repost`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, postId) => [
        { type: "Post", id: postId },
        { type: "Post", id: "FEED" },
      ],
    }),

    undoRepost: builder.mutation<{ success: true }, string>({
      query: (postId) => ({
        url: `/post/${postId}/undo-repost`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, postId) => [
        { type: "Post", id: postId },
        { type: "Post", id: "FEED" },
      ],
    }),

    getComments: builder.query<
      CommentsResponse,
      { postId: string; limit?: number; offset?: number }
    >({
      query: ({ postId, limit = 20, offset = 0 }) => ({
        url: `/post/${postId}/comments`,
        method: "GET",
        params: { limit, offset },
      }),
      providesTags: (_r, _e, args) => [{ type: "Comment", id: args.postId }],
    }),

    addComment: builder.mutation<
      { success: true; commentId: string },
      { postId: string; content: string; parentId?: string }
    >({
      query: ({ postId, ...body }) => ({
        url: `/post/${postId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, args) => [
        { type: "Comment", id: args.postId },
        { type: "Post", id: args.postId },
        { type: "Post", id: "FEED" },
      ],
    }),
    // In your post-api.ts, add:

    // In your post-api.ts
    searchPosts: builder.query<
      FeedResponse,
      { q?: string; page?: number; limit?: number }
    >({
      query: ({ q, page = 1, limit = 20 }) => ({
        url: "/post/search/all", // Make sure this matches your backend route
        method: "GET",
        params: { q, page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({ type: "Post" as const, id: p.id })),
              { type: "Post", id: "SEARCH" },
            ]
          : [{ type: "Post", id: "SEARCH" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetFeedQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useRepostMutation,
  useUndoRepostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useSearchPostsQuery,
} = postApi;
