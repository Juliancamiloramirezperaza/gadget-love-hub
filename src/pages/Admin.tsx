import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getBrands, getCategories, getUserRole } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

interface DeviceForm {
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  price: string;
  release_date: string;
  image_url: string;
  specs: string;
}

const emptyForm: DeviceForm = {
  name: "", brand_id: "", category_id: "", description: "",
  price: "", release_date: "", image_url: "", specs: "{}",
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DeviceForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setIsAdmin(role === "admin");
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setIsAdmin(role === "admin");
      } else {
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["admin-devices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*, brands(name), categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin === true,
  });

  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: getBrands, enabled: isAdmin === true });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories, enabled: isAdmin === true });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let parsedSpecs = {};
      try { parsedSpecs = JSON.parse(form.specs); } catch { /* ignore */ }

      const payload = {
        name: form.name,
        brand_id: form.brand_id || null,
        category_id: form.category_id || null,
        description: form.description || null,
        price: form.price ? parseFloat(form.price) : null,
        release_date: form.release_date || null,
        image_url: form.image_url || null,
        specs: parsedSpecs,
      };

      if (editingId) {
        const { error } = await supabase.from("devices").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("devices").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: editingId ? "Dispositivo actualizado" : "Dispositivo creado" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast({ title: "Dispositivo eliminado" });
    },
  });

  const handleEdit = (device: any) => {
    setEditingId(device.id);
    setForm({
      name: device.name,
      brand_id: device.brand_id || "",
      category_id: device.category_id || "",
      description: device.description || "",
      price: device.price?.toString() || "",
      release_date: device.release_date || "",
      image_url: device.image_url || "",
      specs: JSON.stringify(device.specs || {}, null, 2),
    });
    setShowForm(true);
  };

  if (isAdmin === null) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Verificando permisos...</div></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">No tienes permisos de administrador.</p>
          <Link to="/"><Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Panel de Administración</h1>
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo dispositivo
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6 animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                {editingId ? "Editar dispositivo" : "Nuevo dispositivo"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={200} />
              </div>
              <div>
                <Label>Precio (COP)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Marca</Label>
                <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {(brands as any[]).map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {(categories as any[]).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha de lanzamiento</Label>
                <Input type="date" value={form.release_date} onChange={(e) => setForm({ ...form, release_date: e.target.value })} />
              </div>
              <div>
                <Label>URL de imagen</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} maxLength={500} />
              </div>
              <div className="md:col-span-2">
                <Label>Descripción</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
              </div>
              <div className="md:col-span-2">
                <Label>Especificaciones (JSON)</Label>
                <Textarea value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} className="font-mono text-sm" rows={5} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name}>
                <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        )}

        {/* Devices table */}
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded bg-muted" />)}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dispositivo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Marca</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Precio</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {devices.map((d: any) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{d.brands?.name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{d.categories?.name || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{d.price ? `$${Number(d.price).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                          if (confirm("¿Eliminar este dispositivo?")) deleteMutation.mutate(d.id);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
