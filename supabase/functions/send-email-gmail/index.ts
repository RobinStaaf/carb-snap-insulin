import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlBody, textBody }: EmailRequest = await req.json();
    
    console.log('Sending email to:', to);

    // Get credentials from environment
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN');
    const fromEmail = Deno.env.get('GMAIL_FROM_EMAIL');

    if (!clientId || !clientSecret || !refreshToken || !fromEmail) {
      throw new Error('Missing Gmail credentials');
    }

    // Get access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }

    const { access_token } = await tokenResponse.json();

    // Create email in RFC 2822 format
    const emailLines = [
      `From: ${fromEmail}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary-string"',
      '',
      '--boundary-string',
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      textBody || htmlBody.replace(/<[^>]*>/g, ''),
      '',
      '--boundary-string',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      htmlBody,
      '',
      '--boundary-string--',
    ];

    const email = emailLines.join('\r\n');
    
    // Base64url encode the email
    const encodedEmail = btoa(email)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    });

    if (!sendResponse.ok) {
      const error = await sendResponse.text();
      console.error('Gmail API error:', error);
      throw new Error('Failed to send email via Gmail API');
    }

    const result = await sendResponse.json();
    console.log('Email sent successfully:', result.id);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-email-gmail function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
