import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "./slices/auth.slice";
import { authApi } from "./apis/auth-api";
import { userApi } from "./apis/user-api";

/* =============================
   Persist config
============================= */
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "accessToken", "refreshToken", "isAuthenticated"],
};

/* =============================
   Persisted reducer
============================= */
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

/* =============================
   Store
============================= */
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware),
});

/* =============================
   Persistor
============================= */
export const persistor = persistStore(store);

/* =============================
   Setup listeners (optional but recommended)
============================= */
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
