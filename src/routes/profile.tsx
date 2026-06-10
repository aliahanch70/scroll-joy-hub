import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InstaLayout } from "@/components/insta/Layout";
import { useAuth } from "@/lib/auth-context";
import { fetchUserPosts, deletePost, updatePost } from "@/lib/insta-cloud";
import { getMe, getPostsByUser } from "@/lib/insta-data";
import { Grid3x3, Bookmark, UserSquare2, Play, LogIn, Trash2, Edit2, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Instaclone" }] }),
  component: Profile,
});

function Profile() {
  const { user, profile, signOut } = useAuth();
  const [tab, setTab] = useState<"posts" | "saved" | "tagged">("posts");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: cloudPosts = [], refetch } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: () => (user ? fetchUserPosts(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const result = await deletePost(postId);
      if (!result.error) {
        refetch();
      } else {
        alert("Error deleting post: " + result.error);
      }
    }
  };

  const handleEditPost = (postId: string, currentCaption: string) => {
    setEditingPostId(postId);
    setEditCaption(currentCaption);
  };

  const handleSaveEdit = async (postId: string) => {
    const result = await updatePost(postId, editCaption);
    if (!result.error) {
      setEditingPostId(null);
      refetch();
    } else {
      alert("Error updating post: " + result.error);
    }
  };

  // Guest view: show the local demo profile
  if (!user) {
    const me = getMe();
    const posts = getPostsByUser("me");
    return (
      <InstaLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
          <div className="bg-card border border-border rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-semibold">You're browsing as a guest</div>
              <div className="text-muted-foreground text-xs">Sign in to create your own profile and upload posts.</div>
            </div>
            <Link to="/login" className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <LogIn className="w-4 h-4" /> Log in
            </Link>
          </div>
          <ProfileHeader
            avatar={me.avatar}
            username={me.username}
            name={me.name}
            bio={me.bio}
            followers={me.followers}
            following={me.following}
            postCount={posts.length}
            isMe={false}
          />
          <Grid items={posts.map((p) => ({ id: p.id, image: p.image }))} />
        </div>
      </InstaLayout>
    );
  }

  return (
    <InstaLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
        <ProfileHeader
          avatar={profile?.avatar_url ?? ""}
          username={profile?.username ?? user.email ?? "you"}
          name={profile?.name ?? ""}
          bio={profile?.bio ?? "Welcome! Edit your profile soon."}
          followers={0}
          following={0}
          postCount={cloudPosts.length}
          isMe
          onSignOut={signOut}
        />
        <nav className="flex justify-center gap-12 mt-8 border-t border-border">
          {[
            { id: "posts", icon: Grid3x3, label: "POSTS" },
            { id: "saved", icon: Bookmark, label: "SAVED" },
            { id: "tagged", icon: UserSquare2, label: "TAGGED" },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-2 py-3 text-xs tracking-widest border-t-2 -mt-px ${
                tab === id ? "border-foreground" : "border-transparent text-muted-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        {tab === "posts" ? (
          cloudPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-2xl font-light mb-2">Share your first post</div>
              <div className="text-sm text-muted-foreground mb-4">Photos and videos you share will appear here.</div>
              <Link to="/upload" className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-4 py-2 rounded-md">
                Create post
              </Link>
            </div>
          ) : (
            <Grid 
              items={cloudPosts.map((p) => ({ 
                id: p.id, 
                image: p.image, 
                video: p.video,
                caption: p.caption 
              }))}
              isUserProfile={true}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              editingPostId={editingPostId}
              editCaption={editCaption}
              onEditCaptionChange={setEditCaption}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => setEditingPostId(null)}
            />
          )
        ) : (
          <div className="text-center py-20 text-muted-foreground text-sm">Nothing here yet.</div>
        )}
      </div>
    </InstaLayout>
  );
}

function ProfileHeader({
  avatar, username, name, bio, followers, following, postCount, isMe, onSignOut,
}: {
  avatar: string; username: string; name: string; bio: string;
  followers: number; following: number; postCount: number; isMe: boolean;
  onSignOut?: () => void;
}) {
  return (
    <>
      <header className="flex items-center gap-6 md:gap-16">
        <div className="p-[3px] rounded-full bg-story-ring shrink-0">
          <img src={avatar} alt={username} className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-background p-1" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-xl font-light">{username}</h1>
            {isMe ? (
              <>
                <Link to="/upload" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold">
                  New post
                </Link>
                <button onClick={onSignOut} className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-md text-sm font-semibold">
                  Log out
                </button>
              </>
            ) : (
              <button className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-md text-sm font-semibold">
                Edit profile
              </button>
            )}
          </div>
          <div className="hidden md:flex gap-8 mb-3 text-sm">
            <span><b>{postCount}</b> posts</span>
            <span><b>{followers.toLocaleString()}</b> followers</span>
            <span><b>{following.toLocaleString()}</b> following</span>
          </div>
          <div className="hidden md:block">
            {name && <div className="font-semibold">{name}</div>}
            <div className="text-sm">{bio}</div>
          </div>
        </div>
      </header>
      <div className="md:hidden mt-4">
        {name && <div className="font-semibold">{name}</div>}
        <div className="text-sm text-muted-foreground">{bio}</div>
      </div>
      <div className="md:hidden grid grid-cols-3 text-center mt-4 py-3 border-y border-border">
        <div><div className="font-semibold">{postCount}</div><div className="text-xs text-muted-foreground">posts</div></div>
        <div><div className="font-semibold">{followers.toLocaleString()}</div><div className="text-xs text-muted-foreground">followers</div></div>
        <div><div className="font-semibold">{following.toLocaleString()}</div><div className="text-xs text-muted-foreground">following</div></div>
      </div>
    </>
  );
}

function Grid({ 
  items, 
  isUserProfile = false,
  onDelete,
  onEdit,
  editingPostId,
  editCaption,
  onEditCaptionChange,
  onSaveEdit,
  onCancelEdit,
}: { 
  items: { id: string; image: string; video?: string; caption?: string }[];
  isUserProfile?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, caption: string) => void;
  editingPostId?: string | null;
  editCaption?: string;
  onEditCaptionChange?: (caption: string) => void;
  onSaveEdit?: (id: string) => void;
  onCancelEdit?: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 mt-1">
      {items.map((it) => (
        <div key={it.id} className="relative group">
          <div className="aspect-square bg-muted overflow-hidden rounded relative">
            {it.video ? (
              <>
                <video src={it.video} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                <Play className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow" fill="currentColor" />
              </>
            ) : (
              <img src={it.image} alt="" className="w-full h-full object-cover" loading="lazy" />
            )}
          </div>
          {isUserProfile && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => onEdit?.(it.id, it.caption || "")}
                className="bg-white text-black hover:bg-gray-200 rounded-full p-2 transition-colors"
                title="Edit post"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(it.id)}
                className="bg-red-500 text-white hover:bg-red-600 rounded-full p-2 transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          {editingPostId === it.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Edit Caption</h3>
                <textarea
                  value={editCaption}
                  onChange={(e) => onEditCaptionChange?.(e.target.value)}
                  className="w-full border border-border rounded-md p-3 mb-4 bg-background text-foreground resize-none"
                  rows={4}
                  placeholder="Write a caption..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => editingPostId && onSaveEdit?.(editingPostId)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
