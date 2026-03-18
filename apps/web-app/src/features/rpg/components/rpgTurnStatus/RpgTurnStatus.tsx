import { SectionBlock, StatusPill } from "../../../../core/ui";
import { useRpg } from "../../hooks/useRpg";

export const RpgTurnStatus: React.FC = () => {
  const { turn, phase } = useRpg();

  const label = phase === "voting" ? "Vote en cours" : phase === "resolving" ? "Résolution" : "En attente";

  return (
    <SectionBlock eyebrow="Tour" title={`Tour ${turn}`}>
      <StatusPill>{label}</StatusPill>
    </SectionBlock>
  );
};
