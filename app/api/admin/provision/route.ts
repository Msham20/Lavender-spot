import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const authClient = await createClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  }

  const allowedEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'This account is not authorized for admin access.' }, { status: 403 });
  }

  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: 'Confirm your email before activating administrator access.' }, { status: 403 });
  }

  const { data: profile, error: profileError } = await authClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: 'Unable to verify administrator access.' }, { status: 500 });
  }

  if (profile?.is_admin) {
    return NextResponse.json({ authorized: true });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Admin provisioning is not configured on the server.' }, { status: 503 });
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: provisionError } = await adminClient.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split('@')[0],
      is_admin: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (provisionError) {
    console.error('Admin profile provisioning failed:', provisionError);
    return NextResponse.json({ error: 'Unable to activate administrator access.' }, { status: 500 });
  }

  return NextResponse.json({ authorized: true });
}