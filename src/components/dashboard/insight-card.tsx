interface InsightCardProps {
  text: string;
}

export function InsightCard({ text }: InsightCardProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-white px-4 py-3 text-sm text-text-primary shadow-card">
      {text}
    </div>
  );
}
