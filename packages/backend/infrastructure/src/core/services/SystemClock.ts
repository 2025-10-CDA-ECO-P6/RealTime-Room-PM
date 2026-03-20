import { IClock } from "@repo/backend-domain";

export class SystemClock implements IClock {
  now(): Date {
    return new Date();
  }
}
