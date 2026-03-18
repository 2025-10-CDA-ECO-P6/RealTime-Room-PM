import { Panel } from "../../../../core/ui";
import { RpgActions } from "../rpgActions/RpgActions";
import { RpgScene } from "../rpgScene/RpgScene";
import { RpgTurnStatus } from "../rpgTurnStatus/RpgTurnStatus";

import styles from "./RpgPanel.module.css";

export const RpgPanel: React.FC = () => {
  return (
    <Panel title="" hasBorder>
      <div className={styles.container}>
        <RpgTurnStatus />
        <RpgScene />
        <RpgActions />
      </div>
    </Panel>
  );
};
