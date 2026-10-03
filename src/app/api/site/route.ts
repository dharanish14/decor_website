import { NextRequest, NextResponse } from 'next/server';

const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec';

async function forward(request: Request, payload?: unknown) {
  if (!appsScriptUrl) {
    return NextResponse.json({ error: 'GOOGLE_APPS_SCRIPT_URL is not configured' }, { status: 503 });
  }

  const url = new URL(appsScriptUrl);
  if (request.method === 'GET') {
    const incomingUrl = new URL(request.url);
    incomingUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }

  const response = await fetch(url, {
    method: request.method,
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
    cache: 'no-store',
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: 'Apps Script returned an invalid response', details: text.slice(0, 300) };
  }

  if (typeof data === 'object' && data !== null && 'success' in data && data.success === false) {
    return NextResponse.json(data, { status: 502 });
  }

  return NextResponse.json(data, { status: response.ok ? 200 : 502 });
}

export async function GET(request: NextRequest) {
  try {
    return await forward(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Apps Script unavailable' }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await forward(request, await request.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Apps Script unavailable' }, { status: 502 });
  }
}