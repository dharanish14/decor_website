import { NextRequest, NextResponse } from 'next/server';
import { LeadSubmission } from '@/lib/dataStore';

const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec';

export async function POST(req: NextRequest) {
  try {
    const lead: LeadSubmission = await req.json();

    if (!lead.name || !lead.email || !lead.phone) {
      return NextResponse.json({ error: 'Missing required lead fields' }, { status: 400 });
    }

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;
    if (appsScriptUrl) {
      const appsScriptResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, source: 'elshadai-website' }),
      });

      const appsScriptData = await appsScriptResponse.json().catch(() => null);
      if (!appsScriptResponse.ok || appsScriptData?.success === false) {
        return NextResponse.json({ error: appsScriptData?.error || 'The enquiry could not be saved to Google Sheets' }, { status: 502 });
      }
    }

    return NextResponse.json({
      success: true,
      message: appsScriptUrl ? 'Lead details saved to Google Sheets' : 'Lead details received',
      lead
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
