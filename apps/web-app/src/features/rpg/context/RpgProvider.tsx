import React, { useMemo } from "react";
import { RpgContext } from "./RpgContext";
import type { RpgState } from "../types";

interface Props {
  children: React.ReactNode;
}

const mockState: RpgState = {
  heroName: "Eldric",
  phase: "voting",
  turn: 1,
  players: ["Lina", "Tor", "Mika"],
  availableActions: [
    { id: "attack", label: "Attaquer" },
    { id: "defend", label: "Se défendre" },
    { id: "spell", label: "Lancer un sort" },
    { id: "wait", label: "Attendre" },
  ],
};

export const RpgProvider: React.FC<Props> = ({ children }) => {
  const value = useMemo(
    () => ({
      ...mockState,
      voteAction: (actionId: string) => {
        console.log("voteAction", actionId);
      },
    }),
    [],
  );

  return <RpgContext.Provider value={value}>{children}</RpgContext.Provider>;
};
