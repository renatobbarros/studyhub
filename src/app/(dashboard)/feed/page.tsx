"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { MessageSquare, Heart, Share2, User } from "lucide-react";

interface Post {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  createdAt: any;
  type: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Feed da Turma</h1>
      </div>

      {/* Post Composer Placeholder */}
      <div className="rounded-2xl border bg-background/50 p-4 glass flex gap-4">
        <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
          <User className="w-6 h-6 text-foreground/40" />
        </div>
        <textarea 
          placeholder="Compartilhe um link, dúvida ou material..."
          className="w-full bg-transparent border-none focus:ring-0 resize-none text-foreground placeholder:text-foreground/30 py-2"
          rows={2}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-foreground/5 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 opacity-40">
          <MessageSquare className="w-12 h-12 mx-auto mb-4" />
          <p>Nenhuma postagem ainda. Comece a conversa!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl border bg-background/50 p-6 glass flex flex-col gap-4 hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{post.userName || "Estudante"}</p>
                  <p className="text-xs text-foreground/40">{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : "Agora mesmo"}</p>
                </div>
              </div>
              
              <p className="text-foreground/80 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center gap-6 pt-2 border-t border-foreground/5">
                <button className="flex items-center gap-2 text-sm text-foreground/50 hover:text-primary-600 transition">
                  <Heart className="w-4 h-4" /> 0
                </button>
                <button className="flex items-center gap-2 text-sm text-foreground/50 hover:text-primary-600 transition">
                  <MessageSquare className="w-4 h-4" /> 0
                </button>
                <button className="flex items-center gap-2 text-sm text-foreground/50 hover:text-primary-600 transition">
                  <Share2 className="w-4 h-4" /> Compartilhar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
