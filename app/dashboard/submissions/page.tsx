import SubmissionsTable from "@/app/components/dashboard/SubmissionsTable";

export const metadata = { title: "Submissions — Chris Gramly" };

export default function SubmissionsPage() {
  return (
    <div className="space-y-10">
      <header>
        <div className="eyebrow">§ Submissions</div>
        <h1 className="mt-2 font-display font-extralight text-4xl md:text-5xl tracking-[-0.04em] text-bone">
          Lead desk.
        </h1>
      </header>
      <SubmissionsTable />
    </div>
  );
}
