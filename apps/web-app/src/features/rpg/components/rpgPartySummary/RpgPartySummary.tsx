import { InfoRow, SectionBlock } from "../../../../core/ui";

interface RpgPartySummaryProps {
  playerCount: number;
}

export const RpgPartySummary: React.FC<RpgPartySummaryProps> = ({ playerCount }) => {
  return (
    <SectionBlock eyebrow="Joueurs" title="connectés">
      <InfoRow label="Connectés" value={playerCount} />
    </SectionBlock>
  );
};