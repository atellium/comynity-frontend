import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Comynity app icon";
export const size = { width: 1024, height: 1024 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const icon = await readFile(
    join(process.cwd(), "public", "app-icons", "icon-1024X1024.png"),
  );

  return new Response(icon, {
    headers: {
      "Content-Type": contentType,
    },
  });
}
