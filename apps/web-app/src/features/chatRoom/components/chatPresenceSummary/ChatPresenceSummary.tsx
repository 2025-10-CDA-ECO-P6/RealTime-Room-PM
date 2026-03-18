import { InfoRow, SectionBlock, StatusPill } from "../../../../core/ui";
import { useChatRoom } from "../../hooks/useChatRoom";

export const ChatPresenceSummary: React.FC = () => {
  const chatRoom = useChatRoom();

  const statusLabel =
    chatRoom.connectionStatus === "connected"
      ? "En ligne"
      : chatRoom.connectionStatus === "connecting"
        ? "Connexion"
        : chatRoom.connectionStatus === "error"
          ? "Erreur"
          : "Hors ligne";

  const tone =
    chatRoom.connectionStatus === "connected"
      ? "success"
      : chatRoom.connectionStatus === "connecting"
        ? "warning"
        : chatRoom.connectionStatus === "error"
          ? "danger"
          : "neutral";

  return (
    <SectionBlock eyebrow="Discussion" title="Présence">
      <InfoRow label="Statut" value={<StatusPill tone={tone}>{statusLabel}</StatusPill>} />
    </SectionBlock>
  );
};
