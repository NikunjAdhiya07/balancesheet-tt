import { Suspense } from "react";
import Nav from "@/components/Nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-orange-200 bg-white" />}>
        <Nav />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
        Table Tennis Players of Surendranagar &middot; Income &amp; Expense Manager
      </footer>
    </>
  );
}
