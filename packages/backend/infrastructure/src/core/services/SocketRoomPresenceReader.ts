import { IRoomPresenceReader } from "@repo/backend-application";
import { ISocketPresenceStore } from "../interfaces";

export class SocketRoomPresenceReader implements IRoomPresenceReader {
  constructor(private readonly socketPresenceStore: ISocketPresenceStore) {}

  async getPresentUserIds(roomId: string): Promise<string[]> {
    return this.socketPresenceStore.getUserIds(roomId);
  }
}
