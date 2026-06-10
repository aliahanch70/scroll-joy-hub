// Cloud data layer for posts. Merges Supabase posts with the local seed
// so the feed stays rich even when no users have uploaded anything yet.
// Falls back to local-only data if the cloud is unreachable.

import { supabase } from "@/integrations/supabase/client";
import { getPosts as getLocalPosts, getReels as getLocalReels, getUser as getLocalUser, type Post, type Reel } from "./insta-data";

export type CloudPost = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  image: string;            // for image posts; for videos this is a poster (empty -> uses video frame)
  video?: string;           // present when media_type = 'video'
  lowQualityVideo?: string; // optional reduced-quality video source
  caption: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLocal?: boolean;
};

const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

async function resolvePaths(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data, error } = await supabase.storage.from("media").createSignedUrls(paths, SIGNED_TTL);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

function localToCloud(p: Post): CloudPost {
  const u = getLocalUser(p.userId);
  return {
    id: p.id,
    userId: p.userId,
    username: u?.username ?? "unknown",
    avatar: u?.avatar ?? "",
    image: p.image,
    caption: p.caption,
    likes: p.likes,
    comments: p.comments,
    createdAt: p.createdAt,
    isLocal: true,
  };
}

function localReelToCloud(r: Reel): CloudPost {
  const u = getLocalUser(r.userId);
  return {
    id: r.id,
    userId: r.userId,
    username: u?.username ?? "unknown",
    avatar: u?.avatar ?? "",
    image: "",
    video: r.video,
    lowQualityVideo: r.video,
    caption: r.caption,
    likes: r.likes,
    comments: r.comments,
    createdAt: new Date().toISOString(),
    isLocal: true,
  };
}

export async function fetchFeed(): Promise<CloudPost[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, user_id, media_url, low_quality_media_url, media_type, caption, created_at, profiles!inner(username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const paths = (data ?? []).flatMap((r) => [r.media_url, r.low_quality_media_url].filter(Boolean));
    const urls = await resolvePaths(paths as string[]);

    const cloud: CloudPost[] = (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      username: r.profiles?.username ?? "user",
      avatar: r.profiles?.avatar_url ?? "",
      image: r.media_type === "image" ? (urls[r.media_url] ?? r.media_url) : "",
      video: r.media_type === "video" ? (urls[r.media_url] ?? r.media_url) : undefined,
      lowQualityVideo: r.media_type === "video" ? (urls[r.low_quality_media_url] ?? urls[r.media_url] ?? r.media_url) : undefined,
      caption: r.caption ?? "",
      likes: 0,
      comments: 0,
      createdAt: r.created_at,
    }));

    const merged = [
      ...cloud,
      ...getLocalPosts().map(localToCloud),
      ...getLocalReels().map(localReelToCloud),
    ];
    for (let i = merged.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [merged[i], merged[j]] = [merged[j], merged[i]];
    }
    return merged;
  } catch (e) {
    console.warn("Cloud feed unavailable, using local seed", e);
    return getLocalPosts().map(localToCloud);
  }
}

export async function fetchReels(): Promise<CloudPost[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, user_id, media_url, low_quality_media_url, media_type, caption, created_at, profiles!inner(username, avatar_url)")
      .eq("media_type", "video")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;

    const paths = (data ?? []).flatMap((r) => [r.media_url, r.low_quality_media_url].filter(Boolean));
    const urls = await resolvePaths(paths as string[]);

    const cloud: CloudPost[] = (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      username: r.profiles?.username ?? "user",
      avatar: r.profiles?.avatar_url ?? "",
      image: "",
      video: urls[r.media_url] ?? r.media_url,
      lowQualityVideo: urls[r.low_quality_media_url] ?? urls[r.media_url] ?? r.media_url,
      caption: r.caption ?? "",
      likes: 0,
      comments: 0,
      createdAt: r.created_at,
    }));

    return [...cloud, ...getLocalReels().map(localReelToCloud)];
  } catch (e) {
    console.warn("Cloud reels unavailable, using local seed", e);
    return getLocalReels().map(localReelToCloud);
  }
}

export async function fetchUserPosts(userId: string): Promise<CloudPost[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, user_id, media_url, low_quality_media_url, media_type, caption, created_at, profiles!inner(username, avatar_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const paths = (data ?? []).flatMap((r) => [r.media_url, r.low_quality_media_url].filter(Boolean));
    const urls = await resolvePaths(paths as string[]);

    return (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      username: r.profiles?.username ?? "user",
      avatar: r.profiles?.avatar_url ?? "",
      image: r.media_type === "image" ? (urls[r.media_url] ?? r.media_url) : "",
      video: r.media_type === "video" ? (urls[r.media_url] ?? r.media_url) : undefined,
      lowQualityVideo: r.media_type === "video" ? (urls[r.low_quality_media_url] ?? urls[r.media_url] ?? r.media_url) : undefined,
      caption: r.caption ?? "",
      likes: 0,
      comments: 0,
      createdAt: r.created_at,
    }));
  } catch (e) {
    console.warn("Cloud user posts unavailable", e);
    return [];
  }
}

export async function uploadMedia(file: File, userId: string, caption: string, lowQualityFile?: File): Promise<{ error: string | null }> {
  try {
    const isVideo = file.type.startsWith("video");
    const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) return { error: upErr.message };

    let lowQualityPath: string | null = null;
    if (isVideo && lowQualityFile) {
      if (!lowQualityFile.type.startsWith("video")) {
        return { error: "Low quality file must be a video." };
      }
      const lowExt = lowQualityFile.name.split(".").pop() || "mp4";
      lowQualityPath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-360p.${lowExt}`;
      const { error: lowErr } = await supabase.storage.from("media").upload(lowQualityPath, lowQualityFile, {
        contentType: lowQualityFile.type,
        upsert: false,
      });
      if (lowErr) return { error: lowErr.message };
    }

    const { error: insErr } = await supabase.from("posts").insert({
      user_id: userId,
      media_url: path,
      low_quality_media_url: lowQualityPath,
      media_type: isVideo ? "video" : "image",
      caption: caption.trim() || null,
    });
    if (insErr) return { error: insErr.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function deletePost(postId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Delete failed" };
  }
}

export async function updatePost(postId: string, caption: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("posts")
      .update({ caption: caption.trim() || null })
      .eq("id", postId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Update failed" };
  }
}

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string;
};

export async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("id, post_id, user_id, text, created_at, profiles!inner(username, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((c: any) => ({
      id: c.id,
      postId: c.post_id,
      userId: c.user_id,
      username: c.profiles?.username ?? "user",
      avatar: c.profiles?.avatar_url ?? "",
      text: c.text,
      createdAt: c.created_at,
    }));
  } catch (e) {
    console.warn("Failed to fetch comments", e);
    return [];
  }
}

export async function addComment(postId: string, userId: string, text: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      text: text.trim(),
    });
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Comment failed" };
  }
}

export async function deleteComment(commentId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Delete failed" };
  }
}
