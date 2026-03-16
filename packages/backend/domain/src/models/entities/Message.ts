export class Message {
  constructor(
    public readonly userId: string,
    public readonly content: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
