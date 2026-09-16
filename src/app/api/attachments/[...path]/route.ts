import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const safeSegments = segments.filter((s) => s !== ".." && s !== ".");
  const filePath = path.join(process.cwd(), "data", ...safeSegments);

  if (!filePath.startsWith(path.join(process.cwd(), "data"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
    },
  });
}
