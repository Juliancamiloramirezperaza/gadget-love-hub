import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getComments, addComment, formatDate } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

interface CommentSectionProps {
  deviceId: string;
  user: User | null;
}

export default function CommentSection({ deviceId, user }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", deviceId],
    queryFn: () => getComments(deviceId),
  });

  const mutation = useMutation({
    mutationFn: () => addComment(deviceId, user!.id, content, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", deviceId] });
      setContent("");
      setRating(5);
      toast({ title: "¡Comentario publicado!" });
    },
    onError: () => {
      toast({ title: "Error al publicar", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate();
  };

  return (
    <section className="mt-8">
      <h2 className="mb-4 font-display text-2xl font-bold flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        Opiniones ({comments.length})
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-1">
            <span className="mr-2 text-sm text-muted-foreground">Tu calificación:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s)}>
                <Star
                  className={`h-5 w-5 transition-colors ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Escribe tu opinión sobre este dispositivo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            className="mb-3"
          />
          <Button type="submit" disabled={mutation.isPending || !content.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Publicando..." : "Publicar comentario"}
          </Button>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4 text-center">
          <p className="text-muted-foreground">
            <Link to="/auth" className="font-medium text-primary hover:underline">Inicia sesión</Link> para dejar tu opinión
          </p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Aún no hay opiniones. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="rounded-lg border border-border bg-card p-4 animate-fade-in">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(comment.profiles?.display_name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{comment.profiles?.display_name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= (comment.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
