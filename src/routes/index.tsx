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

  return (
    <InstaLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-[470px]">
          <Stories />
          <div className="md:py-6">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </div>
      </div>
    </InstaLayout>
  );
}
