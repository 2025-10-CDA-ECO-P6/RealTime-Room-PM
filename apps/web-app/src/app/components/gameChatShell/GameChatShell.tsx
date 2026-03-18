import { MainLayout, PageHeader, SidebarLayout } from "../../../core/layout";
import { ChatWindow } from "../../../features/chatRoom/components";
import { RpgPanel } from "../../../features/rpg/components";
import { SidebarPartyCard } from "../sidebarPartyCard/SidebarPartyCard";


export const GameChatShell: React.FC = () => {
  return (
    <MainLayout
      header={
        <PageHeader
          eyebrow="Session"
          title="Discussion et partie en direct"
          subtitle="Un espace simple pour suivre la partie, discuter et partager la salle."
        />
      }
      main={<RpgPanel />}
      right={<SidebarLayout top={<SidebarPartyCard />} main={<ChatWindow />} />}
    />
  );
};
