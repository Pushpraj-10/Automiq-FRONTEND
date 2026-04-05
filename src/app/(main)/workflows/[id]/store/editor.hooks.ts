import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { WorkflowEditorDispatch, WorkflowEditorRootState } from "./editor.store";

export const useWorkflowEditorDispatch: () => WorkflowEditorDispatch = useDispatch;
export const useWorkflowEditorSelector: TypedUseSelectorHook<WorkflowEditorRootState> = useSelector;
