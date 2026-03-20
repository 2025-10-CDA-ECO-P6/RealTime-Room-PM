export interface IRoomPresenceReader {
  getPresentUserIds(roomId: string): Promise<string[]>;
}
