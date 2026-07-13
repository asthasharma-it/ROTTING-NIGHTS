import GenreChips from "@/components/GenreChips";
import RegionChips from "@/components/RegionChips";

export default function BrowsePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-2 py-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Browse</h1>
        <p className="text-muted">Pick a genre, language, or region to explore.</p>
      </section>

      <GenreChips />
      <RegionChips />
    </div>
  );
}
