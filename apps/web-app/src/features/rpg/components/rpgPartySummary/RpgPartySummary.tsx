import { InfoRow, SectionBlock } from "../../../../core/ui";
import { useRpg } from "../../hooks/useRpg";

export const RpgPartySummary: React.FC = () => {
  const { heroName, players } = useRpg();

  return (
    <SectionBlock eyebrow="Groupe" title="Héros">
      <InfoRow label="Nom" value={heroName} />
      <InfoRow label="Joueurs" value={players.length} />
    </SectionBlock>
  );
};
