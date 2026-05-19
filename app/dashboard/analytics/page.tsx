import AnalyticsCharts from "@/app/components/dashboard/AnalyticsCharts";

export const metadata = { title: "Analytics — Chris Gramly" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-10">
      <header>
        <div className="eyebrow">§ Analytics</div>
        <h1 className="mt-2 font-display font-extralight text-4xl md:text-5xl tracking-[-0.04em] text-bone">
          Traffic, plainly.
        </h1>
      </header>
      <AnalyticsCharts />
    </div>
  );
}
