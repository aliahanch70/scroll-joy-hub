import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { InstaLayout } from "@/components/insta/Layout";
import { useAuth } from "@/lib/auth-context";
import { fetchUserPosts } from "@/lib/insta-cloud";
import { getMe, getPostsByUser } from "@/lib/insta-data";
import { Grid3x3, Bookmark, UserSquare2, Play, LogIn } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Instaclone" }] }),
  component: Profile,
});

function Profile() {
  const { user, profile, signOut } = useAuth();
  const [tab, setTab] = useState<"posts" | "saved" | "tagged">("posts");

  const { data: cloudPosts = [] } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: () => (user ? fetchUserPosts(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

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
            <Grid items={cloudPosts.map((p) => ({ id: p.id, image: p.image, video: p.video }))} />
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

function Grid({ items }: { items: { id: string; image: string; video?: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 mt-1">
      {items.map((it) => (
        <div key={it.id} className="aspect-square bg-muted overflow-hidden relative">
          {it.video ? (
            <>
              <video src={it.video} className="w-full h-full object-cover" muted playsInline preload="metadata" />
              <Play className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow" fill="currentColor" />
            </>
          ) : (
            <img src={it.image} alt="" className="w-full h-full object-cover" loading="lazy" />
          )}
        </div>
      ))}
    </div>
  );
}
