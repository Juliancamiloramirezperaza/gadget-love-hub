import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/supabase-helpers";

interface DeviceCardProps {
  device: {
    id: string;
    name: string;
    image_url: string | null;
    price: number | null;
    release_date: string | null;
    brands: { name: string } | null;
    categories: { name: string; slug: string } | null;
  };
  index?: number;
}

export default function DeviceCard({ device, index = 0 }: DeviceCardProps) {
  return (
    <Link
      to={`/device/${device.id}`}
      className="card-device group block overflow-hidden rounded-lg border border-border"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {device.image_url ? (
          <img
            src={device.image_url}
            alt={device.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        {device.categories && (
          <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground">
            {device.categories.name}
          </Badge>
        )}
      </div>
      <div className="p-4">
        {device.brands && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {device.brands.name}
          </p>
        )}
        <h3 className="font-display text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {device.name}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-primary">
            {formatPrice(device.price)}
          </span>
        </div>
        {device.release_date && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(device.release_date)}
          </div>
        )}
      </div>
    </Link>
  );
}
