import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { CloudPost } from "@/lib/insta-cloud";

export function PostCard({ post }: { post: CloudPost }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article className="border-b border-border md:border md:rounded-lg md:mb-6 bg-card">
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="p-[2px] rounded-full bg-story-ring">
            <img src={post.avatar} alt={post.username} className="w-9 h-9 rounded-full bg-background p-[2px]" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{post.username}</div>
            <div className="text-xs text-muted-foreground">Original audio</div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5" />
      </header>

      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
          onDoubleClick={() => setLiked(true)}
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked((v) => !v)} aria-label="like">
              <Heart className={`w-6 h-6 transition ${liked ? "fill-destructive text-destructive" : ""}`} />
            </button>
            <MessageCircle className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
          <button onClick={() => setSaved((v) => !v)} aria-label="save">
            <Bookmark className={`w-6 h-6 ${saved ? "fill-foreground" : ""}`} />
          </button>
        </div>
        {post.likes > 0 && (
          <div className="text-sm font-semibold">{(post.likes + (liked ? 1 : 0)).toLocaleString()} likes</div>
        )}
        {post.caption && (
          <p className="text-sm mt-1">
            <span className="font-semibold mr-2">{post.username}</span>
            {post.caption}
          </p>
        )}
      </div>
    </article>
  );
}
