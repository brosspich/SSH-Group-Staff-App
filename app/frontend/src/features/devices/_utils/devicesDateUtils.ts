export function formatAgo(diffMs: number): string {
  if (diffMs < 60 * 1000) return "just now";
  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatLastActive(isoString?: string | null): string {
  if (!isoString) return "online";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "online";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  // Within 2 mins (or slight clock skew) -> online
  if (diffMs < 120 * 1000 && diffMs > -120 * 1000) {
    return "online";
  }

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (d.toDateString() === now.toDateString()) {
    return `today at ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `yesterday at ${timeStr}`;
  }

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatListLastActive(isoString?: string | null): string {
  if (!isoString) return "online";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "online";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  if (diffMs < 120 * 1000 && diffMs > -120 * 1000) {
    return "online";
  }

  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `yesterday ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTimeWithAgo(isoString?: string | null): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "—";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const diffMs = Math.max(0, Date.now() - d.getTime());
  const agoText = formatAgo(diffMs);

  return `${day}/${month}/${year} ${timeStr} • ${agoText}`;
}
