import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CloudPost } from "@/lib/insta-cloud";

export function PostCard({ post }: { post: CloudPost }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Autoplay when in view, pause when out — Instagram-style
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          v.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

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

      <div className="relative aspect-square bg-muted overflow-hidden">
        {post.video ? (
          <>
            <video
              ref={videoRef}
              src={post.video}
              className="w-full h-full object-contain bg-black"
              loop
              playsInline
              muted={muted}
              preload="metadata"
              onClick={togglePlay}
              onDoubleClick={() => setLiked(true)}
            />
            {!playing && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
                aria-label="play"
              >
                <span className="bg-black/50 rounded-full p-4">
                  <Play className="w-8 h-8 text-white fill-white" />
                </span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMuted((m) => !m);
              }}
              className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/70 rounded-full p-2"
              aria-label={muted ? "unmute" : "mute"}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </>
        ) : (
          <img
            src={post.image}
            alt={post.caption}
            className="w-full h-full object-cover"
            onDoubleClick={() => setLiked(true)}
            loading="lazy"
          />
        )}
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
