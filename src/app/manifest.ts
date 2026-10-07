import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tiranga Club Accounts",
    short_name: "Club Accounts",
    description: "Income and expense manager for Table Tennis Players of Surendranagar",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#c2410c",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
