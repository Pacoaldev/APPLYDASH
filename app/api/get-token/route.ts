// In acre-client/app/api/get-token/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  // This uses your existing server client to read the session from the browser's cookies
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return NextResponse.json({ error: 'Not authenticated. Please log in to your web app first.' }, { status: 401 });
  }

  // This will display the full session, including the all-important access_token
  return NextResponse.json({
    message: "SUCCESS: Copy the access_token value below and use it as your Bearer Token in Postman.",
    session: data.session
  });
}