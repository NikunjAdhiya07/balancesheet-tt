import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/print/balance-sheet?year=${year}`, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "6mm", bottom: "14mm", left: "6mm", right: "6mm" },
      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style="width:100%; font-size:8.5px; color:#64748b; text-align:center; font-family: Arial, sans-serif;">
          Tiranga Balance Sheet — ${year} &nbsp;|&nbsp; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
    });

    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Tiranga-Balance-Sheet-${year}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
