import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Laptop, Tablet, Watch, Zap } from "lucide-react";
import { getDevices, getBrands, getCategories } from "@/lib/supabase-helpers";
import DeviceCard from "@/components/DeviceCard";
import SearchAndFilters from "@/components/SearchAndFilters";
import Navbar from "@/components/Navbar";

const categoryIcons: Record<string, React.ReactNode> = {
  celulares: <Smartphone className="h-5 w-5" />,
  portatiles: <Laptop className="h-5 w-5" />,
  tablets: <Tablet className="h-5 w-5" />,
  smartwatches: <Watch className="h-5 w-5" />,
};

export default function Index() {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["devices", categorySlug, brandId, sortBy, search],
    queryFn: () =>
      getDevices({
        categorySlug: categorySlug === "all" ? undefined : categorySlug,
        brandId: brandId === "all" ? undefined : brandId,
        sortBy,
        search: search || undefined,
      }),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero relative overflow-hidden px-4 py-16 text-center md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190,95%,42%,0.15),transparent_70%)]" />
        <div className="relative z-10 container mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-4 w-4" /> Explora lo último en tecnología
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
            <span className="text-primary-foreground">Encuentra tu próximo</span>
            <br />
            <span className="text-gradient">dispositivo inteligente</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Compara celulares, portátiles, tablets y smartwatches de las mejores marcas del mercado
          </p>

          {/* Quick category chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setCategorySlug("all")}
              className={`filter-chip ${categorySlug === "all" ? "active" : ""}`}
            >
              Todos
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setCategorySlug(cat.slug)}
                className={`filter-chip flex items-center gap-2 ${categorySlug === cat.slug ? "active" : ""}`}
              >
                {categoryIcons[cat.slug]}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <SearchAndFilters
          search={search}
          onSearchChange={setSearch}
          categorySlug={categorySlug}
          onCategoryChange={setCategorySlug}
          brandId={brandId}
          onBrandChange={setBrandId}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={categories as any}
          brands={brands as any}
        />

        <div className="mt-4 text-sm text-muted-foreground">
          {devices.length} dispositivo{devices.length !== 1 ? "s" : ""} encontrado{devices.length !== 1 ? "s" : ""}
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Smartphone className="mb-4 h-16 w-16 opacity-30" />
            <p className="text-lg font-medium">No se encontraron dispositivos</p>
            <p className="text-sm">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {devices.map((device: any, i: number) => (
              <DeviceCard key={device.id} device={device} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold">TechPulse</p>
          <p className="mt-1">Tu guía de dispositivos inteligentes © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
