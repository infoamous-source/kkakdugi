import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface NaverUserResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email: string;
    name: string;
    profile_image?: string;
    gender?: string;
    birthday?: string;
    age?: string;
  };
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: 'Authorization code is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const NAVER_CLIENT_ID = Deno.env.get('NAVER_CLIENT_ID');
    const NAVER_CLIENT_SECRET = Deno.env.get('NAVER_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: 'Naver OAuth not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1) 네이버 토큰 교환
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: NAVER_CLIENT_ID,
      client_secret: NAVER_CLIENT_SECRET,
      code,
      redirect_uri: redirect_uri || '',
    });

    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    const tokenData: NaverTokenResponse = await tokenRes.json();

    if (tokenData.error) {
      return new Response(
        JSON.stringify({ error: tokenData.error_description || tokenData.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2) 네이버 사용자 정보 조회
    const userRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData: NaverUserResponse = await userRes.json();

    if (userData.resultcode !== '00') {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Naver user info' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const naverUser = userData.response;

    if (!naverUser.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required. Please allow email access in Naver.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3) Supabase Admin Client로 사용자 생성/조회
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 기존 사용자 확인 (이메일로)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) =>
        u.email === naverUser.email ||
        u.app_metadata?.providers?.includes('naver') &&
          u.user_metadata?.naver_id === naverUser.id,
    );

    let userId: string;

    if (existingUser) {
      // 기존 사용자 — 네이버 provider 정보 연결
      userId = existingUser.id;
      const currentProviders = existingUser.app_metadata?.providers || [];
      if (!currentProviders.includes('naver')) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: {
            ...existingUser.app_metadata,
            providers: [...currentProviders, 'naver'],
            naver_id: naverUser.id,
          },
          user_metadata: {
            ...existingUser.user_metadata,
            naver_id: naverUser.id,
            avatar_url: existingUser.user_metadata?.avatar_url || naverUser.profile_image,
          },
        });
      }
    } else {
      // 신규 사용자 생성
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: naverUser.email,
        email_confirm: true,
        user_metadata: {
          name: naverUser.name || '',
          naver_id: naverUser.id,
          avatar_url: naverUser.profile_image || '',
          full_name: naverUser.name || '',
          role: 'student',
        },
        app_metadata: {
          provider: 'naver',
          providers: ['naver'],
          naver_id: naverUser.id,
        },
      });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      userId = newUser.user.id;

      // 프로필 자동 생성 (트리거가 없을 수 있으므로 직접)
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: naverUser.email,
        name: naverUser.name || '',
        role: 'student',
      }, { onConflict: 'id' });
    }

    // 4) 매직링크 생성 (OTP) — 사용자를 자동 로그인시키기 위해
    const { data: otpData, error: otpError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: naverUser.email,
      options: {
        redirectTo: `${redirect_uri || ''}`,
      },
    });

    if (otpError) {
      return new Response(
        JSON.stringify({ error: otpError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // hashed_token을 사용하여 verifyOtp로 세션 생성 가능
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email: naverUser.email,
        token_hash: otpData.properties?.hashed_token,
        is_new_user: !existingUser,
        naver_profile: {
          name: naverUser.name,
          profile_image: naverUser.profile_image,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Naver auth error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
