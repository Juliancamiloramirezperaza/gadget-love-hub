import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchAndFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categorySlug: string;
  onCategoryChange: (value: string) => void;
  brandId: string;
  onBrandChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string }[];
}

export default function SearchAndFilters({
  search, onSearchChange,
  categorySlug, onCategoryChange,
  brandId, onBrandChange,
  sortBy, onSortChange,
  categories, brands,
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar dispositivos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={categorySlug} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandId} onValueChange={onBrandChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[170px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="oldest">Más antiguos</SelectItem>
            <SelectItem value="price_asc">Precio: menor</SelectItem>
            <SelectItem value="price_desc">Precio: mayor</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
