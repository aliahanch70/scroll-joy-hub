import { createFileRoute } from "@tanstack/react-router";
import { InstaLayout } from "@/components/insta/Layout";
import { fetchReels, type CloudPost, fetchComments, addComment, deleteComment, type Comment } from "@/lib/insta-cloud";
import { useAuth } from "@/lib/auth-context";
import { Heart, MessageCircle, Send, MoreHorizontal, Music2, Play, Volume2, VolumeX, Maximize2, Minimize2, X } from "lucide-react";
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

function ReelItem({ reel, muted, onToggleMute, dataSaver }: { reel: CloudPost; muted: boolean; onToggleMute: () => void; dataSaver: boolean }) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [fitCover, setFitCover] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

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

  const loadComments = async () => {
    setLoadingComments(true);
    const loaded = await fetchComments(reel.id);
    setComments(loaded);
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return;
    
    const result = await addComment(reel.id, user.id, commentText);
    if (!result.error) {
      setCommentText("");
      await loadComments();
    } else {
      alert("Error adding comment: " + result.error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (!result.error) {
      await loadComments();
    } else {
      alert("Error deleting comment: " + result.error);
    }
  };

  const videoSource = dataSaver ? reel.lowQualityVideo ?? reel.video : reel.video;

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <div ref={containerRef} className="snap-start relative h-[calc(100dvh-3.5rem)] md:h-screen w-full flex items-center justify-center bg-black">
      <div className="relative h-full md:h-[90vh] md:max-h-225 aspect-9/16 max-w-full">
        <video key={videoSource} ref={videoRef} src={videoSource} loop playsInline muted={muted}
          className={`h-full w-full md:rounded-xl bg-black ${fitCover ? "object-cover" : "object-contain"}`}
          onClick={togglePlay} onDoubleClick={() => setLiked(true)} />
        <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-semibold uppercase tracking-[.2em] px-2 py-1 rounded">
          {dataSaver ? "360p" : "HD"}
        </div>
        {!playing && (
          <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </button>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button onClick={() => setFitCover((v) => !v)} className="bg-black/40 rounded-full p-2" aria-label="fit toggle">
            {fitCover ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
          </button>
          <button onClick={onToggleMute} className="bg-black/40 rounded-full p-2" aria-label="mute toggle">
            {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
          <button onClick={() => setLiked((v) => !v)} className="flex flex-col items-center">
            <Heart className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="text-xs mt-1">{(reel.likes + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button onClick={() => { if (!showComments) loadComments(); setShowComments(!showComments); }} className="flex flex-col items-center">
            <MessageCircle className="w-7 h-7" />
            <span className="text-xs mt-1">{comments.length}</span>
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

      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/90 backdrop-blur rounded-t-2xl flex flex-col border-t border-white/20">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-white font-semibold">Comments ({comments.length})</h3>
            <button onClick={() => setShowComments(false)} className="text-white hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {loadingComments ? (
              <div className="text-center text-gray-400 text-sm">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <img src={comment.avatar} alt={comment.username} className="w-6 h-6 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-xs font-semibold">{comment.username}</span>
                        <p className="text-white text-xs mt-0.5 wrap-break-word">{comment.text}</p>
                      </div>
                      {user?.id === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-400 hover:text-red-300 text-xs shrink-0"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {user && (
            <div className="border-t border-white/20 p-3 flex gap-2">
              <img src={user.user_metadata?.avatar_url ?? "https://api.dicebear.com/9.x/avataaars/svg?seed=user"} alt="You" className="w-6 h-6 rounded-full shrink-0" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/10 text-white text-xs rounded px-3 py-1.5 placeholder-gray-400 outline-none focus:bg-white/20"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="text-sky-400 hover:text-sky-300 disabled:opacity-50 font-semibold text-xs"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Reels() {
  const [pool, setPool] = useState<CloudPost[]>([]);
  const [items, setItems] = useState<CloudPost[]>([]);
  const [muted, setMuted] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
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
    const connection = (navigator as any).connection as { effectiveType?: string } | undefined;
    if (connection?.effectiveType) {
      const slowConnection = ["slow-2g", "2g", "3g"].includes(connection.effectiveType);
      if (slowConnection) setDataSaver(true);
    }
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
          {/* <button
            onClick={() => setDataSaver((v) => !v)}
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${dataSaver ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border bg-transparent text-foreground"}`}
          >
            DATA SAVER {dataSaver ? "ON" : "OFF"}
          </button>
  */}
      <div ref={scrollerRef} className="snap-y-mandatory overflow-y-scroll scrollbar-none h-[calc(100dvh-3.5rem-3.5rem)] md:h-screen">
        {items.map((r) => (
          <ReelItem key={r.id} reel={r} muted={muted} onToggleMute={() => setMuted((v) => !v)} dataSaver={dataSaver} />
        ))}
      </div>
    </InstaLayout>
  );
}
