import { useState, useMemo } from "react";
import { currentUserService } from "../services";

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(() => currentUserService.getCurrentUser());

  const actions = useMemo(
    () => ({
      updateUserName: (userName: string) => {
        const updated = currentUserService.setUserName(userName);
        setCurrentUser(updated);
      },
    }),
    [],
  );

  return {
    ...currentUser,
    ...actions,
  };
}
