import { getMe, getUsers } from "@/lib/insta-data";

export function Stories() {
  const me = getMe();
  const users = getUsers();
  const list = [me, ...users];
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 py-4 border-b border-border">
      {list.map((u, i) => (
        <button key={u.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
          <div className={`p-[2px] rounded-full ${i === 0 ? "bg-muted" : "bg-story-ring"}`}>
            <div className="p-[2px] bg-background rounded-full">
              <img src={u.avatar} alt={u.username} className="w-14 h-14 rounded-full object-cover bg-muted" />
            </div>
          </div>
          <span className="text-xs truncate w-full text-center">{i === 0 ? "Your story" : u.username}</span>
        </button>
      ))}
    </div>
  );
}
