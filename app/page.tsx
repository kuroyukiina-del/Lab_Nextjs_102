// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
export const metadata: Metadata = {
  title: "หน้าแรก",
};
interface Post {
  id: number;
  title: string;
  body: string;
}
async function getRecentPosts(): Promise<Post[]> {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=3",
    { cache: "no-store" },
  );
  return res.json();
}
export default async function Home() {
  const posts: Post[] = await getRecentPosts();
  return (
    <div>
      <main className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center">
        {/* Background */}
        <Image
          src="/image/background.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Card */}
        <div className="relative z-10 bg-white/90 p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center">
            <div className="w-40 h-40 overflow-hidden rounded-full">
              <Image
                src="/image/profile.jpg"
                alt="Profile"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="mt-8 text-5xl font-bold text-blue-900">สวัสดี! 👋</h1>

          <p className="mt-4 text-xl text-gray-600">
            บล็อกของ <strong>นายศุภกร ยางสมบูรณ์</strong> • นิสิตปี 3 CS
          </p>

          <Link
            href="/posts"
            className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            อ่านบทความ →
          </Link>
        </div>
      </main>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">บทความล่าสุด</h2>
        <div className="grid gap-4">
          {posts.map((post: Post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="p-5 bg-white rounded-lg border border-gray-200
 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              <h3 className="font-bold text-blue-800 mb-2">{post.title}</h3>
              <p className="text-gray-500 text-sm">
                {post.body.slice(0, 80)}...
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
