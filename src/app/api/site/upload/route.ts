import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec';
  if (!appsScriptUrl) return NextResponse.json({ error: 'GOOGLE_APPS_SCRIPT_URL is not configured' }, { status: 503 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image first' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Images must be smaller than 8 MB' }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'uploadImage', name: file.name, mimeType: file.type, data: bytes.toString('base64') }),
    });
    const data = await response.json();
    if (data && typeof data === 'object') {
      const fileId = data.fileId || (data.url ? data.url.match(/(?:id=|\/d\/|\/file\/d\/)([a-zA-Z0-9_-]{25,})/)?.[1] : null);
      if (fileId) {
        data.url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
      }
    }
    return NextResponse.json(data, { status: response.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Image upload failed' }, { status: 502 });
  }
}