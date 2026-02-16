import { baseApi } from "./base-api";
import type { User } from "@/types/user.type";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [
        { type: "User", id },
        { type: "User", id: "ME" },
      ],
    }),

    updateProfile: builder.mutation<User, FormData>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    followUser: builder.mutation<{ success: true }, string>({
      query: (userId) => ({
        url: `/users/follow`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (_r, _e, userId) => [
        { type: "User", id: userId },
        { type: "User", id: "ME" },
      ],
    }),

    unfollowUser: builder.mutation<{ success: true }, string>({
      query: (userId) => ({
        url: `/users/unfollow`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (_r, _e, userId) => [
        { type: "User", id: userId },
        { type: "User", id: "ME" },
      ],
    }),
    getSuggestions: builder.query<User[], void>({
      query: () => `/users/suggestions`,
      providesTags: [{ type: "User", id: "SUGGESTIONS" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetSuggestionsQuery,
} = userApi;
