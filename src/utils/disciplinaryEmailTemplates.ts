/**
 * TechnoKraft Services LLP - Disciplinary & Attendance Email Templates
 * 
 * Generates clean, modern, mobile-optimized HTML email templates matching
 * proposalEmailTemplate.ts and emailTemplateRenderer.ts:
 * - Fluid hybrid table layout (max 620px)
 * - Top brand gradient accent bar
 * - Official TechnoKraft logo & brand identity
 * - Mobile-first responsive typography and spacing
 * - Clean two-column metadata tables with fixed width ratios
 * - Policy warning callouts & exit procedure checklists
 * - Dedicated HR Department Contact Desk card
 * - Official corporate signature & footer
 */

import { TECHNOKRAFT_LOGO_BASE64 } from '../assets/brandLogoBase64';

export interface DisciplinaryEmployeeInfo {
  name: string;
  employeeCode?: string;
  role?: string;
  department?: string;
  employmentType?: string;
  email?: string;
}

export interface DisciplinaryRecordInfo {
  date?: string;
  loginTime?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
}

export interface DisciplinaryHrContact {
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
}

export function escapeHtml(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds the reusable HR Department Contact Desk card.
 */
export function buildHrContactBoxHtml(contact?: DisciplinaryHrContact): string {
  const hrName = escapeHtml(contact?.hrName?.trim() || 'HR Department');
  const hrEmail = escapeHtml(contact?.hrEmail?.trim() || 'hr@technokraftservices.com');
  const hrPhone = escapeHtml(contact?.hrPhone?.trim() || '+91 98765 43210');
  const cleanPhone = (contact?.hrPhone || '+919876543210').replace(/[^0-9+]/g, '');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="width: 100%; margin-top: 22px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px;">
      <tr>
        <td colspan="2" style="padding-bottom: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #475569;">
          HR Department Assistance Desk
        </td>
      </tr>
      <tr>
        <td style="font-size: 12.5px; color: #64748B; padding: 5px 0; width: 42%; vertical-align: middle;">HR Representative:</td>
        <td style="font-size: 12.5px; color: #0F172A; font-weight: 600; text-align: right; padding: 5px 0; vertical-align: middle;">${hrName}</td>
      </tr>
      <tr>
        <td style="font-size: 12.5px; color: #64748B; padding: 5px 0; vertical-align: middle;">Official Email:</td>
        <td style="font-size: 12.5px; font-weight: 600; text-align: right; padding: 5px 0; vertical-align: middle;">
          <a href="mailto:${hrEmail}" style="color: #4F46E5; text-decoration: none;">${hrEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="font-size: 12.5px; color: #64748B; padding: 5px 0; vertical-align: middle;">Direct Helpline:</td>
        <td style="font-size: 12.5px; font-weight: 600; text-align: right; padding: 5px 0; vertical-align: middle;">
          <a href="tel:${cleanPhone}" style="color: #0F172A; text-decoration: none;">${hrPhone}</a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Builds the official TechnoKraft corporate footer block.
 */
function buildCorporateFooterHtml(recipientEmail?: string): string {
  const cleanEmail = escapeHtml(recipientEmail || 'employee@technokraftservices.com');

  return `
    <!-- FOOTER SECTION -->
    <tr>
      <td class="footer-pad"
        style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 26px 36px; text-align: left; color: #64748B; font-size: 12px; line-height: 19px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="font-size: 13.5px; font-weight: 700; color: #0F172A; margin-bottom: 3px;">
          TechnoKraft Services LLP
        </div>
        <div style="font-size: 11.5px; color: #64748B; margin-bottom: 8px;">
          Empowering professionals through innovative technical education and skill development.
        </div>
        <div style="margin-bottom: 12px; color: #64748B; font-size: 12px;">
          3rd Floor, Kanchwala Avenue, Thatte Nagar Marg, College Road, Nashik, Maharashtra 422005
        </div>
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; margin-right: 14px;">
            <strong>Phone:</strong> <a href="tel:+919370174424" style="color: #2563EB; text-decoration: none; font-weight: 600;">+91 93701 74424</a>
          </span>
          <span style="display: inline-block; margin-right: 14px;">
            <strong>Email:</strong> <a href="mailto:info@technokraftservices.com" style="color: #2563EB; text-decoration: none; font-weight: 600;">info@technokraftservices.com</a>
          </span>
          <span style="display: inline-block;">
            <strong>Website:</strong> <a href="https://www.technokraftservices.com/" target="_blank" style="color: #2563EB; text-decoration: none; font-weight: 600;">www.technokraftservices.com</a>
          </span>
        </div>
        <div style="height: 1px; background-color: #E2E8F0; margin: 12px 0;"></div>
        <p style="margin: 0; font-size: 11px; line-height: 17px; color: #94A3B8;">
          &copy; ${new Date().getFullYear()} TechnoKraft Services LLP. All rights reserved.<br />
          This communication was dispatched to <strong style="color: #64748B;">${cleanEmail}</strong>. Confidential HR notice intended solely for the named recipient.
        </p>
      </td>
    </tr>
  `;
}

/**
 * Shared CSS styles for client email rendering with mobile responsiveness.
 */
const EMAIL_BASE_STYLES = `
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: 100% !important;
    width: 100% !important;
    background-color: #F8FAFC;
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
      padding: 22px 20px 16px 20px !important;
    }
    .content-pad {
      padding: 20px 18px !important;
    }
    .footer-pad {
      padding: 22px 18px !important;
    }
    .col-label {
      width: 45% !important;
    }
  }
`;

// ============================================================================
// TEMPLATE 1: Daily Late Punch-in Intimation
// ============================================================================

export function buildDailyLateNoticeEmailHtml(
  employee: DisciplinaryEmployeeInfo,
  record: DisciplinaryRecordInfo,
  currentMonthLates: number,
  maxAllowed: number,
  hrContact?: DisciplinaryHrContact
): string {
  const empName = escapeHtml(employee.name || 'Team Member');
  const empCode = escapeHtml(employee.employeeCode || 'TK-EMP');
  const role = escapeHtml(employee.role || 'Member');
  const department = escapeHtml(employee.department || 'Operations');
  const dateStr = escapeHtml(record.date || new Date().toISOString().split('T')[0]);
  const loginTime = escapeHtml(record.loginTime || 'Past Shift Start');
  const shiftStart = escapeHtml(record.shiftStartTime || '10:00 AM');
  const shiftEnd = escapeHtml(record.shiftEndTime || '07:00 PM');

  const remaining = Math.max(0, maxAllowed - currentMonthLates);
  const badgeBg = remaining <= 1 ? '#DC2626' : remaining === 2 ? '#D97706' : '#2563EB';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Late Punch-in Intimation | TechnoKraft Services LLP</title>
  <style type="text/css">
    ${EMAIL_BASE_STYLES}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" class="fluid-container" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); border: 1px solid #E2E8F0;">

          <!-- TOP ACCENT BAR (Indigo) -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #5B4DB7 0%, #7C3AED 50%, #4F46E5 100%); background-color: #5B4DB7; font-size: 0px; line-height: 0px;">&nbsp;</td>
          </tr>

          <!-- HEADER SECTION -->
          <tr>
            <td class="header-pad" style="background-color: #FFFFFF; padding: 26px 36px 18px 36px; border-bottom: 1px solid #EDF2F7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" align="left">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right: 10px;">
                          <img src="${TECHNOKRAFT_LOGO_BASE64}" alt="TechnoKraft" width="38" height="38" style="display: block; width: 38px; height: 38px; object-fit: contain;" />
                        </td>
                        <td valign="middle">
                          <div style="font-size: 19px; font-weight: 400; color: #0F172A; line-height: 1; letter-spacing: 0.4px;">TechnoKraft</div>
                          <div style="font-size: 10.5px; font-weight: 700; color: #5B4DB7; text-align: right; line-height: 1; margin-top: 2px;">Services LLP</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <div style="display: inline-block; background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 5px 12px; text-align: right;">
                      <div style="font-size: 9.5px; font-weight: 700; color: #1D4ED8; text-transform: uppercase; letter-spacing: 0.5px;">Attendance Policy</div>
                      <div style="font-size: 13px; font-weight: 800; color: #1E3A8A; font-family: monospace;">DAILY RECORD</div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 16px;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #4F46E5; margin-bottom: 4px;">
                  Attendance Compliance &bull; Punctuality Notice
                </div>
                <h1 style="margin: 0; font-size: 20px; line-height: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                  Late Punch-in Intimation
                </h1>
              </div>
            </td>
          </tr>

          <!-- MAIN BODY CONTENT -->
          <tr>
            <td class="content-pad" style="padding: 26px 36px 22px 36px; background-color: #FFFFFF;">
              <p style="margin: 0 0 12px 0; font-size: 14.5px; font-weight: 600; color: #0F172A;">
                Dear ${empName},
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 22px; color: #334155;">
                This automated intimation confirms that your punch-in for <strong>${dateStr}</strong> was recorded past your designated shift commencement time.
              </p>

              <!-- METADATA TABLE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; width: 42%; vertical-align: middle;">Employee Code</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle; font-family: monospace;">${empCode}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; vertical-align: middle;">Designation &amp; Dept</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle;">${role} &bull; ${department}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; vertical-align: middle;">Scheduled Shift</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle;">${shiftStart} &ndash; ${shiftEnd}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; vertical-align: middle;">Recorded Punch-in</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #DC2626; font-weight: 700; text-align: right; vertical-align: middle;">${loginTime}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; font-size: 13px; color: #64748B; vertical-align: middle;">Monthly Late Count</td>
                  <td style="padding: 9px 14px; text-align: right; vertical-align: middle;">
                    <span style="display: inline-block; padding: 3px 11px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #FFFFFF; background-color: ${badgeBg}; line-height: 16px;">
                      ${currentMonthLates} of ${maxAllowed} Allowed
                    </span>
                  </td>
                </tr>
              </table>

              <!-- POLICY CALLOUT -->
              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 12px 16px; margin: 18px 0; font-size: 13px; line-height: 20px; color: #92400E;">
                <strong>Attendance Policy Reminder:</strong> Under company guidelines, a maximum of <strong>${maxAllowed} late punch-ins</strong> are permitted per calendar month.
                ${
                  remaining > 0
                    ? `You currently have <strong>${remaining}</strong> allowance(s) remaining before a formal Notice of Warning of Termination is triggered.`
                    : `<strong>Maximum threshold reached!</strong> Any further late arrivals will trigger formal disciplinary action.`
                }
              </div>

              <p style="margin: 14px 0 0 0; font-size: 12.5px; color: #64748B; line-height: 19px;">
                If your delay was caused by an approved client meeting, site duty, or pre-cleared field engagement, please notify your Reporting Manager to submit a regularization request.
              </p>

              <!-- HR CONTACT DESK -->
              ${buildHrContactBoxHtml(hrContact)}

              <!-- FORMAL SIGNATURE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 3px 0; font-size: 12.5px; color: #64748B;">Regards,</p>
                    <p style="margin: 0 0 2px 0; font-size: 13.5px; font-weight: 700; color: #0F172A;">Attendance &amp; Compliance Cell</p>
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #475569;">TechnoKraft Services LLP</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${buildCorporateFooterHtml(employee.email)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// TEMPLATE 2: Notice of Warning of Termination (4th Late Escalation)
// ============================================================================

export function buildTerminationWarningEmailHtml(
  employee: DisciplinaryEmployeeInfo,
  record: DisciplinaryRecordInfo,
  currentMonthLates: number,
  maxAllowed: number,
  customNoticeReason?: string,
  hrContact?: DisciplinaryHrContact
): string {
  const empName = escapeHtml(employee.name || 'Team Member');
  const empCode = escapeHtml(employee.employeeCode || 'TK-EMP');
  const role = escapeHtml(employee.role || 'Member');
  const empType = escapeHtml(employee.employmentType || 'Full-Time');
  const dateStr = escapeHtml(record.date || new Date().toISOString().split('T')[0]);
  const loginTime = escapeHtml(record.loginTime || 'Recorded Late');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notice of Warning of Termination | TechnoKraft Services LLP</title>
  <style type="text/css">
    ${EMAIL_BASE_STYLES}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" class="fluid-container" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 22px rgba(220, 38, 38, 0.12); border: 1px solid #FECACA;">

          <!-- TOP ACCENT BAR (Amber to Crimson) -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #F59E0B 0%, #EA580C 50%, #DC2626 100%); background-color: #DC2626; font-size: 0px; line-height: 0px;">&nbsp;</td>
          </tr>

          <!-- HEADER SECTION -->
          <tr>
            <td class="header-pad" style="background-color: #FFFFFF; padding: 26px 36px 18px 36px; border-bottom: 1px solid #EDF2F7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" align="left">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right: 10px;">
                          <img src="${TECHNOKRAFT_LOGO_BASE64}" alt="TechnoKraft" width="38" height="38" style="display: block; width: 38px; height: 38px; object-fit: contain;" />
                        </td>
                        <td valign="middle">
                          <div style="font-size: 19px; font-weight: 400; color: #0F172A; line-height: 1; letter-spacing: 0.4px;">TechnoKraft</div>
                          <div style="font-size: 10.5px; font-weight: 700; color: #DC2626; text-align: right; line-height: 1; margin-top: 2px;">Services LLP</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <div style="display: inline-block; background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 5px 12px; text-align: right;">
                      <div style="font-size: 9.5px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px;">Level 2 Escalation</div>
                      <div style="font-size: 13px; font-weight: 800; color: #991B1B; font-family: monospace;">CRITICAL NOTICE</div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 16px;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #DC2626; margin-bottom: 4px;">
                  Official Disciplinary Warning
                </div>
                <h1 style="margin: 0; font-size: 20px; line-height: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                  NOTICE OF WARNING OF TERMINATION
                </h1>
                <div style="font-size: 12px; color: #64748B; margin-top: 3px;">
                  Attendance Policy Breach &bull; Monthly Punctuality Threshold Exceeded
                </div>
              </div>
            </td>
          </tr>

          <!-- MAIN BODY CONTENT -->
          <tr>
            <td class="content-pad" style="padding: 26px 36px 22px 36px; background-color: #FFFFFF;">
              <p style="margin: 0 0 12px 0; font-size: 14.5px; font-weight: 600; color: #0F172A;">
                Dear ${empName} (${empCode}),
              </p>

              <!-- CRITICAL ALERT CALLOUT -->
              <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-left: 4px solid #DC2626; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 13.5px; line-height: 21px; color: #991B1B;">
                <strong>CRITICAL NOTICE:</strong> You have accumulated <strong>${currentMonthLates} late punch-in records</strong> in the current calendar month, meeting or exceeding the organizational allowance limit of <strong>${maxAllowed} lates</strong>.
              </div>

              ${
                customNoticeReason && customNoticeReason.trim()
                  ? `
              <div style="background-color: #F8FAFC; border-left: 4px solid #475569; border-radius: 6px; padding: 10px 14px; font-size: 13px; margin: 14px 0; color: #1E293B;">
                <strong>Management Remark:</strong> ${escapeHtml(customNoticeReason.trim())}
              </div>`
                  : ''
              }

              <!-- METADATA TABLE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; width: 42%; vertical-align: middle;">Employee Code</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle; font-family: monospace;">${empCode}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; vertical-align: middle;">Designation &amp; Type</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle;">${role} (${empType})</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; vertical-align: middle;">Escalation Date</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle;">${dateStr} (${loginTime})</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; font-size: 13px; color: #64748B; vertical-align: middle;">Monthly Late Status</td>
                  <td style="padding: 9px 14px; text-align: right; vertical-align: middle;">
                    <span style="display: inline-block; padding: 3px 11px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #FFFFFF; background-color: #DC2626; line-height: 16px;">
                      ${currentMonthLates} of ${maxAllowed} Allowed &bull; Limit Exceeded
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 14px 0 10px 0; font-size: 13.5px; line-height: 22px; color: #334155;">
                Punctuality and adherence to designated working hours are fundamental conditions of your appointment / internship contract at TechnoKraft Services. Please be formally advised that any further unexcused late arrival or unapproved absence during this month will lead to <strong>immediate termination of your employment / internship contract</strong>.
              </p>

              <div style="background-color: #FEF2F2; border-radius: 8px; padding: 12px 16px; margin: 16px 0; border: 1px solid #FECACA;">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #B91C1C;">
                  Action Required: You are required to submit a written explanation to your Reporting Manager and the HR desk within 24 business hours of receiving this notice.
                </p>
              </div>

              <!-- HR CONTACT DESK -->
              ${buildHrContactBoxHtml(hrContact)}

              <!-- FORMAL SIGNATURE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 3px 0; font-size: 12.5px; color: #64748B;">Issued By,</p>
                    <p style="margin: 0 0 2px 0; font-size: 13.5px; font-weight: 700; color: #0F172A;">Disciplinary &amp; Compliance Committee</p>
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #475569;">TechnoKraft Services LLP</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${buildCorporateFooterHtml(employee.email)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// TEMPLATE 3: Official Notice of Termination
// ============================================================================

export function buildOfficialTerminationEmailHtml(
  employee: DisciplinaryEmployeeInfo,
  terminationReason: string,
  effectiveDate: string,
  exitNotes?: string,
  hrContact?: DisciplinaryHrContact
): string {
  const empName = escapeHtml(employee.name || 'Team Member');
  const empCode = escapeHtml(employee.employeeCode || 'TK-EMP');
  const role = escapeHtml(employee.role || 'Member');
  const department = escapeHtml(employee.department || 'General');
  const effDate = escapeHtml(effectiveDate || new Date().toISOString().split('T')[0]);
  const cleanReason = escapeHtml(
    terminationReason?.trim() || 'Unsatisfactory attendance compliance following formal warning.'
  );

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Official Notice of Termination | TechnoKraft Services LLP</title>
  <style type="text/css">
    ${EMAIL_BASE_STYLES}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" class="fluid-container" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 22px rgba(15, 23, 42, 0.1); border: 1px solid #CBD5E1;">

          <!-- TOP ACCENT BAR (Dark Slate to Crimson) -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #DC2626 0%, #991B1B 50%, #0F172A 100%); background-color: #0F172A; font-size: 0px; line-height: 0px;">&nbsp;</td>
          </tr>

          <!-- HEADER SECTION -->
          <tr>
            <td class="header-pad" style="background-color: #0F172A; padding: 26px 36px 20px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" align="left">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right: 10px;">
                          <img src="${TECHNOKRAFT_LOGO_BASE64}" alt="TechnoKraft" width="38" height="38" style="display: block; width: 38px; height: 38px; object-fit: contain;" />
                        </td>
                        <td valign="middle">
                          <div style="font-size: 19px; font-weight: 400; color: #FFFFFF; line-height: 1; letter-spacing: 0.4px;">TechnoKraft</div>
                          <div style="font-size: 10.5px; font-weight: 700; color: #A5B4FC; text-align: right; line-height: 1; margin-top: 2px;">Services LLP</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <div style="display: inline-block; background-color: rgba(220, 38, 38, 0.25); border: 1px solid #DC2626; border-radius: 8px; padding: 5px 12px; text-align: right;">
                      <div style="font-size: 9.5px; font-weight: 700; color: #FCA5A5; text-transform: uppercase; letter-spacing: 0.5px;">Human Resources</div>
                      <div style="font-size: 13px; font-weight: 800; color: #FFFFFF; font-family: monospace;">TERMINATION</div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 18px;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #FCA5A5; margin-bottom: 4px;">
                  Confidential Personnel Notification
                </div>
                <h1 style="margin: 0; font-size: 20px; line-height: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px;">
                  OFFICIAL NOTICE OF TERMINATION
                </h1>
              </div>
            </td>
          </tr>

          <!-- MAIN BODY CONTENT -->
          <tr>
            <td class="content-pad" style="padding: 26px 36px 22px 36px; background-color: #FFFFFF;">
              <p style="margin: 0 0 12px 0; font-size: 14.5px; font-weight: 600; color: #0F172A;">
                Dear ${empName} (${empCode}),
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 22px; color: #334155;">
                This letter serves as formal written notification that your association with TechnoKraft Services LLP is hereby terminated, effective <strong>${effDate}</strong>.
              </p>

              <!-- BASIS CALLOUT -->
              <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-left: 4px solid #DC2626; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; line-height: 20px; color: #7F1D1D;">
                <strong>Primary Basis for Action:</strong><br />
                ${cleanReason}
              </div>

              <!-- METADATA TABLE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; width: 42%; vertical-align: middle;">Employee Code</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle; font-family: monospace;">${empCode}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; vertical-align: middle;">Designation</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle;">${role}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B; vertical-align: middle;">Department</td>
                  <td style="padding: 9px 14px; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; vertical-align: middle;">${department}</td>
                </tr>
                <tr>
                  <td class="col-label" style="padding: 9px 14px; font-size: 13px; color: #64748B; vertical-align: middle;">Effective Date</td>
                  <td style="padding: 9px 14px; font-size: 13px; color: #DC2626; font-weight: 700; text-align: right; vertical-align: middle;">${effDate}</td>
                </tr>
              </table>

              ${
                exitNotes && exitNotes.trim()
                  ? `
              <div style="background-color: #F8FAFC; border-left: 4px solid #64748B; border-radius: 6px; padding: 12px 16px; font-size: 13px; line-height: 20px; margin: 16px 0; color: #1E293B;">
                <strong>Exit &amp; Handover Instructions:</strong><br />
                ${escapeHtml(exitNotes.trim())}
              </div>`
                  : ''
              }

              <!-- EXIT PROCEDURES CHECKLIST -->
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 13px; color: #334155;">
                <strong style="color: #0F172A; font-size: 13px;">Exit Procedures &amp; Mandated Requirements:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.8; color: #475569;">
                  <li>Immediate deactivation of CRM, company email, and code repository access credentials.</li>
                  <li>Return of all company hardware, access badges, and proprietary materials.</li>
                  <li>Handover of ongoing client sprint deliverables to designated team lead.</li>
                  <li>Final tenure settlement and experience certificate processing via standard HR timeline.</li>
                </ul>
              </div>

              <!-- HR CONTACT DESK -->
              ${buildHrContactBoxHtml(hrContact)}

              <!-- FORMAL SIGNATURE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 3px 0; font-size: 12.5px; color: #64748B;">Executive Management,</p>
                    <p style="margin: 0 0 2px 0; font-size: 13.5px; font-weight: 700; color: #0F172A;">Human Resources Directorate</p>
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #475569;">TechnoKraft Services LLP</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${buildCorporateFooterHtml(employee.email)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
