import { NextRequest, NextResponse } from "next/server";
import { appOrigin, launchBrowser } from "@/lib/chrome";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const origin = appOrigin(req.url);

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    await page.goto(`${origin}/print/balance-sheet?year=${year}`, {
      waitUntil: "networkidle2",
      timeout: 60_000,
    });

    await page.waitForSelector("[data-balance-sheet]", { timeout: 30_000 });
    await page.emulateMediaType("print");
    await page.addStyleTag({
      content: `
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #fffdf7 !important;
        }
      `,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Tiranga-Balance-Sheet-${year}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF export failed";
    console.error("PDF export error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
