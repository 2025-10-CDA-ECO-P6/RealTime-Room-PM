import { checkInfrastructure } from "@repo/backend-infrastructure";

export function checkApplication(): boolean {
  return checkInfrastructure(); // dépend de l'infrastructure
}
