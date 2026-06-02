import { createFileRoute } from "@tanstack/react-router";
import { InstaLayout } from "@/components/insta/Layout";
import { fetchReels, type CloudPost } from "@/lib/insta-cloud";
import { Heart, MessageCircle, Send, MoreHorizontal, Music2, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/reels")({
  head: () => ({ meta: [{ title: "Reels — Instaclone" }] }),
  component: Reels,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ReelItem({ reel, muted, onToggleMute }: { reel: CloudPost; muted: boolean; onToggleMute: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    const el = containerRef.current;
    if (!v || !el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.intersectionRatio > 0.6) {
          v.play().then(() => setPlaying(true)).catch(() => {});
        } else { v.pause(); setPlaying(false); }
      }),
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <div ref={containerRef} className="snap-start relative h-[calc(100dvh-3.5rem)] md:h-screen w-full flex items-center justify-center bg-black">
      <div className="relative h-full md:h-[90vh] md:max-h-[900px] aspect-[9/16] max-w-full">
        <video ref={videoRef} src={reel.video} loop playsInline muted={muted}
          className="h-full w-full object-cover md:rounded-xl bg-black"
          onClick={togglePlay} onDoubleClick={() => setLiked(true)} />
        {!playing && (
          <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </button>
        )}
        <button onClick={onToggleMute} className="absolute top-3 right-3 bg-black/40 rounded-full p-2" aria-label="mute toggle">
          {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
          <button onClick={() => setLiked((v) => !v)} className="flex flex-col items-center">
            <Heart className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="text-xs mt-1">{(reel.likes + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button className="flex flex-col items-center">
            <MessageCircle className="w-7 h-7" />
            <span className="text-xs mt-1">{reel.comments}</span>
          </button>
          <Send className="w-7 h-7" />
          <MoreHorizontal className="w-7 h-7" />
          <img src={reel.avatar} className="w-8 h-8 rounded-md border border-white/40" alt="audio" />
        </div>
        <div className="absolute left-0 right-16 bottom-4 px-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <img src={reel.avatar} className="w-8 h-8 rounded-full border border-white/50" alt={reel.username} />
            <span className="font-semibold text-sm">{reel.username}</span>
            <button className="ml-2 text-xs border border-white/70 px-2 py-0.5 rounded">Follow</button>
          </div>
          <p className="text-sm line-clamp-2">{reel.caption}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <Music2 className="w-3 h-3" />
            <span className="truncate">{reel.username} · original audio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reels() {
  const [pool, setPool] = useState<CloudPost[]>([]);
  const [items, setItems] = useState<CloudPost[]>([]);
  const [muted, setMuted] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetchReels().then((r) => {
      if (!alive) return;
      setPool(r);
      const shuffled = shuffle(r).slice(0, 5);
      setItems(shuffled);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || pool.length === 0) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - el.clientHeight * 1.5) {
        setItems((prev) => {
          if (prev.length > 80) return prev;
          const more = shuffle(pool).slice(0, 5).map((r, i) => ({ ...r, id: `${r.id}-${Date.now()}-${i}` }));
          return [...prev, ...more];
        });
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pool]);

  return (
    <InstaLayout>
      <div ref={scrollerRef} className="snap-y-mandatory overflow-y-scroll scrollbar-none h-[calc(100dvh-3.5rem-3.5rem)] md:h-screen">
        {items.map((r) => (
          <ReelItem key={r.id} reel={r} muted={muted} onToggleMute={() => setMuted((v) => !v)} />
        ))}
      </div>
    </InstaLayout>
  );
}
