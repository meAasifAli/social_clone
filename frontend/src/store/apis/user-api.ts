import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import type { User } from "@/types/user.type";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["User", "Follow"],
  endpoints: (builder) => ({
    /* =============================
       GET USER BY ID
    ============================= */
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    /* =============================
       UPDATE PROFILE
    ============================= */
    updateProfile: builder.mutation<User, FormData>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    /* =============================
       FOLLOW
    ============================= */
    followUser: builder.mutation<{ success: true }, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    /* =============================
       UNFOLLOW
    ============================= */
    unfollowUser: builder.mutation<{ success: true }, string>({
      query: (userId) => ({
        url: `/users/${userId}/unfollow`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApi;
