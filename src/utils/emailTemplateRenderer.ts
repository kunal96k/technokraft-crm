/**
 * Utility to generate and render official TechnoKraft Services LLP branded B2B email HTML
 * Matches the design and structure of hiring-campaign.html:
 * - Fluid hybrid table layout (max 620px)
 * - Top brand gradient accent bar
 * - Official TechnoKraft logo & category badge
 * - Header subheader & notice title
 * - Clean content card with proper spacing and typography
 * - Formal corporate signature block
 * - Official company footer with address, phone, email, website, social links & copyright
 */

export interface RenderEmailOptions {
  subject: string;
  body: string;
  senderName?: string;
  senderEmail?: string;
  recipientEmail?: string;
  recipientName?: string;
  category?: string;
  leadCode?: string;
  companyName?: string;
}

export function formatBodyContent(rawBody: string): string {
  if (!rawBody) return '<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 23px; color: #334155;">(No content provided)</p>';

  if (rawBody.includes('<p>') || rawBody.includes('<div') || rawBody.includes('<table') || rawBody.includes('<br')) {
    return rawBody;
  }

  const paragraphs = rawBody.split(/\r?\n\r?\n/);
  return paragraphs
    .map((p) => {
      const lineBreaks = p.replace(/\r?\n/g, '<br/>');
      return `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 23px; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${lineBreaks}</p>`;
    })
    .join('');
}

export function renderBrandedEmailHtml(options: RenderEmailOptions): string {
  const {
    subject = 'Official Communication',
    body = '',
    senderName = 'TechnoKraft Services LLP',
    recipientEmail = 'client@example.com',
    category = 'B2B Enterprise Communication',
  } = options;

  const formattedBody = formatBodyContent(body);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)} | TechnoKraft Services LLP</title>
  <style type="text/css">
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background-color: #f8fafc;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table, td {
      border-collapse: collapse !important;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .fluid-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .header-pad {
        padding: 24px 20px 18px 20px !important;
      }
      .content-pad {
        padding: 24px 20px !important;
      }
      .footer-pad {
        padding: 28px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" class="fluid-container" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">

          <!-- TOP ACCENT BAR -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #0A2558 0%, #4f46e5 100%); background-color: #0A2558; font-size: 0px; line-height: 0px;">&nbsp;</td>
          </tr>

          <!-- HEADER SECTION -->
          <tr>
            <td class="header-pad" style="background-color: #ffffff; padding: 28px 36px 20px 36px; border-bottom: 1px solid #edf2f7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" align="left">
                    <img src="https://www.technokraftservices.com/assessment/images/tts-logo-services.png"
                         alt="TechnoKraft Services LLP" width="160"
                         style="display: block; width: 160px; max-width: 160px; height: auto;" />
                  </td>
                  <td valign="middle" align="right">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 12px;">
                          <span style="font-size: 11px; font-weight: 700; color: #334155; letter-spacing: 0.8px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ${escapeHtml(category)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 18px;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #2563eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 5px;">
                  TechnoKraft Services LLP &bull; Enterprise Solutions &amp; Consulting
                </div>
                <h1 style="margin: 0; font-size: 20px; line-height: 28px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  ${escapeHtml(subject)}
                </h1>
              </div>
            </td>
          </tr>

          <!-- MAIN BODY CONTENT -->
          <tr>
            <td class="content-pad" style="padding: 28px 36px 24px 36px; background-color: #ffffff;">
              <div style="font-size: 14px; line-height: 23px; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${formattedBody}
              </div>

              <!-- SIGNATURE BLOCK -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Regards,
                    </p>
                    <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${escapeHtml(senderName)}
                    </p>
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      TechnoKraft Services LLP
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER SECTION (EXACT AS IN HIRING-CAMPAIGN.HTML) -->
          <tr>
            <td class="footer-pad"
                style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 26px 36px; text-align: left; color: #64748b; font-size: 12px; line-height: 19px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

              <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                TechnoKraft Services LLP
              </div>

              <div style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">
                Empowering professionals through innovative technical education and skill development.
              </div>

              <div style="margin-bottom: 12px; color: #64748b; font-size: 12px;">
                3rd Floor, Kanchwala Avenue, Thatte Nagar Marg, College Road, Nashik, Maharashtra 422005
              </div>

              <!-- CONTACT LINKS -->
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; margin-right: 14px;">
                  <strong>Phone:</strong> <a href="tel:+919370174424"
                    style="color: #2563eb; text-decoration: none; font-weight: 600;">+91 93701 74424</a>
                </span>
                <span style="display: inline-block; margin-right: 14px;">
                  <strong>Email:</strong> <a href="mailto:info@technokraftservices.com"
                    style="color: #2563eb; text-decoration: none; font-weight: 600;">info@technokraftservices.com</a>
                </span>
                <span style="display: inline-block;">
                  <strong>Website:</strong> <a href="https://www.technokraftservices.com/" target="_blank"
                    style="color: #2563eb; text-decoration: none; font-weight: 600;">www.technokraftservices.com</a>
                </span>
              </div>

              <!-- SOCIAL LINKS -->
              <div style="margin-bottom: 12px; font-size: 11.5px; color: #64748b;">
                <strong>Connect with us:</strong>
                <a href="https://www.instagram.com/technokraft_tts" target="_blank" style="color: #0A2558; text-decoration: none; font-weight: 600; margin-left: 6px;">Instagram</a> &bull;
                <a href="https://www.linkedin.com/company/ttsnashik/" target="_blank" style="color: #0A2558; text-decoration: none; font-weight: 600; margin-left: 6px;">LinkedIn</a> &bull;
                <a href="https://www.youtube.com/@technokraft-tts455" target="_blank" style="color: #0A2558; text-decoration: none; font-weight: 600; margin-left: 6px;">YouTube</a> &bull;
                <a href="https://www.facebook.com/tts.net.in/" target="_blank" style="color: #0A2558; text-decoration: none; font-weight: 600; margin-left: 6px;">Facebook</a>
              </div>

              <div style="height: 1px; background-color: #e2e8f0; margin: 12px 0;"></div>

              <p style="margin: 0; font-size: 11px; line-height: 17px; color: #94a3b8;">
                &copy; 2026 TechnoKraft Services LLP. All rights reserved.<br />
                This message was dispatched to <strong style="color: #64748b;">${escapeHtml(recipientEmail)}</strong>. This communication contains official and confidential enterprise business details.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
