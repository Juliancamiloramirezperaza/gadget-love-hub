import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Tag, DollarSign, Cpu, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDevice, formatPrice, formatDate } from "@/lib/supabase-helpers";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const { data: device, isLoading, error } = useQuery({
    queryKey: ["device", id],
    queryFn: () => getDevice(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Dispositivo no encontrado</p>
          <Link to="/"><Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button></Link>
        </div>
      </div>
    );
  }

  const specs = (device.specs as Record<string, string>) || {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {device.image_url ? (
              <img src={device.image_url} alt={device.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-muted">
                <ImageIcon className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="animate-fade-up">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {(device as any).categories && (
                <Badge className="bg-primary/10 text-primary">{(device as any).categories.name}</Badge>
              )}
              {(device as any).brands && (
                <Badge variant="outline">{(device as any).brands.name}</Badge>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold md:text-4xl">{device.name}</h1>

            <div className="mt-4 flex items-center gap-4">
              <span className="font-display text-3xl font-bold text-primary">
                {formatPrice(device.price)}
              </span>
            </div>

            {device.release_date && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Lanzamiento: {formatDate(device.release_date)}
              </div>
            )}

            {device.description && (
              <div className="mt-6">
                <h2 className="mb-2 font-display text-lg font-semibold">Descripción</h2>
                <p className="leading-relaxed text-foreground/80">{device.description}</p>
              </div>
            )}

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" /> Especificaciones
                </h2>
                <div className="grid gap-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                      <span className="text-sm font-medium capitalize text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional images */}
            {(device as any).device_images?.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 font-display text-lg font-semibold">Galería</h2>
                <div className="grid grid-cols-3 gap-2">
                  {(device as any).device_images.map((img: any) => (
                    <img key={img.id} src={img.image_url} alt="" className="rounded-lg object-cover aspect-square" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <CommentSection deviceId={id!} user={user} />
      </main>
    </div>
  );
}
