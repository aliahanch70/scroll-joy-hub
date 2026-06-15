import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { InstaLayout } from "@/components/insta/Layout";
import { Stories } from "@/components/insta/Stories";
import { PostCard } from "@/components/insta/PostCard";
import { fetchFeed } from "@/lib/insta-cloud";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Instaclone — Home" },
      { name: "description", content: "An Instagram-inspired social feed clone." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: posts = [] } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
  const suggestions = getUsers().slice(0, 5);

  return (
    <InstaLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-[470px]">
          <Stories />
          <div className="md:py-6">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </div>
        <aside className="hidden lg:block w-80 pt-10 pl-10">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Suggested for you</h3>
          <ul className="space-y-3">
            {suggestions.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <img src={u.avatar} className="w-10 h-10 rounded-full bg-muted" alt={u.username} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.username}</div>
                  <div className="text-xs text-muted-foreground truncate">Suggested for you</div>
                </div>
                <button className="text-xs font-semibold text-sky-400">Follow</button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </InstaLayout>
  );
}
