import { Button, SectionBlock } from "../../../../core/ui";
import { useRpg } from "../../hooks/useRpg";

export const RpgActions: React.FC = () => {
  const { availableActions, voteAction } = useRpg();

  return (
    <SectionBlock eyebrow="Choix" title="Actions disponibles">
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {availableActions.map((action) => (
          <Button key={action.id} variant="secondary" onClick={() => voteAction(action.id)}>
            {action.label}
          </Button>
        ))}
      </div>
    </SectionBlock>
  );
};
