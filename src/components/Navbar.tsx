import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Smartphone, LogIn, LogOut, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "@/lib/supabase-helpers";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Smartphone className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight">
            Tech<span className="text-gradient">Pulse</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/">
            <Button variant="ghost" size="sm">Inicio</Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-primary">
                <Shield className="mr-1 h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" /> Salir
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">
                <LogIn className="mr-1 h-4 w-4" /> Ingresar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-2 border-t border-border bg-card px-4 py-3 md:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Inicio</Button>
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-primary">
                <Shield className="mr-1 h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          {user ? (
            <Button variant="outline" className="w-full justify-start" onClick={() => { handleLogout(); setMenuOpen(false); }}>
              <LogOut className="mr-1 h-4 w-4" /> Salir
            </Button>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button className="w-full justify-start">
                <LogIn className="mr-1 h-4 w-4" /> Ingresar
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
