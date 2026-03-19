import { SurfaceCard, Stack } from "../../../core/ui";
import { ShareRoomButton } from "../../../features/chatRoom/components";
import { useChatRoom } from "../../../features/chatRoom/hooks";
import { RpgPartySummary } from "../../../features/rpg/components";
import styles from "./SidebarPartyCard.module.css";

export const SidebarPartyCard: React.FC = () => {
  const { userCount } = useChatRoom();

  return (
    <SurfaceCard className={styles.card}>
      <Stack gap="lg">
        <RpgPartySummary playerCount={userCount} />
        <ShareRoomButton />
      </Stack>
    </SurfaceCard>
  );
};
