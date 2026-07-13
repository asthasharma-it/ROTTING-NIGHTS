import Image from "next/image";
import { Provider } from "@/types/media";

function ProviderRow({ providers }: { providers: Provider[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {providers.map((p) => (
        <div key={`${p.type}-${p.name}`} className="flex flex-col items-center gap-1">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border">
            <Image src={p.logoUrl} alt={p.name} fill sizes="40px" className="object-cover" />
          </div>
          <span className="text-xs text-muted">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function StreamingLogos({ providers }: { providers: Provider[] }) {
  if (providers.length === 0) {
    return (
      <p className="text-sm text-muted">
        No streaming info available for this title in your region yet.
      </p>
    );
  }

  const streaming = providers.filter((p) => p.type === "stream");
  const seenRentBuy = new Set<string>();
  const rentOrBuy = providers.filter((p) => {
    if (p.type !== "rent" && p.type !== "buy") return false;
    if (seenRentBuy.has(p.name)) return false;
    seenRentBuy.add(p.name);
    return true;
  });

  return (
    <div className="space-y-3">
      {streaming.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted">Stream on</p>
          <ProviderRow providers={streaming} />
        </div>
      )}
      {rentOrBuy.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted">Also available to rent or buy</p>
          <ProviderRow providers={rentOrBuy} />
        </div>
      )}
    </div>
  );
}
