// Local-first data layer. Reads from localStorage (seeded from bundled JSON).
// Supabase integration can be added later as a remote fallback/sync layer.

export type User = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
};

export type Post = {
  id: string;
  userId: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: string;
};

export type Reel = {
  id: string;
  userId: string;
  video: string;
  caption: string;
  likes: number;
  comments: number;
};

const KEY = "insta_clone_db_v1";

const PEOPLE = [
  ["leo.snap", "Leo Park", "Coffee, code & cameras ☕📸"],
  ["mia.travels", "Mia Carter", "Wandering the world 🌍✈️"],
  ["nova.art", "Nova Chen", "Digital painter • commissions open 🎨"],
  ["kai.surf", "Kai Brooks", "Salt in my hair 🌊"],
  ["luna.bakes", "Luna Reed", "Sourdough & sprinkles 🥐"],
  ["ari.runs", "Ari Vega", "5k → marathon. Slowly. 🏃"],
  ["zoe.lens", "Zoe Hart", "Street photography, Tokyo based"],
  ["finn.builds", "Finn Walsh", "Woodworking & weekend projects 🪵"],
  ["sora.music", "Sora Kim", "Lo-fi producer 🎧"],
  ["rio.eats", "Rio Mendes", "Eating my way through the city 🍜"],
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800",
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
  "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=800",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800",
  "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800",
  "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
];

const AVATARS = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const CAPTIONS = [
  "Golden hour never disappoints ✨",
  "Weekend mood",
  "Found this little spot today 🌿",
  "No words needed",
  "Chasing light",
  "Slow mornings",
  "Take me back",
  "Feeling grateful",
  "Just another day in paradise",
  "Some moments are made for keeping",
];

// Short royalty-free vertical-ish sample videos (Google demo bucket)
const VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]) => arr[rand(arr.length)];

function seed(): { users: User[]; posts: Post[]; reels: Reel[]; me: User } {
  const users: User[] = PEOPLE.map(([u, n, b], i) => ({
    id: `u${i}`,
    username: u,
    name: n,
    avatar: AVATARS(u),
    bio: b,
    followers: 200 + rand(50000),
    following: 50 + rand(800),
  }));

  const me: User = {
    id: "me",
    username: "you",
    name: "Your Name",
    avatar: AVATARS("you"),
    bio: "Welcome to your profile ✨ Edit me later.",
    followers: 128,
    following: 180,
  };

  const posts: Post[] = [];
  PHOTOS.forEach((img, i) => {
    posts.push({
      id: `p${i}`,
      userId: pick(users).id,
      image: img,
      caption: pick(CAPTIONS),
      likes: 20 + rand(5000),
      comments: rand(120),
      createdAt: new Date(Date.now() - rand(7) * 86400000).toISOString(),
    });
  });
  // a few from "me"
  for (let i = 0; i < 6; i++) {
    posts.push({
      id: `pm${i}`,
      userId: "me",
      image: PHOTOS[(i * 3) % PHOTOS.length],
      caption: pick(CAPTIONS),
      likes: 10 + rand(200),
      comments: rand(20),
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }

  const reels: Reel[] = VIDEOS.map((v, i) => ({
    id: `r${i}`,
    userId: pick(users).id,
    video: v,
    caption: pick(CAPTIONS),
    likes: 100 + rand(20000),
    comments: rand(500),
  }));

  return { users, posts, reels, me };
}

type DB = ReturnType<typeof seed>;

function load(): DB {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {}
  const db = seed();
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
  return db;
}

let cache: DB | null = null;
function db(): DB {
  if (!cache) cache = load();
  return cache;
}

export function getUsers() { return db().users; }
export function getMe() { return db().me; }
export function getUser(id: string) {
  const d = db();
  return id === "me" ? d.me : d.users.find((u) => u.id === id);
}
export function getPosts() {
  return [...db().posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getPostsByUser(userId: string) {
  return db().posts.filter((p) => p.userId === userId);
}
export function getReels() { return db().reels; }

// Random reel sequence — used for infinite scroll
export function getRandomReels(count: number, exclude: string[] = []): Reel[] {
  const all = db().reels.filter((r) => !exclude.includes(r.id));
  const out: Reel[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ ...all[rand(all.length)], id: `${pick(all).id}-${Date.now()}-${i}-${rand(99999)}` });
  }
  return out;
}
