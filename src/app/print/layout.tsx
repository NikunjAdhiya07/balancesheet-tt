import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiranga Balance Sheet",
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: "#fffdf7",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
