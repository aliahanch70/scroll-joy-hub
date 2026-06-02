import { createFileRoute } from "@tanstack/react-router";
import { InstaLayout } from "@/components/insta/Layout";
import { getRandomReels, getUser, type Reel } from "@/lib/insta-data";
import { Heart, MessageCircle, Send, MoreHorizontal, Music2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/reels")({
  head: () => ({ meta: [{ title: "Reels — Instaclone" }] }),
  component: Reels,
});

function ReelItem({ reel, muted, onToggleMute }: { reel: Reel; muted: boolean; onToggleMute: () => void }) {
  const user = getUser(reel.userId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    const el = containerRef.current;
    if (!v || !el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.intersectionRatio > 0.6) {
            v.play().then(() => setPlaying(true)).catch(() => {});
          } else {
            v.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  if (!user) return null;
  return (
    <div ref={containerRef} className="snap-start relative h-[calc(100dvh-3.5rem)] md:h-screen w-full flex items-center justify-center bg-black">
      <div className="relative h-full md:h-[90vh] md:max-h-[900px] aspect-[9/16] max-w-full">
        <video
          ref={videoRef}
          src={reel.video}
          loop
          playsInline
          muted={muted}
          className="h-full w-full object-cover md:rounded-xl bg-black"
          onClick={togglePlay}
          onDoubleClick={() => setLiked(true)}
        />

        {!playing && (
          <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </button>
        )}

        <button
          onClick={onToggleMute}
          className="absolute top-3 right-3 bg-black/40 rounded-full p-2"
          aria-label="mute toggle"
        >
          {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>

        {/* Right actions */}
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
          <img src={user.avatar} className="w-8 h-8 rounded-md border border-white/40" alt="audio" />
        </div>

        {/* Bottom info */}
        <div className="absolute left-0 right-16 bottom-4 px-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <img src={user.avatar} className="w-8 h-8 rounded-full border border-white/50" alt={user.username} />
            <span className="font-semibold text-sm">{user.username}</span>
            <button className="ml-2 text-xs border border-white/70 px-2 py-0.5 rounded">Follow</button>
          </div>
          <p className="text-sm line-clamp-2">{reel.caption}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <Music2 className="w-3 h-3" />
            <span className="truncate">{user.username} · original audio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reels() {
  const [reels, setReels] = useState<Reel[]>(() => getRandomReels(5));
  const [muted, setMuted] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll: append more reels when nearing the end
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - el.clientHeight * 1.5) {
        setReels((prev) => (prev.length > 60 ? prev : [...prev, ...getRandomReels(5)]));
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <InstaLayout>
      <div
        ref={scrollerRef}
        className="snap-y-mandatory overflow-y-scroll scrollbar-none h-[calc(100dvh-3.5rem-3.5rem)] md:h-screen"
      >
        {reels.map((r) => (
          <ReelItem key={r.id} reel={r} muted={muted} onToggleMute={() => setMuted((v) => !v)} />
        ))}
      </div>
    </InstaLayout>
  );
}
