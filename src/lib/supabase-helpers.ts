import { supabase } from "@/integrations/supabase/client";

export async function getDevices(filters?: {
  categorySlug?: string;
  brandId?: string;
  search?: string;
  sortBy?: string;
}) {
  let query = supabase
    .from("devices")
    .select("*, brands(name, logo_url), categories(name, slug)");

  if (filters?.categorySlug) {
    query = query.eq("categories.slug", filters.categorySlug);
  }
  if (filters?.brandId) {
    query = query.eq("brand_id", filters.brandId);
  }
  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  switch (filters?.sortBy) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("release_date", { ascending: false });
      break;
    case "oldest":
      query = query.order("release_date", { ascending: true });
      break;
    default:
      query = query.order("release_date", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  // Filter by category on client side since nested filter doesn't work well
  if (filters?.categorySlug) {
    return data?.filter((d: any) => d.categories?.slug === filters.categorySlug) || [];
  }

  return data || [];
}

export async function getDevice(id: string) {
  const { data, error } = await supabase
    .from("devices")
    .select("*, brands(name, logo_url), categories(name, slug), device_images(id, image_url)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getComments(deviceId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(display_name, avatar_url)")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addComment(deviceId: string, userId: string, content: string, rating: number) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ device_id: deviceId, user_id: userId, content, rating })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getBrands() {
  const { data, error } = await supabase.from("brands").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  if (error) return "user";
  return data?.role || "user";
}

export function formatPrice(price: number | null) {
  if (!price) return "N/A";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
