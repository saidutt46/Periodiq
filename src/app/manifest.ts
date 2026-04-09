import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Periodiq",
    short_name: "Periodiq",
    description: "The most beautiful periodic table on the web",
    start_url: "/",
    display: "standalone",
    background_color: "#06060b",
    theme_color: "#06060b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
