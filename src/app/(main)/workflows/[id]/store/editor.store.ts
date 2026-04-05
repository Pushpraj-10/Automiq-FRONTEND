import { configureStore } from "@reduxjs/toolkit";
import { workflowEditorReducer } from "./editor.slice";

export function createWorkflowEditorStore() {
  return configureStore({
    reducer: {
      editor: workflowEditorReducer,
    },
  });
}

export type WorkflowEditorStore = ReturnType<typeof createWorkflowEditorStore>;
export type WorkflowEditorRootState = ReturnType<WorkflowEditorStore["getState"]>;
export type WorkflowEditorDispatch = WorkflowEditorStore["dispatch"];
