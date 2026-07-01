import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";

const APP_URL = "https://academiq-logbook.vercel.app";
const SHARE_MESSAGE = `Just found this — AI writes your SIWES logbook entries for you in seconds. Saved me so much time 👀\n\n${APP_URL}`;

interface Props {
  onDismiss?: () => void;
}

export default function WhatsAppSharePrompt({ onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleShare = () => {
    const encoded = encodeURIComponent(SHARE_MESSAGE);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-emerald-100 hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            That took 10 seconds. Your coursemates are still stressing over theirs.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Share AcademiQ with your SIWES group chat — they'll thank you.
          </p>
          <button
            onClick={handleShare}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" />
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
