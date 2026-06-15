import { useAuth } from "@/lib/auth-context";

export function Stories() {
  const { profile } = useAuth();
  if (!profile) return null;
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 py-4 border-b border-border">
      <button className="flex flex-col items-center gap-1 shrink-0 w-16">
        <div className="p-[2px] rounded-full bg-muted">
          <div className="p-[2px] bg-background rounded-full">
            <img
              src={profile.avatar_url ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-14 h-14 rounded-full object-cover bg-muted"
            />
          </div>
        </div>
        <span className="text-xs truncate w-full text-center">Your story</span>
      </button>
    </div>
  );
}
