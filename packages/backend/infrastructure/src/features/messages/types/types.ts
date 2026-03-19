import { ConnectedUserPresence } from "./ConnectedUserPresence";

export type JoinRoomHandler = (roomId: string, userId: string, userName: string) => { roomLink: string } | void;
export type LeaveRoomHandler = (roomId: string, userId: string, userName: string) => void;
export type MessageHandler = (roomId: string, data: { userId: string; userName: string; content: string }) => void;
export type RoomPresence = Map<string, ConnectedUserPresence>;
