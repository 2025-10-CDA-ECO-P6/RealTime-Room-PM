import { checkDomain } from "@repo/backend-domain";

export function checkInfrastructure(): boolean {
  return checkDomain(); // dépend du domain
}
