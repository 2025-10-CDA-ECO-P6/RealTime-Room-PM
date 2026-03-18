import { InfoRow, SectionBlock } from "../../../../core/ui";
import { useChatRoom } from "../../hooks/useChatRoom";

export const ChatRoomMeta: React.FC = () => {
  const chatRoom = useChatRoom();

  return (
    <SectionBlock eyebrow="Salon" title="Informations">
      <InfoRow label="Code" value={chatRoom.roomId} />
    </SectionBlock>
  );
};
