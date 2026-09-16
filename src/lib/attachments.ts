import fs from "fs";
import path from "path";

const attachmentsDir = path.join(process.cwd(), "data", "attachments");

export async function saveAttachment(
  type: "income" | "expense",
  year: number,
  file: File
): Promise<{ name: string; storedPath: string }> {
  const dir = path.join(attachmentsDir, String(year), type);
  fs.mkdirSync(dir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`;
  const fullPath = path.join(dir, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(fullPath, buffer);

  const relativePath = path
    .join("attachments", String(year), type, uniqueName)
    .replace(/\\/g, "/");

  return { name: file.name, storedPath: relativePath };
}

export function deleteAttachment(storedPath: string | null) {
  if (!storedPath) return;
  const fullPath = path.join(process.cwd(), "data", storedPath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch {
      // ignore
    }
  }
}
