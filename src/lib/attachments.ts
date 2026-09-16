import { getSupabase } from "./supabase";

const BUCKET = "attachments";
const PUBLIC_URL_MARKER = `/storage/v1/object/public/${BUCKET}/`;

export async function saveAttachment(
  type: "income" | "expense",
  year: number,
  file: File
): Promise<{ name: string; storedPath: string }> {
  const supabase = getSupabase();

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`;
  const objectPath = `${year}/${type}/${uniqueName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return { name: file.name, storedPath: data.publicUrl };
}

export async function deleteAttachment(storedPath: string | null) {
  if (!storedPath) return;
  const markerIndex = storedPath.indexOf(PUBLIC_URL_MARKER);
  if (markerIndex === -1) return;
  const objectPath = decodeURIComponent(
    storedPath.slice(markerIndex + PUBLIC_URL_MARKER.length)
  );
  const supabase = getSupabase();
  await supabase.storage.from(BUCKET).remove([objectPath]);
}
