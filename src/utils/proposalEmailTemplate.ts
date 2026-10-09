import { ProposalRecord } from '../types/opportunities';
import { formatCurrencyINR } from './currencyFormatters';
import { TECHNOKRAFT_LOGO_BASE64 } from '../assets/brandLogoBase64';
import {
  cleanProposalTitle,
  resolveMilestones,
  resolveHostingSection,
  resolveServicesSection,
} from './proposalPdfGenerator';

/**
 * Builds a clean, professional email subject line without awkward double dashes (--).
 */
export function buildProposalEmailSubject(proposal: ProposalRecord): string {
  const code = proposal.proposalCode || 'PR-0000';
  const cleanTitle = cleanProposalTitle(
    proposal.opportunityName || proposal.service || proposal.companyName || 'Enterprise Solution'
  );
  return `Quotation ${code} | ${cleanTitle} | TechnoKraft Services LLP`;
}

/**
 * Builds a state-of-the-art, branded responsive HTML email template for commercial proposals.
 * Uses inline styles for maximum compatibility across Gmail, Outlook, Apple Mail, and Yahoo.
 */
export function buildProposalEmailHtml(
  proposal: ProposalRecord,
  recipientName: string,
  customNote?: string
): string {
  const code = proposal.proposalCode || 'PR-0000';
  const cleanTitle = cleanProposalTitle(
    proposal.opportunityName || proposal.service || 'Commercial Proposal'
  );
  const companyName = proposal.companyName || 'Valued Client';
  const ownerName = proposal.ownerName || 'Commercial Director';
  const contactPhone = proposal.contactPhone || '+91 98765 43210';
  const cleanComp = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const attachmentPdfName = `Quotation_${code}_${cleanComp}.pdf`;

  const milestones = resolveMilestones(proposal);
  const hosting = resolveHostingSection(proposal);
  const services = resolveServicesSection(proposal);

  const hostingSub = hosting ? hosting.subtotal : 0;
  const servicesSub = hosting ? services?.subtotal || 0 : (services?.subtotal || 0);
  const devAmount = proposal.amount || 0;
  const grandTotal = devAmount + (hosting?.subtotal || 0) + (services?.subtotal || 0);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Milestone rows for HTML table
  const milestoneRows = milestones
    .map(
      (m, idx) => `
    <tr style="border-bottom: 1px solid #F1F5F9;">
      <td style="padding: 10px 12px; font-size: 13px; color: #1E293B; font-weight: 600;">
        <span style="display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; background: #EEF2FF; color: #5B4DB7; border-radius: 50%; font-size: 11px; margin-right: 6px;">${idx + 1}</span>
        ${m.title}
      </td>
      <td style="padding: 10px 12px; font-size: 12px; color: #64748B;">
        ${(m as any).deliverables || 'Milestone deliverables & validation'}
      </td>
      <td style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: center;">
        ${m.percentage}%
      </td>
      <td style="padding: 10px 12px; font-size: 13px; color: #0F172A; font-weight: 700; text-align: right; font-family: monospace;">
        ${formatCurrencyINR(m.amount)}
      </td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commercial Quotation ${code}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; line-height: 1.6;">

  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <!-- Top Accent Bar -->
    <tr>
      <td style="height: 5px; background: linear-gradient(90deg, #5B4DB7 0%, #7C3AED 50%, #4F46E5 100%);"></td>
    </tr>

    <!-- Brand Header -->
    <tr>
      <td style="background-color: #0F172A; padding: 22px 28px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="middle">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right: 12px;">
                    <img src="${TECHNOKRAFT_LOGO_BASE64}" alt="TechnoKraft" width="38" height="38" style="display: block; width: 38px; height: 38px; object-fit: contain;" />
                  </td>
                  <td valign="middle">
                    <div style="font-size: 19px; font-weight: 400; color: #FFFFFF; letter-spacing: 0.4px; line-height: 1;">
                      TechnoKraft
                    </div>
                    <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-align: right; line-height: 1; margin-top: 3px;">
                      Services LLP
                    </div>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 6px; letter-spacing: 0.3px;">
                Enterprise Engineering & Cloud Consulting
              </div>
            </td>
            <td align="right" valign="middle">
              <div style="display: inline-block; background-color: rgba(91, 77, 183, 0.3); border: 1px solid #7C3AED; border-radius: 8px; padding: 6px 12px; text-align: right;">
                <div style="font-size: 10px; font-weight: 700; color: #C4B5FD; text-transform: uppercase; letter-spacing: 0.5px;">Quotation Reference</div>
                <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; font-family: monospace;">${code}</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content Area -->
    <tr>
      <td style="padding: 30px 30px 20px;">
        
        <!-- Salutation -->
        <p style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 14px;">
          Dear ${recipientName || 'Client Team'},
        </p>

        <p style="font-size: 14px; color: #334155; margin: 0 0 20px; line-height: 1.6;">
          Thank you for engaging with TechnoKraft Services. We are pleased to submit our formal commercial quotation and delivery framework for <strong>${cleanTitle}</strong>.
        </p>

        ${
          customNote && customNote.trim()
            ? `
        <!-- Custom Cover Note Callout -->
        <div style="background-color: #F8FAFC; border-left: 4px solid #5B4DB7; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 0 0 24px; font-size: 13.5px; color: #334155; line-height: 1.6; white-space: pre-wrap;">
          ${customNote.trim()}
        </div>`
            : ''
        }

        <!-- Engagement Meta Card -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 14px 18px; width: 50%; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
              <div style="font-size: 10.5px; color: #64748B; text-transform: uppercase; font-weight: 700; letter-spacing: 0.3px;">Client Organization</div>
              <div style="font-size: 13.5px; color: #0F172A; font-weight: 700; margin-top: 3px;">${companyName}</div>
            </td>
            <td style="padding: 14px 18px; width: 50%; border-bottom: 1px solid #E2E8F0;">
              <div style="font-size: 10.5px; color: #64748B; text-transform: uppercase; font-weight: 700; letter-spacing: 0.3px;">Date of Issuance</div>
              <div style="font-size: 13.5px; color: #0F172A; font-weight: 700; margin-top: 3px;">${currentDate}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 18px; width: 50%; border-right: 1px solid #E2E8F0;">
              <div style="font-size: 10.5px; color: #64748B; text-transform: uppercase; font-weight: 700; letter-spacing: 0.3px;">Project Focus</div>
              <div style="font-size: 13px; color: #334155; font-weight: 600; margin-top: 3px;">${cleanTitle}</div>
            </td>
            <td style="padding: 14px 18px; width: 50%;">
              <div style="font-size: 10.5px; color: #64748B; text-transform: uppercase; font-weight: 700; letter-spacing: 0.3px;">Quotation Validity</div>
              <div style="font-size: 13px; color: #059669; font-weight: 700; margin-top: 3px;">30 Calendar Days</div>
            </td>
          </tr>
        </table>

        <!-- Section Title: Commercial Summary -->
        <div style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">
          Commercial Investment Summary
        </div>

        <!-- Commercial Summary Table -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #F1F5F9;">
              <th align="left" style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Scope / Component</th>
              <th align="left" style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Engagement Structure</th>
              <th align="right" style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Value (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 14px; font-size: 13px; color: #0F172A; font-weight: 600;">
                Development & Engineering Scope
              </td>
              <td style="padding: 12px 14px; font-size: 12.5px; color: #64748B;">
                Fixed Milestone Deliverables
              </td>
              <td style="padding: 12px 14px; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right; font-family: monospace;">
                ${formatCurrencyINR(devAmount)}
              </td>
            </tr>

            ${
              hosting && hosting.enabled && hostingSub > 0
                ? `
            <tr style="border-bottom: 1px solid #F1F5F9; background-color: #FAFAFA;">
              <td style="padding: 12px 14px; font-size: 13px; color: #0F172A; font-weight: 600;">
                Cloud Infrastructure & Hosting
              </td>
              <td style="padding: 12px 14px; font-size: 12.5px; color: #64748B;">
                ${(hosting as any).billingCycle || 'Cloud'} Deployment (${hosting.items?.length || 0} tier resources)
              </td>
              <td style="padding: 12px 14px; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right; font-family: monospace;">
                ${formatCurrencyINR(hostingSub)}
              </td>
            </tr>`
                : ''
            }

            ${
              services && services.enabled && servicesSub > 0
                ? `
            <tr style="border-bottom: 1px solid #F1F5F9; background-color: #FAFAFA;">
              <td style="padding: 12px 14px; font-size: 13px; color: #0F172A; font-weight: 600;">
                Managed Services & Support
              </td>
              <td style="padding: 12px 14px; font-size: 12.5px; color: #64748B;">
                ${(services as any).billingCycle || 'Managed'} SLA & Support (${services.items?.length || 0} scope items)
              </td>
              <td style="padding: 12px 14px; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right; font-family: monospace;">
                ${formatCurrencyINR(servicesSub)}
              </td>
            </tr>`
                : ''
            }

            <tr style="background-color: #EEF2FF;">
              <td colspan="2" style="padding: 14px 14px; font-size: 13.5px; color: #4338CA; font-weight: 800;">
                Grand Total Commercial Investment
              </td>
              <td style="padding: 14px 14px; font-size: 16px; color: #4338CA; font-weight: 800; text-align: right; font-family: monospace;">
                ${formatCurrencyINR(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        ${
          milestones.length > 0
            ? `
        <!-- Section Title: Milestone Breakdown -->
        <div style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">
          Progressive Delivery & Milestone Schedule
        </div>

        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #F1F5F9;">
              <th align="left" style="padding: 9px 12px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Phase</th>
              <th align="left" style="padding: 9px 12px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Deliverable Highlights</th>
              <th align="center" style="padding: 9px 12px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Share</th>
              <th align="right" style="padding: 9px 12px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${milestoneRows}
          </tbody>
        </table>`
            : ''
        }

        <!-- Attachment Notice Banner -->
        <div style="background-color: #F1EFFD; border: 1px solid #DDD6FE; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="middle">
                <div style="width: 32px; height: 32px; background-color: #5B4DB7; color: #FFFFFF; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">
                  📄
                </div>
              </td>
              <td valign="middle" style="padding-left: 12px;">
                <div style="font-size: 13px; font-weight: 700; color: #4338CA;">
                  Attached Official Document: ${attachmentPdfName}
                </div>
                <div style="font-size: 11.5px; color: #6B7280; margin-top: 2px;">
                  Comprehensive scope sheet, architecture specs, and milestone payment schedules are enclosed in the attached PDF.
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Terms & Delivery Standards Callout -->
        <div style="margin-bottom: 24px; font-size: 12.5px; color: #64748B; line-height: 1.6;">
          <strong style="color: #334155;">Key Commercial Terms:</strong>
          <ul style="margin: 6px 0 0 18px; padding: 0;">
            <li>Fixed Scope: Pricing corresponds strictly to agreed technical milestone deliverables.</li>
            <li>IP Ownership: 100% source code, architecture, and asset rights transfer to client upon completion.</li>
            <li>Warranty & SLA: Includes 60 calendar days of post-go-live warranty and defect rectification.</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #334155; margin: 0 0 24px; line-height: 1.6;">
          Please review the attached formal quotation. If you would like to proceed or schedule a technical walkthrough, kindly reply directly to this email or reach us using the contact details below.
        </p>

        <!-- Sign-off Block -->
        <div style="border-top: 1px solid #E2E8F0; padding-top: 18px;">
          <div style="font-size: 13px; color: #64748B;">Warm regards,</div>
          <div style="font-size: 15px; font-weight: 700; color: #0F172A; margin-top: 4px;">${ownerName}</div>
          <div style="font-size: 13px; font-weight: 600; color: #5B4DB7;">TechnoKraft Services LLP</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">
            Phone: ${contactPhone} &bull; Email: support@technokraft.com &bull; Pune, Maharashtra, India
          </div>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 18px 30px; text-align: center;">
        <div style="font-size: 11px; color: #94A3B8; line-height: 1.5;">
          This commercial quotation is strictly confidential and intended solely for the addressee (${recipientName || 'Valued Client'}).
          <br>
          &copy; 2026 TechnoKraft Services LLP. All rights reserved.
        </div>
      </td>
    </tr>

  </table>

</body>
</html>`;
}
