import { SurfaceCard, Stack } from "../../../core/ui";
import { ChatPresenceSummary, ChatRoomMeta, ShareRoomButton } from "../../../features/chatRoom/components";
import { RpgPartySummary, RpgTurnStatus } from "../../../features/rpg/components";
import styles from "./SidebarPartyCard.module.css";

export const SidebarPartyCard: React.FC = () => {
  return (
    <SurfaceCard className={styles.card}>
      <Stack gap="lg">
        <header className={styles.header}>
          <p className={styles.eyebrow}>Salle & partie</p>
          <h2 className={styles.title}>Vue d’ensemble</h2>
          <p className={styles.subtitle}>
            Quelques informations utiles sur la session en cours et la discussion en direct.
          </p>
        </header>

        <ChatRoomMeta />
        <ChatPresenceSummary />
        <RpgPartySummary />
        <RpgTurnStatus />
        <ShareRoomButton />
      </Stack>
    </SurfaceCard>
  );
};
