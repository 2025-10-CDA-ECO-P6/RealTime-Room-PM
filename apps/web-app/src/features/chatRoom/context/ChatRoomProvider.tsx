import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { ChatRoomContext } from "./ChatRoomContext";
import { loggerService } from "../../../core/services/Loggerservice";
import { type Message, initialState } from "../types";
import { chatRoomReducer } from "./chatRoomReducer";
import { getSocketService, initSocketService } from "../services";
import type { CurrentUser } from "../../common/types";

interface ChatRoomProviderProps {
  children: React.ReactNode;
  roomId: string;
}

export const ChatRoomProvider: React.FC<ChatRoomProviderProps> = ({ children, roomId }) => {
  const [state, dispatch] = useReducer(chatRoomReducer, {
    ...initialState,
    roomId,
  });

  const stateRef = useRef(state);
  const currentUserRef = useRef<CurrentUser | null>(null);
  const pendingJoinUserRef = useRef<CurrentUser | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const sendMessage = useCallback((content: string) => {
    const currentState = stateRef.current;
    const currentUser = currentUserRef.current;

    if (!currentState.isJoined || currentUser === null || !content.trim()) {
      loggerService.warn("ChatRoom", "Cannot send message: user not joined or content empty");
      return;
    }

    getSocketService().sendMessage(currentState.roomId, currentUser, content);
  }, []);

  const joinRoom = useCallback((user: CurrentUser) => {
    const socketService = getSocketService();
    const currentState = stateRef.current;

    pendingJoinUserRef.current = user;
    currentUserRef.current = user;

    if (!socketService.isConnected()) {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "connecting" });
      return;
    }

    socketService.joinRoom(currentState.roomId, user);
  }, []);

  const leaveRoom = useCallback(() => {
    const socketService = getSocketService();

    socketService.leaveRoom();
    pendingJoinUserRef.current = null;
    currentUserRef.current = null;

    dispatch({ type: "SET_IS_JOINED", payload: false });
    dispatch({ type: "SET_CONNECTION_STATUS", payload: "disconnected" });
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);

  useEffect(() => {
    const socketService = initSocketService();

    const handleConnect = () => {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "connected" });

      const pendingUser = pendingJoinUserRef.current;
      const currentState = stateRef.current;

      if (pendingUser !== null && !currentState.isJoined) {
        socketService.joinRoom(currentState.roomId, pendingUser);
      }
    };

    const handleDisconnect = (reason: string) => {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "disconnected" });
      dispatch({ type: "SET_IS_JOINED", payload: false });
      loggerService.warn("ChatRoom", "Socket disconnected", { reason });
    };

    const handleError = (error: unknown): void => {
      const errorMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : error !== null && typeof error === "object"
              ? JSON.stringify(error)
              : "Unknown error";

      dispatch({ type: "SET_ERROR", payload: errorMsg });
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "error" });
    };

    const handleMessageReceived = (data: { userId: string; userName: string; content: string }) => {
      const message: Message = {
        id: crypto.randomUUID(),
        userId: data.userId,
        userName: data.userName,
        content: data.content,
        timestamp: Date.now(),
        type: "user",
      };

      dispatch({ type: "ADD_MESSAGE", payload: message });
    };

    const handleRoomJoined = (data: {
      roomId: string;
      userId: string;
      userName: string;
      userCount: number;
      roomLink: string;
    }) => {
      currentUserRef.current = {
        userId: data.userId,
        userName: data.userName,
      };
      pendingJoinUserRef.current = null;

      dispatch({ type: "SET_IS_JOINED", payload: true });
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "connected" });
      dispatch({ type: "SET_USER_COUNT", payload: data.userCount });
      dispatch({ type: "SET_ERROR", payload: null });
    };

    const handleUserJoined = (data: { userId: string; userName: string; userCount: number }) => {
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        userId: "system",
        userName: "Système",
        content: `${data.userName} a rejoint la salle`,
        timestamp: Date.now(),
        type: "system",
      };

      dispatch({ type: "ADD_MESSAGE", payload: systemMessage });
      dispatch({ type: "SET_USER_COUNT", payload: data.userCount });
    };

    const handleUserLeft = (data: { userId: string; userName: string; userCount: number }) => {
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        userId: "system",
        userName: "Système",
        content: `${data.userName} a quitté la salle`,
        timestamp: Date.now(),
        type: "system",
      };

      dispatch({ type: "ADD_MESSAGE", payload: systemMessage });
      dispatch({ type: "SET_USER_COUNT", payload: data.userCount });
    };

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);
    socketService.onError(handleError);
    socketService.onMessageReceived(handleMessageReceived);
    socketService.onRoomJoined(handleRoomJoined);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);

    socketService.connect().catch((error) => {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "error" });
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : String(error) });
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const value = useMemo(
    () => ({
      roomId: state.roomId,
      room: state.room,
      messages: state.messages,
      connectionStatus: state.connectionStatus,
      userCount: state.userCount,
      isJoined: state.isJoined,
      error: state.error,
      sendMessage,
      joinRoom,
      leaveRoom,
    }),
    [
      state.roomId,
      state.room,
      state.messages,
      state.connectionStatus,
      state.userCount,
      state.isJoined,
      state.error,
      sendMessage,
      joinRoom,
      leaveRoom,
    ],
  );

  return <ChatRoomContext.Provider value={value}>{children}</ChatRoomContext.Provider>;
};