import { createFileRoute } from "@tanstack/react-router";
import { InstaLayout } from "@/components/insta/Layout";
import { getMe, getPostsByUser } from "@/lib/insta-data";
import { Grid3x3, Bookmark, UserSquare2, Settings } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Instaclone" }] }),
  component: Profile,
});

function Profile() {
  const me = getMe();
  const posts = getPostsByUser("me");
  const [tab, setTab] = useState<"posts" | "saved" | "tagged">("posts");

  return (
    <InstaLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
        <header className="flex items-center gap-6 md:gap-16">
          <div className="p-[3px] rounded-full bg-story-ring shrink-0">
            <img src={me.avatar} alt={me.username} className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-background p-1" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-xl font-light">{me.username}</h1>
              <button className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-md text-sm font-semibold">
                Edit profile
              </button>
              <button className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-md text-sm font-semibold hidden md:inline">
                View archive
              </button>
              <Settings className="w-5 h-5 hidden md:inline" />
            </div>
            <div className="hidden md:flex gap-8 mb-3 text-sm">
              <span><b>{posts.length}</b> posts</span>
              <span><b>{me.followers.toLocaleString()}</b> followers</span>
              <span><b>{me.following.toLocaleString()}</b> following</span>
            </div>
            <div className="hidden md:block">
              <div className="font-semibold">{me.name}</div>
              <div className="text-sm">{me.bio}</div>
            </div>
          </div>
        </header>

        <div className="md:hidden mt-4">
          <div className="font-semibold">{me.name}</div>
          <div className="text-sm text-muted-foreground">{me.bio}</div>
        </div>

        <div className="md:hidden grid grid-cols-3 text-center mt-4 py-3 border-y border-border">
          <div><div className="font-semibold">{posts.length}</div><div className="text-xs text-muted-foreground">posts</div></div>
          <div><div className="font-semibold">{me.followers.toLocaleString()}</div><div className="text-xs text-muted-foreground">followers</div></div>
          <div><div className="font-semibold">{me.following.toLocaleString()}</div><div className="text-xs text-muted-foreground">following</div></div>
        </div>

        <nav className="flex justify-center gap-12 mt-8 border-t border-border">
          {[
            { id: "posts", icon: Grid3x3, label: "POSTS" },
            { id: "saved", icon: Bookmark, label: "SAVED" },
            { id: "tagged", icon: UserSquare2, label: "TAGGED" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-2 py-3 text-xs tracking-widest border-t-2 -mt-px ${
                tab === id ? "border-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-3 gap-1 md:gap-2 mt-1">
          {tab === "posts" ? (
            posts.map((p) => (
              <div key={p.id} className="aspect-square bg-muted overflow-hidden">
                <img src={p.image} alt={p.caption} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20 text-muted-foreground text-sm">
              Nothing here yet.
            </div>
          )}
        </div>
      </div>
    </InstaLayout>
  );
}
