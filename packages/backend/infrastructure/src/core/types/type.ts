import { ConnectedUserPresence } from "./ConnectedUserPresence";

export type RoomPresence = Map<string, ConnectedUserPresence>;
export type SocketEventHandler<TPayload = unknown> = (payload: TPayload) => Promise<void> | void;
