import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import usersReducer from "./slices/users.slice";
import workflowsReducer from "./slices/workflows.slice";
import actionsReducer from "./slices/actions.slice";
import apiKeysReducer from "./slices/apikeys.slice";
import eventsReducer from "./slices/events.slice";
import dispatchReducer from "./slices/dispatch.slice";
import dashboardReducer from "./slices/dashboard.slice";
import billingReducer from "./slices/billing.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    workflows: workflowsReducer,
    actions: actionsReducer,
    apiKeys: apiKeysReducer,
    events: eventsReducer,
    dispatch: dispatchReducer,
    dashboard: dashboardReducer,
    billing: billingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
