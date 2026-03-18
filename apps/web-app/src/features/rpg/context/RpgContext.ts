import { createContext } from "react";
import type { RpgState } from "../types";

export interface RpgContextValue extends RpgState {
  voteAction: (actionId: string) => void;
}

export const RpgContext = createContext<RpgContextValue | null>(null);
