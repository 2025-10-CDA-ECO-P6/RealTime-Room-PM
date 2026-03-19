import { MainLayout, PageHeader, SidebarLayout } from "../../../core/layout";
import { ChatWindow } from "../../../features/chatRoom/components";
import { RpgPanel } from "../../../features/rpg/components";
import { SidebarPartyCard } from "../sidebarPartyCard/SidebarPartyCard";

export const GameShell: React.FC = () => {
  return (
    <MainLayout
      header={
        <PageHeader
          title="Une seule voix, un seul héros"
          subtitle="Coordonnez vos choix, débattez chaque action et guidez ensemble le destin du groupe."
        />
      }
      main={<RpgPanel />}
      right={<SidebarLayout top={<SidebarPartyCard />} main={<ChatWindow />} />}
    />
  );
};
