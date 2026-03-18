import { useContext } from "react";
import { RpgContext } from "../context/RpgContext";

export const useRpg = () => {
  const ctx = useContext(RpgContext);

  if (!ctx) {
    throw new Error("useRpg must be used within RpgProvider");
  }

  return ctx;
};
