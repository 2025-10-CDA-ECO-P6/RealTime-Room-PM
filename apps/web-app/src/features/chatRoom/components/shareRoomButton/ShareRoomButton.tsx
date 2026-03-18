import { useState } from "react";
import { Button } from "../../../../core/ui";

export const ShareRoomButton: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(globalThis.location.href);
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="secondary" fullWidth onClick={handleCopy}>
      {copied ? "Lien copié" : "Copier le lien"}
    </Button>
  );
};
