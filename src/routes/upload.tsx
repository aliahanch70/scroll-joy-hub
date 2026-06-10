import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { uploadMedia } from "@/lib/insta-cloud";
import { InstaLayout } from "@/components/insta/Layout";
import { Upload, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Create — Instaclone" }] }),
  component: UploadPage,
});

function UploadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lowQualityFile, setLowQualityFile] = useState<File | null>(null);
  const [lowQualityPreview, setLowQualityPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!lowQualityFile) { setLowQualityPreview(null); return; }
    const url = URL.createObjectURL(lowQualityFile);
    setLowQualityPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [lowQualityFile]);

  const onPick = (f: File | null) => {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { setError("File too large (max 50MB)"); return; }
    if (!f.type.startsWith("image") && !f.type.startsWith("video")) { setError("Only images or videos"); return; }
    setError(null);
    setFile(f);
    setLowQualityFile(null);
  };

  const submit = async () => {
    if (!file || !user) return;
    setBusy(true);
    setError(null);
    const { error } = await uploadMedia(file, user.id, caption, lowQualityFile ?? undefined);
    setBusy(false);
    if (error) { setError(error); return; }
    navigate({ to: "/profile" });
  };

  const isVideo = file?.type.startsWith("video");

  return (
    <InstaLayout>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Create new post</h1>
          {file && (
            <button onClick={() => { setFile(null); setLowQualityFile(null); }} className="p-2 hover:bg-accent rounded-full">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!file ? (
          <label className="border-2 border-dashed border-border rounded-xl aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-card transition">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <span className="text-sm">Click to select an image or video</span>
            <span className="text-xs text-muted-foreground">Max 50MB · videos play in Reels</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center">
              {isVideo ? (
                <video src={preview!} className="w-full h-full object-contain" controls />
              ) : (
                <img src={preview!} alt="preview" className="w-full h-full object-contain" />
              )}
            </div>
            {isVideo && (
              <div className="space-y-2">
                <label className="border border-border rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:bg-card transition">
                  <span className="text-sm font-semibold">Upload 360p version (optional)</span>
                  <span className="text-xs text-muted-foreground">Optional low-bandwidth copy for DATA SAVER mode</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const low = e.target.files?.[0] ?? null;
                      if (!low) return;
                      if (!low.type.startsWith("video")) {
                        setError("Low-quality upload must be a video.");
                        return;
                      }
                      setError(null);
                      setLowQualityFile(low);
                    }}
                  />
                </label>
                {lowQualityPreview && (
                  <div className="rounded-xl overflow-hidden bg-black h-40">
                    <video src={lowQualityPreview} className="w-full h-full object-contain" controls />
                  </div>
                )}
              </div>
            )}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              placeholder="Write a caption…"
              rows={3}
              className="w-full bg-muted border border-border rounded-md p-3 text-sm outline-none focus:border-ring resize-none"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-md py-3 text-sm flex items-center justify-center gap-2"
            >
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sharing…</> : "Share"}
            </button>
          </div>
        )}
      </div>
    </InstaLayout>
  );
}
