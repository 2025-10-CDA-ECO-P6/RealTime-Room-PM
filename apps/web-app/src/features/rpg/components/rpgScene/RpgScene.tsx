import { SurfaceCard } from "../../../../core/ui";

export const RpgScene: React.FC = () => {
  return (
    <SurfaceCard>
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Scène</p>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          Un ennemi apparaît dans l’ombre. Le groupe doit décider de la prochaine action.
        </p>
      </div>
    </SurfaceCard>
  );
};