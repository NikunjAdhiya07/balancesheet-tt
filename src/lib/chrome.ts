import fs from "fs";
import os from "os";
import path from "path";
import type { Browser } from "puppeteer-core";

const isServerless =
  !!process.env.VERCEL_ENV || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

function exists(filePath: string | undefined | null): filePath is string {
  return !!filePath && fs.existsSync(filePath);
}

function findCachedPuppeteerChrome(): string | undefined {
  const cacheRoots = [
    process.env.PUPPETEER_CACHE_DIR,
    path.join(os.homedir(), ".cache", "puppeteer"),
    path.join(os.homedir(), "AppData", "Local", "puppeteer"),
  ].filter(Boolean) as string[];

  for (const root of cacheRoots) {
    const chromeRoot = path.join(root, "chrome");
    if (!fs.existsSync(chromeRoot)) continue;
    const versions = fs
      .readdirSync(chromeRoot)
      .map((name) => path.join(chromeRoot, name))
      .filter((dir) => fs.statSync(dir).isDirectory())
      .sort()
      .reverse();

    for (const versionDir of versions) {
      const candidates = [
        path.join(versionDir, "chrome-win64", "chrome.exe"),
        path.join(versionDir, "chrome-linux64", "chrome"),
        path.join(versionDir, "chrome-mac-x64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
        path.join(versionDir, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      ];
      const found = candidates.find(exists);
      if (found) return found;
    }
  }
  return undefined;
}

function findSystemChrome(): string | undefined {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(os.homedir(), "AppData", "Local", "Google", "Chrome", "Application", "chrome.exe"),
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates.find(exists);
}

export async function launchBrowser(): Promise<Browser> {
  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const puppeteer = await import("puppeteer");
  const executablePath =
    findCachedPuppeteerChrome() || findSystemChrome();

  if (executablePath) {
    return (await puppeteer.launch({
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
    })) as unknown as Browser;
  }

  // Last resort: ask Puppeteer to use an installed Chrome channel.
  return (await puppeteer.launch({
    headless: true,
    channel: "chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  })) as unknown as Browser;
}

export function appOrigin(reqUrl: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  return new URL(reqUrl).origin;
}
