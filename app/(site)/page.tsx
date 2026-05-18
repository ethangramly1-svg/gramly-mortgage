export default function HomePage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1
        className="text-5xl md:text-7xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Chris Gramly
      </h1>
      <p
        className="mt-4 text-base md:text-lg opacity-70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Clear, modern mortgage advisory in Las Vegas
      </p>
    </section>
  );
}
