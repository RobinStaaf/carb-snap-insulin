import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  type: 'received' | 'approved';
  setupLink?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, setupLink }: EmailRequest = await req.json();
    
    console.log(`Sending ${type} email to:`, email);

    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN');
    const fromEmail = Deno.env.get('GMAIL_FROM_EMAIL');

    if (!clientId || !clientSecret || !refreshToken || !fromEmail) {
      throw new Error('Missing Gmail credentials');
    }

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh access token');
    }

    const { access_token } = await tokenResponse.json();

    // Create email content based on type
    let subject: string;
    let htmlBody: string;

    if (type === 'received') {
      subject = 'Application Received - CarbSmart';
      htmlBody = `
        <h1>Thank you for your application!</h1>
        <p>We have received your membership application and will review it as soon as possible.</p>
        <p>You will receive another email once your application has been reviewed.</p>
        <p>Best regards,<br>The CarbSmart Team</p>
      `;
    } else {
      subject = 'Application Approved - Setup Your Account';
      htmlBody = `
        <h1>Welcome to CarbSmart!</h1>
        <p>Your membership application has been approved!</p>
        <p>Click the link below to set up your password and complete your account:</p>
        <p><a href="${setupLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Set Up Password</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${setupLink}</p>
        <p>Best regards,<br>The CarbSmart Team</p>
      `;
    }

    // Create email in RFC 2822 format
    const emailLines = [
      `From: ${fromEmail}`,
      `To: ${email}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      htmlBody,
    ];

    const emailContent = emailLines.join('\r\n');
    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (!sendResponse.ok) {
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
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});