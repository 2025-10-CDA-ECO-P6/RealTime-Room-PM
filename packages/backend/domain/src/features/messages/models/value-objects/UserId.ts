export class UserId {
  constructor(private readonly id: string) {
    if (!id) throw new Error("UserId cannot être vide");
  }

  get value(): string {
    return this.id;
  }
}
