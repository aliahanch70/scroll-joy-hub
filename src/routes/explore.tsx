import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { InstaLayout } from "@/components/insta/Layout";
import { fetchFeed } from "@/lib/insta-cloud";
import { Search } from "lucide-react";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore — Instaclone" }] }),
  component: Explore,
});

function Explore() {
  const { data: posts = [] } = useQuery({ queryKey: ["feed"], queryFn: fetchFeed });
  return (
    <InstaLayout>
      <div className="max-w-5xl mx-auto px-1 md:px-4 py-4">
        <div className="md:hidden mb-3 px-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input placeholder="Search" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {posts.map((p, i) => (
            <a key={p.id} href="#"
              className={`relative bg-muted overflow-hidden ${i % 7 === 3 ? "row-span-2 col-span-1 aspect-[1/2]" : "aspect-square"}`}>
              <img src={p.image} alt={p.caption} loading="lazy" className="w-full h-full object-cover hover:opacity-90 transition" />
            </a>
          ))}
        </div>
      </div>
    </InstaLayout>
  );
}
