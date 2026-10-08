import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProposalRecord } from '../types/opportunities';
import { formatCurrencyINR } from './currencyFormatters';
import brandLogoImg from '../fonts/images/image.png';

/**
 * Company Profile & Metadata
 * Strictly commercial quotation information (Zero GSTIN / banking / remittance details)
 */
export const COMPANY_INFO = {
  name: 'TechnoKraft Services LLP',
  website: 'https://www.technokraftservices.com',
  email: 'info@technokraftservices.com',
  phone: '+91 93701 74424',
  address: "3rd Floor, Kanchwala Avenue, Above Viju's Dabeli, Thatte Nagar Marg, College Road, Nashik, Maharashtra 422005",
};

/**
 * Generates high-resolution base64 red-triangular brand emblem fallback
 */
function getFallbackLogoBase64(): string {
  try {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, 240, 140);

    // Red Triangular TechnoKraft Emblem
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.moveTo(35, 15);
    ctx.lineTo(15, 125);
    ctx.lineTo(60, 125);
    ctx.closePath();
    ctx.fill();

    // Red inner shard
    ctx.fillStyle = '#BE123C';
    ctx.beginPath();
    ctx.moveTo(35, 15);
    ctx.lineTo(60, 125);
    ctx.lineTo(80, 70);
    ctx.closePath();
    ctx.fill();

    // TTS lettermark on emblem
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TTS', 42, 95);

    // TechnoKraft Title Text
    ctx.fillStyle = '#181C20';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TechnoKraft', 95, 60);

    // Services LLP Subtitle Text
    ctx.fillStyle = '#5B4DB7';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Services LLP', 100, 95);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/**
 * Fetch image and convert to Base64 data URL with exact natural dimensions
 */
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || typeof Image === 'undefined') {
        return resolve(null);
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 240;
          canvas.height = img.naturalHeight || img.height || 140;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageUrl;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Resolves active company logo for PDF & HTML rendering with graceful fallback
 */
async function resolveCompanyLogo(): Promise<string> {
  try {
    if (brandLogoImg) {
      const importedLogo = await getBase64ImageFromUrl(brandLogoImg);
      if (importedLogo) return importedLogo;
    }
    const publicLogo = await getBase64ImageFromUrl('/fonts/images/image.png');
    if (publicLogo) return publicLogo;

    const rootLogo = await getBase64ImageFromUrl('/logo.png');
    if (rootLogo) return rootLogo;
  } catch {
    // proceed to fallback
  }
  return getFallbackLogoBase64();
}

/**
 * Resolves milestone schedule dynamically from commercialDetails (JSON string or object)
 * or falls back to standard structured development phases.
 */
export function resolveMilestones(proposal: ProposalRecord): { title: string; percentage: number; amount: number }[] {
  let comm: any = proposal.commercialDetails;
  if (typeof comm === 'string') {
    try {
      comm = JSON.parse(comm);
    } catch {
      comm = null;
    }
  }

  const rawMilestones =
    comm?.milestones ||
    (proposal as any).milestones ||
    comm?.commercialDetails?.milestones;

  if (Array.isArray(rawMilestones) && rawMilestones.length > 0) {
    return rawMilestones.map((m: any, idx: number) => ({
      title: String(m.title || `Deliverable Milestone #${idx + 1}`),
      percentage: Number(m.percentage) || 0,
      amount: Number(m.amount) || 0,
    }));
  }

  const total = Number(proposal.amount) || 0;
  return [
    {
      title: 'Phase 1: Project Kickoff, Technical Architecture & Solution Specification',
      percentage: 30,
      amount: Math.round(total * 0.3),
    },
    {
      title: 'Phase 2: Core Engineering, UI/UX Implementation & Module Integration',
      percentage: 40,
      amount: Math.round(total * 0.4),
    },
    {
      title: 'Phase 3: Production UAT, Cutover & Handover',
      percentage: 30,
      amount: Math.round(total * 0.3),
    },
  ];
}

/**
 * Resolves optional Cloud Hosting / AWS EC2 infrastructure section dynamically
 */
export function resolveHostingSection(proposal: ProposalRecord) {
  let comm: any = proposal.commercialDetails;
  if (typeof comm === 'string') {
    try {
      comm = JSON.parse(comm);
    } catch {
      comm = null;
    }
  }

  const hs = proposal.hostingSection || comm?.hostingSection;
  if (hs && (hs.enabled || (Array.isArray(hs.items) && hs.items.length > 0))) {
    const items = Array.isArray(hs.items) ? hs.items : [];
    if (items.length > 0) {
      const subtotal = hs.subtotal || items.reduce((s: number, i: any) => s + (Number(i.totalCost) || 0), 0);
      return {
        enabled: true,
        note: hs.note || 'Hosting and infrastructure charges are billed separately per actual resource usage.',
        items,
        subtotal,
      };
    }
  }
  return null;
}

/**
 * Resolves optional Managed Services & AMC section dynamically
 */
export function resolveServicesSection(proposal: ProposalRecord) {
  let comm: any = proposal.commercialDetails;
  if (typeof comm === 'string') {
    try {
      comm = JSON.parse(comm);
    } catch {
      comm = null;
    }
  }

  const ss = proposal.servicesSection || comm?.servicesSection;
  if (ss && (ss.enabled || (Array.isArray(ss.items) && ss.items.length > 0))) {
    const items = Array.isArray(ss.items) ? ss.items : [];
    if (items.length > 0) {
      const subtotal = ss.subtotal || items.reduce((s: number, i: any) => s + (Number(i.totalCost) || 0), 0);
      return {
        enabled: true,
        note: ss.note || 'Post-deployment managed services and AMC charges are optional and quoted separately.',
        items,
        subtotal,
      };
    }
  }
  return null;
}

/**
 * Generate a complete, styled HTML document for the pre-sales Commercial Quotation
 * Formatted for standard A4 print layout (@media print) and browser print preview.
 */
export function generateProposalHtml(proposal: ProposalRecord): string {
  const milestones = resolveMilestones(proposal);
  const resolvedHosting = resolveHostingSection(proposal);
  const hostingEnabled = Boolean(resolvedHosting);
  const hostingSubtotal = resolvedHosting ? resolvedHosting.subtotal : 0;
  const resolvedServices = resolveServicesSection(proposal);
  const servicesEnabled = Boolean(resolvedServices);
  const servicesSubtotal = resolvedServices ? resolvedServices.subtotal : 0;
  const devAmount = proposal.amount || 0;
  const grandTotal = devAmount + hostingSubtotal + servicesSubtotal;

  const issueDate = proposal.sentDate || proposal.createdDate || new Date().toISOString().slice(0, 10);
  const deliveryTimeline = proposal.timelineDescription || '12-14 Weeks from Project Kick-off';
  const opportunityTitle = proposal.opportunityName || 'Custom Enterprise Solution';
  const commercialOwner = proposal.ownerName || 'Commercial Engagement Lead';
  const clientCompany = proposal.companyName || 'Valued Client';
  const clientContact = proposal.contactName || 'Primary Stakeholder';
  const proposalCode = proposal.proposalCode || 'PR-2026-9182';

  // Section 2: Milestone Table Rows
  const milestoneRows = milestones
    .map(
      (m, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 7px 10px; text-align: center; color: #64748B; font-weight: 700; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 7px 10px; font-weight: 600; color: #0F172A; font-size: 11px; line-height: 1.35;">${m.title}</td>
        <td style="padding: 7px 10px; text-align: center; color: #475569; font-weight: 600; font-size: 11px; white-space: nowrap;">Phase ${idx + 1} (${m.percentage}%)</td>
        <td style="padding: 7px 10px; text-align: right; color: #0F172A; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px;">${formatCurrencyINR(m.amount)}</td>
      </tr>
    `
    )
    .join('');

  // Section 3: Hosting Table Rows (Optional)
  let hostingSectionHtml = '';
  if (hostingEnabled && resolvedHosting?.items) {
    const hostingRows = resolvedHosting.items
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 7px 10px; text-align: center; color: #64748B; font-weight: 700; font-size: 11px;">${idx + 1}</td>
          <td style="padding: 7px 10px; font-weight: 600; color: #0F172A; font-size: 11px; line-height: 1.35;">
            ${item.description}
            ${item.notes ? `<div style="font-size: 9.5px; color: #64748B; margin-top: 2px;">${item.notes}</div>` : ''}
          </td>
          <td style="padding: 7px 10px; text-align: center; color: #475569; font-weight: 600; font-size: 10.5px;">${item.provider || 'AWS'}</td>
          <td style="padding: 7px 10px; text-align: center; color: #475569; font-weight: 600; font-size: 10.5px; text-transform: capitalize;">${item.billingCycle || 'monthly'}</td>
          <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 11px;">${formatCurrencyINR(item.unitCost)}</td>
          <td style="padding: 7px 10px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px;">${item.quantity}</td>
          <td style="padding: 7px 10px; text-align: right; color: #0F172A; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px;">${formatCurrencyINR(item.totalCost)}</td>
        </tr>
      `
      )
      .join('');

    hostingSectionHtml = `
      <div class="table-container">
        <div class="section-header">3. Cloud Infrastructure & Hosting (AWS EC2 / Servers / Domain)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th style="text-align: left;">Resource / Service Description</th>
              <th style="width: 70px; text-align: center;">Provider</th>
              <th style="width: 75px; text-align: center;">Billing Cycle</th>
              <th style="width: 85px; text-align: right;">Unit Rate</th>
              <th style="width: 45px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Subtotal (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${hostingRows}
            <tr style="background: #F8FAFC; font-weight: 700;">
              <td colspan="6" style="padding: 7px 10px; text-align: right; color: #475569; font-size: 10.5px;">Hosting Subtotal:</td>
              <td style="padding: 7px 10px; text-align: right; color: #5B4DB7; font-family: 'JetBrains Mono', monospace; font-size: 11.5px;">${formatCurrencyINR(hostingSubtotal)}</td>
            </tr>
          </tbody>
        </table>
        ${
          resolvedHosting.note
            ? `<div style="font-size: 9.5px; color: #64748B; margin-top: 4px; font-style: italic;">Note: ${resolvedHosting.note}</div>`
            : ''
        }
      </div>
    `;
  }

  // Section 4: Managed Services Table Rows (Optional)
  let servicesSectionHtml = '';
  if (servicesEnabled && resolvedServices?.items) {
    const servicesRows = resolvedServices.items
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 7px 10px; text-align: center; color: #64748B; font-weight: 700; font-size: 11px;">${idx + 1}</td>
          <td style="padding: 7px 10px; font-weight: 600; color: #0F172A; font-size: 11px; line-height: 1.35;">
            ${item.description}
            ${item.notes ? `<div style="font-size: 9.5px; color: #64748B; margin-top: 2px;">${item.notes}</div>` : ''}
          </td>
          <td style="padding: 7px 10px; text-align: center; color: #475569; font-weight: 600; font-size: 10.5px; text-transform: capitalize;">${item.billingCycle || 'monthly'}</td>
          <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 11px;">${formatCurrencyINR(item.unitCost)}</td>
          <td style="padding: 7px 10px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px;">${item.quantity}</td>
          <td style="padding: 7px 10px; text-align: right; color: #0F172A; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px;">${formatCurrencyINR(item.totalCost)}</td>
        </tr>
      `
      )
      .join('');

    servicesSectionHtml = `
      <div class="table-container">
        <div class="section-header">4. Managed Services & Annual Maintenance (AMC / SLA)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th style="text-align: left;">Support / Maintenance Scope Description</th>
              <th style="width: 80px; text-align: center;">Billing Cycle</th>
              <th style="width: 85px; text-align: right;">Unit Rate</th>
              <th style="width: 45px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Subtotal (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${servicesRows}
            <tr style="background: #F8FAFC; font-weight: 700;">
              <td colspan="5" style="padding: 7px 10px; text-align: right; color: #475569; font-size: 10.5px;">Managed Services Subtotal:</td>
              <td style="padding: 7px 10px; text-align: right; color: #5B4DB7; font-family: 'JetBrains Mono', monospace; font-size: 11.5px;">${formatCurrencyINR(servicesSubtotal)}</td>
            </tr>
          </tbody>
        </table>
        ${
          resolvedServices.note
            ? `<div style="font-size: 9.5px; color: #64748B; margin-top: 4px; font-style: italic;">Note: ${resolvedServices.note}</div>`
            : ''
        }
      </div>
    `;
  }

  const cleanCompanyName = clientCompany.replace(/[^a-zA-Z0-9]/g, '_');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quotation_${proposalCode}_${cleanCompanyName}</title>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.warn('Auto-print interrupted:', e);
        }
      }, 400);
    });
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    
    @font-face {
      font-family: 'Neuropol';
      src: url('/fonts/Neuropol.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    .font-brand {
      font-family: 'Neuropol', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    @page {
      size: A4 portrait;
      margin: 9mm;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      line-height: 1.4;
      font-size: 11px;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
    }
    
    @media print {
      body {
        padding: 0;
        background: #FFFFFF;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    
    .sheet {
      max-width: 820px;
      margin: 0 auto;
      background: #FFFFFF;
    }
    
    /* Top Accent Line */
    .top-bar {
      height: 4px;
      background: #5B4DB7;
      border-radius: 2px;
      margin-bottom: 12px;
    }
    
    /* Header Area */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 10px;
      border-bottom: 1px solid #E2E8F0;
      margin-bottom: 10px;
    }
    
    .brand-header-left {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    /* Exact Brand Logo matching application sidebar styling */
    .brand-logo-container {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      user-select: none;
    }
    
    .brand-emblem-wrap {
      position: relative;
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .brand-emblem-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transform: translateY(-2px);
    }
    
    .brand-title-col {
      display: flex;
      flex-direction: column;
      min-width: 0;
      justify-content: center;
    }
    
    .brand-title-text {
      font-family: 'Neuropol', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 17px;
      letter-spacing: 0.5px;
      line-height: 1;
      color: #181C20;
      font-weight: 700;
    }
    
    .brand-sub-text {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: -0.2px;
      text-align: right;
      align-self: flex-end;
      margin-top: 2px;
      color: #5B4DB7;
      line-height: 1;
    }
    
    .company-contact-meta {
      font-size: 8.8px;
      color: #64748B;
      line-height: 1.4;
      margin-top: 2px;
    }

    .company-contact-meta a {
      color: #5B4DB7;
      text-decoration: none;
      font-weight: 600;
    }
    
    .quotation-badge-area {
      text-align: right;
    }
    
    .doc-type-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #5B4DB7;
      margin-bottom: 3px;
    }
    
    .quotation-code-pill {
      display: inline-block;
      background: #F1EFFD;
      color: #5B4DB7;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 5px;
      border: 1px solid #DDD6FE;
      margin-bottom: 4px;
    }
    
    .meta-line {
      font-size: 9.5px;
      color: #475569;
      margin-bottom: 1px;
    }
    
    .meta-line strong {
      color: #0F172A;
    }

    /* Client & Scope 2-Column Grid */
    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px 11px;
      margin-bottom: 10px;
    }
    
    .card-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #5B4DB7;
      margin-bottom: 3px;
    }
    
    .primary-client-name {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.25;
    }
    
    .client-subtext {
      font-size: 9.5px;
      color: #334155;
      margin-top: 2px;
    }
    
    .client-subtext strong {
      color: #0F172A;
    }
    
    .meta-detail-row {
      font-size: 9px;
      color: #475569;
      margin-top: 1.5px;
    }

    .meta-detail-row strong {
      color: #0F172A;
    }

    /* Section Headings */
    .section-header {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #5B4DB7;
      margin-bottom: 3.5px;
    }
    
    /* Section 1: Executive Scope Callout */
    .scope-callout {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-left: 3.5px solid #5B4DB7;
      border-radius: 5px;
      padding: 6px 10px;
      font-size: 9.5px;
      color: #334155;
      line-height: 1.4;
      margin-bottom: 9px;
    }

    /* Tables */
    .table-container {
      margin-bottom: 9px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #E2E8F0;
      border-radius: 5px;
      overflow: hidden;
    }
    
    th {
      background: #5B4DB7;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 9px;
    }

    /* Terms & Quotation Summary Grid */
    .bottom-split-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 10px;
      margin-bottom: 9px;
    }
    
    .terms-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 8.8px;
      color: #475569;
      line-height: 1.38;
    }
    
    .terms-card ol {
      padding-left: 13px;
      margin-top: 2px;
    }
    
    .terms-card li {
      margin-bottom: 2px;
    }
    
    .terms-card strong {
      color: #1E293B;
    }

    .summary-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px 11px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #475569;
      margin-bottom: 3.5px;
    }
    
    .summary-row span:last-child {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #0F172A;
    }
    
    .total-highlight-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F1EFFD;
      border: 1px solid #DDD6FE;
      border-radius: 5px;
      padding: 7px 9px;
      margin-top: 3.5px;
    }
    
    .total-label {
      font-weight: 800;
      font-size: 10px;
      color: #5B4DB7;
      text-transform: uppercase;
    }
    
    .total-val {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 13px;
      color: #5B4DB7;
    }

    /* Acceptance & Signatures */
    .sign-section {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px 11px;
      margin-bottom: 8px;
    }
    
    .sign-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .sign-party-heading {
      font-size: 9px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 2px;
    }
    
    .sign-role-sub {
      font-size: 8px;
      color: #64748B;
      margin-bottom: 16px;
    }
    
    .signature-line {
      border-top: 1px dashed #94A3B8;
      padding-top: 3px;
      font-size: 9px;
      color: #334155;
    }
    
    .signature-line strong {
      color: #0F172A;
    }

    /* Footer */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #F1F5F9;
      padding-top: 5px;
      font-size: 8px;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <!-- Printable Page Sheet Container -->
  <div class="sheet">
    <!-- Non-printable top preview bar -->
    <div class="no-print" style="margin-bottom: 14px; background: #0F172A; color: #FFFFFF; padding: 10px 16px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 15px;">📄</span>
        <span style="font-weight: 700; font-size: 12px; letter-spacing: 0.2px;">Quotation Preview: ${proposalCode} &bull; ${clientCompany}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="window.print()" style="background: #5B4DB7; color: #FFFFFF; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
          <span>🖨️</span><span>Print / Save as PDF</span>
        </button>
        <button onclick="window.close()" style="background: #334155; color: #E2E8F0; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer;">
          Close
        </button>
      </div>
    </div>

    <!-- Top Accent Bar -->
    <div class="top-bar"></div>

    <!-- Header Section -->
    <div class="header">
      <div class="brand-header-left">
        <!-- Brand Logo Copy-Pasted as is from Sidebar style -->
        <div id="brand-logo-container" class="brand-logo-container">
          <div class="brand-emblem-wrap">
            <img alt="TechnoKraft Emblem" class="brand-emblem-img" src="${brandLogoImg || '/fonts/images/image.png'}" onerror="this.onerror=null; this.src='/logo.png';" />
          </div>
          <div class="brand-title-col">
            <span class="font-brand brand-title-text">TechnoKraft</span>
            <span class="brand-sub-text">Services LLP</span>
          </div>
        </div>
        <div class="company-contact-meta">
          <a href="${COMPANY_INFO.website}" target="_blank">www.technokraftservices.com</a> &bull; ${COMPANY_INFO.email} &bull; Tel: ${COMPANY_INFO.phone}<br>
          ${COMPANY_INFO.address}
        </div>
      </div>
      <div class="quotation-badge-area">
        <div class="doc-type-label">Commercial Quotation</div>
        <div class="quotation-code-pill">${proposalCode}</div>
        <div class="meta-line">Issue Date: <strong>${issueDate}</strong></div>
      </div>
    </div>

    <!-- Client & Scope Grid (2-Column Card Box) -->
    <div class="grid-2col">
      <div>
        <div class="card-title">Quotation Prepared For (Client Details)</div>
        <div class="primary-client-name">${clientCompany}</div>
        <div class="client-subtext">Attention: <strong>${clientContact}</strong></div>
        ${proposal.contactEmail ? `<div class="meta-detail-row">Email: <strong>${proposal.contactEmail}</strong></div>` : ''}
        ${proposal.contactPhone ? `<div class="meta-detail-row">Phone: <strong>${proposal.contactPhone}</strong></div>` : ''}
        ${proposal.leadCode ? `<div class="meta-detail-row">Lead Reference: <span style="font-family: monospace;">${proposal.leadCode}</span></div>` : ''}
      </div>
      <div>
        <div class="card-title">Commercial Project Scope</div>
        <div class="primary-client-name">${opportunityTitle}</div>
        <div class="client-subtext">Domain Service: <strong>${proposal.service || 'Technology Consulting'}</strong></div>
        <div class="meta-detail-row">Delivery Timeline: <strong>${deliveryTimeline}</strong></div>
        <div class="meta-detail-row">Commercial Lead: <strong>${commercialOwner}</strong></div>
      </div>
    </div>

    <!-- Section 1: Solution Scope / Executive Summary -->
    <div>
      <div class="section-header">1. Executive Project Scope & Architectural Overview</div>
      <div class="scope-callout">
        ${
          proposal.summary ||
          `Comprehensive commercial quotation and technical implementation scope for ${opportunityTitle}, executed according to structured enterprise delivery milestones, technical sign-off criteria, and quality standards established by TechnoKraft Services LLP.`
        }
      </div>
    </div>

    <!-- Section 2: Commercial Deliverables & Milestone Schedule Table -->
    <div class="table-container">
      <div class="section-header">2. Commercial Deliverables & Milestone Schedule</div>
      <table>
        <thead>
          <tr>
            <th style="width: 32px; text-align: center;">#</th>
            <th style="text-align: left;">Deliverable / Milestone Scope Description</th>
            <th style="width: 120px; text-align: center;">Milestone Schedule</th>
            <th style="width: 130px; text-align: right;">Net Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${milestoneRows}
          <tr style="background: #F8FAFC; font-weight: 700;">
            <td colspan="3" style="padding: 7px 10px; text-align: right; color: #475569; font-size: 10.5px;">Development Milestones Subtotal:</td>
            <td style="padding: 7px 10px; text-align: right; color: #5B4DB7; font-family: 'JetBrains Mono', monospace; font-size: 11.5px;">${formatCurrencyINR(devAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 3: Cloud Hosting & Infrastructure (Optional) -->
    ${hostingSectionHtml}

    <!-- Section 4: Managed Services & AMC (Optional) -->
    ${servicesSectionHtml}

    <!-- Section 5 & 6: Commercial Terms & Quotation Summary Grid -->
    <div class="bottom-split-grid">
      <!-- Section 5: Terms -->
      <div class="terms-card">
        <div class="section-header" style="margin-bottom: 2px;">5. Commercial Terms & Engagement Conditions</div>
        <ol>
          <li><strong>Scope of Work:</strong> Pricing corresponds strictly to agreed milestone deliverables and infrastructure specs.</li>
          <li><strong>Milestone Sign-off:</strong> Invoices are settled upon client review and acceptance sign-off.</li>
          ${
            hostingEnabled
              ? '<li><strong>Cloud Infrastructure:</strong> AWS EC2 server and domain charges are billed per resource usage schedule.</li>'
              : ''
          }
          <li><strong>Intellectual Property:</strong> 100% IP rights and source code transferred upon final handover.</li>
          <li><strong>Quality Warranty:</strong> Includes 30-day post-launch technical warranty and bug resolution support.</li>
        </ol>
      </div>

      <!-- Section 6: Quotation Summary Card -->
      <div class="summary-card">
        <div>
          <div class="section-header" style="margin-bottom: 4px;">6. Commercial Quotation Summary</div>
          <div class="summary-row">
            <span>Development Milestones:</span>
            <span>${formatCurrencyINR(devAmount)}</span>
          </div>
          ${
            hostingEnabled
              ? `<div class="summary-row"><span>Cloud Infrastructure & Hosting:</span><span>${formatCurrencyINR(hostingSubtotal)}</span></div>`
              : ''
          }
          ${
            servicesEnabled
              ? `<div class="summary-row"><span>Managed Services & AMC:</span><span>${formatCurrencyINR(servicesSubtotal)}</span></div>`
              : ''
          }
        </div>
        <div class="total-highlight-row">
          <span class="total-label">Total Commercial Value:</span>
          <span class="total-val">${formatCurrencyINR(grandTotal)}</span>
        </div>
      </div>
    </div>

    <!-- Section 7: Acceptance & Sign-off Block -->
    <div class="sign-section">
      <div class="section-header" style="margin-bottom: 5px;">7. Proposal Acceptance & Sign-off Confirmation</div>
      <div class="sign-grid">
        <div>
          <div class="sign-party-heading">For ${COMPANY_INFO.name}</div>
          <div class="sign-role-sub">Authorized Solution Partner</div>
          <div class="signature-line">
            <strong>${commercialOwner}</strong>
          </div>
        </div>
        <div>
          <div class="sign-party-heading">Accepted & Confirmed by Client</div>
          <div class="sign-role-sub">${clientCompany}</div>
          <div class="signature-line">
            <strong>${clientContact}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="doc-footer">
      <div>Commercial Quotation &bull; TechnoKraft Services LLP &bull; Ref: ${proposalCode}</div>
      <div>Page 1 of 1</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Opens print preview window with isolated Blob URL and triggers browser window.print()
 * Uses unique window name to prevent document overwrites or cross-proposal caching bugs.
 */
export function printProposalDocument(proposal: ProposalRecord): void {
  const htmlContent = generateProposalHtml(proposal);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const windowKey = `quotation_${(proposal.proposalCode || proposal.id || String(Date.now())).replace(/[^a-zA-Z0-9]/g, '_')}`;

  const printWindow = window.open(blobUrl, windowKey);
  if (printWindow) {
    printWindow.focus();
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {}
    }, 60000);
  } else {
    // Popup fallback using invisible iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print error:', e);
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
          }, 2000);
        }
      }, 300);
    };
    iframe.src = blobUrl;
  }
}

/**
 * Strips awkward double hyphens, multiple dashes, and leading/trailing dashes
 * from proposal titles, opportunity names, and subject lines.
 */
export function cleanProposalTitle(rawTitle?: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/--+/g, ' - ')
    .replace(/\s+-\s+-\s+/g, ' - ')
    .replace(/^\s*[-–—:]+\s*/, '')
    .replace(/\s*[-–—:]+\s*$/, '')
    .trim();
}

/**
 * Builds the binary jsPDF document for the given proposal record.
 * Rigorously budgeted with dynamic multi-page flow and clean typography.
 */
export async function createProposalJsPdf(proposal: ProposalRecord): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  // Modern corporate color palette
  const primaryColor: [number, number, number] = [91, 77, 183]; // #5B4DB7 Deep Indigo
  const darkTextColor: [number, number, number] = [15, 23, 42]; // #0F172A Slate 900
  const slateTextColor: [number, number, number] = [71, 85, 105]; // #475569 Slate 600
  const lightCardBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const borderColor: [number, number, number] = [226, 232, 240]; // #E2E8F0
  const lavenderBadgeBg: [number, number, number] = [241, 239, 253]; // #F1EFFD
  const lavenderBorder: [number, number, number] = [221, 214, 254]; // #DDD6FE

  let currentY = 11;

  // Helper to add a new page with top accent
  const ensureSpace = (requiredMm: number) => {
    if (currentY + requiredMm > pageHeight - 16) {
      doc.addPage();
      currentY = 11;
      doc.setFillColor(...primaryColor);
      doc.rect(margin, currentY, contentWidth, 1.8, 'F');
      currentY += 5;
    }
  };

  // --- Top Decorative Accent Line ---
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 2, 'F');
  currentY += 5;

  // --- Header Area: Logo + Company Info (Left) and Quotation Badge (Right) ---
  const headerStartY = currentY;

  // Resolve and render company logo with exact natural aspect ratio preservation
  const logoDataUrl = await resolveCompanyLogo();
  let textStartX = margin;
  if (logoDataUrl) {
    try {
      const imgProps = doc.getImageProperties(logoDataUrl);
      const naturalRatio = (imgProps.width || 240) / (imgProps.height || 140);
      const targetH = 13; // 13mm height
      let targetW = targetH * naturalRatio;
      if (targetW > 28) targetW = 28; // Max cap
      doc.addImage(logoDataUrl, 'PNG', margin, currentY + 0.5, targetW, targetH, undefined, 'FAST');
      textStartX = margin + targetW + 4;
    } catch {
      textStartX = margin;
    }
  }

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(...darkTextColor);
  doc.text('TechnoKraft', textStartX, currentY + 4.5);

  const brandWidth = doc.getTextWidth('TechnoKraft');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('Services LLP', textStartX + brandWidth + 2.5, currentY + 4.5);

  // Clean Company Contact Info & Address (No GSTIN / No tagline)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...slateTextColor);
  doc.text(
    `${COMPANY_INFO.website} | ${COMPANY_INFO.email} | Tel: ${COMPANY_INFO.phone}`,
    textStartX,
    currentY + 8.8
  );
  doc.text(COMPANY_INFO.address, textStartX, currentY + 12.8);

  // Right Side: Quotation Badge & Issue Date
  const proposalCode = proposal.proposalCode || 'PR-2026-9182';
  const issueDate = proposal.sentDate || proposal.createdDate || new Date().toISOString().slice(0, 10);
  const commercialOwner = proposal.ownerName || 'Commercial Engagement Lead';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('COMMERCIAL QUOTATION', pageWidth - margin, currentY + 2.5, { align: 'right' });

  // Badge Box for Proposal Code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  const badgeWidth = doc.getTextWidth(proposalCode) + 8;
  const badgeHeight = 5.8;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = currentY + 4.5;

  doc.setFillColor(...lavenderBadgeBg);
  doc.setDrawColor(...lavenderBorder);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.2, 1.2, 'FD');
  doc.setTextColor(...primaryColor);
  doc.text(proposalCode, badgeX + 4, badgeY + 4.2);

  // Issue date under badge (No Valid Until)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateTextColor);
  doc.text(`Issue Date: ${issueDate}`, pageWidth - margin, currentY + 14, { align: 'right' });

  currentY = Math.max(currentY + 16, headerStartY + 16);

  // Divider Line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // --- Client & Engagement Scope Grid (2-Column Card Box) ---
  const colWidth = (contentWidth - 5) / 2;
  const infoCardHeight = 24;
  const rightColX = margin + colWidth + 5;

  // Left Card: Prepared For (Client)
  doc.setFillColor(...lightCardBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, colWidth, infoCardHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('QUOTATION PREPARED FOR (CLIENT DETAILS)', margin + 3.5, currentY + 4.5);

  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  const clientCompany = proposal.companyName || 'Valued Client';
  doc.text(clientCompany, margin + 3.5, currentY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateTextColor);
  doc.text(`Attention: ${proposal.contactName || 'Primary Contact'}`, margin + 3.5, currentY + 14);

  let clientSubY = currentY + 18;
  if (proposal.contactEmail) {
    doc.text(`Email: ${proposal.contactEmail}`, margin + 3.5, clientSubY);
    clientSubY += 3.8;
  }
  if (proposal.leadCode && clientSubY <= currentY + 22.5) {
    doc.text(`Lead Ref: ${proposal.leadCode}`, margin + 3.5, clientSubY);
  }

  // Right Card: Engagement & Scope
  doc.setFillColor(...lightCardBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(rightColX, currentY, colWidth, infoCardHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('COMMERCIAL PROJECT SCOPE', rightColX + 3.5, currentY + 4.5);

  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  const oppNameLines = doc.splitTextToSize(proposal.opportunityName || 'Custom Technology Solution', colWidth - 7);
  doc.text(oppNameLines[0] || '', rightColX + 3.5, currentY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateTextColor);
  doc.text(`Domain: ${proposal.service || 'Technology Consulting'}`, rightColX + 3.5, currentY + 14);
  doc.text(
    `Timeline: ${proposal.timelineDescription || '12-14 Weeks'} | Owner: ${proposal.ownerName || 'Commercial Team'}`,
    rightColX + 3.5,
    currentY + 18
  );

  currentY += infoCardHeight + 4.5;

  // --- Section 1: Solution Scope / Executive Summary Callout Box ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('1. EXECUTIVE PROJECT SCOPE & ARCHITECTURAL OVERVIEW', margin, currentY);
  currentY += 2.6;

  const rawSummary =
    proposal.summary ||
    `Commercial quotation and technical scope package for ${proposal.opportunityName || proposal.companyName}. Deliverables are structured as progressive development and testing milestones to assure robust architecture, high security, and seamless deployment.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const splitSummary = doc.splitTextToSize(rawSummary, contentWidth - 8);
  const calloutHeight = Math.min(18, Math.max(10, splitSummary.length * 3.5 + 3.5));

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth, calloutHeight, 1.5, 1.5, 'FD');

  // Accent vertical left pill on callout
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, 1.5, calloutHeight, 'F');

  doc.setTextColor(...darkTextColor);
  doc.text(splitSummary.slice(0, 3), margin + 4, currentY + 4);

  currentY += calloutHeight + 4.5;

  // --- Section 2: Commercial Deliverables & Milestone Schedule Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('2. COMMERCIAL DELIVERABLES & MILESTONE SCHEDULE', margin, currentY);
  currentY += 2;

  const milestones = resolveMilestones(proposal);
  const resolvedHosting = resolveHostingSection(proposal);
  const hostingEnabled = Boolean(resolvedHosting);
  const hostingSubtotal = resolvedHosting ? resolvedHosting.subtotal : 0;
  const resolvedServices = resolveServicesSection(proposal);
  const servicesEnabled = Boolean(resolvedServices);
  const servicesSubtotal = resolvedServices ? resolvedServices.subtotal : 0;
  const devAmount = proposal.amount || 0;
  const grandTotal = devAmount + hostingSubtotal + servicesSubtotal;

  const tableBody = milestones.map((m, idx) => [
    `${idx + 1}`,
    m.title,
    `Phase ${idx + 1} (${m.percentage}%)`,
    `INR ${m.amount.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Deliverable / Milestone Scope Description', 'Milestone Schedule', 'Net Amount (INR)']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: darkTextColor,
      cellPadding: 2.2,
      lineColor: borderColor,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9, fontStyle: 'bold', textColor: slateTextColor },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 34 },
      3: { halign: 'right', fontStyle: 'bold', cellWidth: 38 },
    },
  });

  // @ts-expect-error lastAutoTable is injected by jspdf-autotable
  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 4 : currentY + 32;

  // --- Section 3: Cloud Infrastructure & Hosting (Optional) ---
  if (hostingEnabled && resolvedHosting?.items) {
    ensureSpace(32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('3. CLOUD INFRASTRUCTURE & HOSTING (AWS EC2 / SERVERS / DOMAIN)', margin, currentY);
    currentY += 2;

    const hostingTableBody = resolvedHosting.items.map((item, idx) => [
      `${idx + 1}`,
      item.notes ? `${item.description}\n(${item.notes})` : item.description,
      item.provider || 'AWS',
      item.billingCycle || 'monthly',
      `INR ${item.unitCost.toLocaleString('en-IN')}`,
      `${item.quantity}`,
      `INR ${item.totalCost.toLocaleString('en-IN')}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Cloud Resource / Infrastructure Description', 'Provider', 'Cycle', 'Unit Rate', 'Qty', 'Total (INR)']],
      body: hostingTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.2,
        halign: 'left',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: darkTextColor,
        cellPadding: 2,
        lineColor: borderColor,
        lineWidth: 0.15,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8, fontStyle: 'bold', textColor: slateTextColor },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 26 },
        5: { halign: 'center', cellWidth: 14 },
        6: { halign: 'right', fontStyle: 'bold', cellWidth: 28 },
      },
    });

    // @ts-expect-error lastAutoTable is injected by jspdf-autotable
    currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 4 : currentY + 25;
  }

  // --- Section 4: Managed Services & AMC (Optional) ---
  if (servicesEnabled && resolvedServices?.items) {
    ensureSpace(32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('4. MANAGED SERVICES & ANNUAL MAINTENANCE (AMC / SLA)', margin, currentY);
    currentY += 2;

    const servicesTableBody = resolvedServices.items.map((item, idx) => [
      `${idx + 1}`,
      item.notes ? `${item.description}\n(${item.notes})` : item.description,
      item.billingCycle || 'monthly',
      `INR ${item.unitCost.toLocaleString('en-IN')}`,
      `${item.quantity}`,
      `INR ${item.totalCost.toLocaleString('en-IN')}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Support & Maintenance Scope Description', 'Billing Cycle', 'Unit Rate', 'Qty', 'Total (INR)']],
      body: servicesTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.2,
        halign: 'left',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: darkTextColor,
        cellPadding: 2,
        lineColor: borderColor,
        lineWidth: 0.15,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8, fontStyle: 'bold', textColor: slateTextColor },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 28 },
        3: { halign: 'right', cellWidth: 28 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'right', fontStyle: 'bold', cellWidth: 32 },
      },
    });

    // @ts-expect-error lastAutoTable is injected by jspdf-autotable
    currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 4 : currentY + 25;
  }

  // Ensure enough room for Terms + Summary Box (32mm)
  ensureSpace(34);

  // --- Commercial Terms (Left) & Quotation Summary Card (Right) Side-by-Side ---
  const termsBoxWidth = 104;
  const summaryBoxWidth = contentWidth - termsBoxWidth - 4;
  const summaryBoxX = margin + termsBoxWidth + 4;
  const lowerBoxHeight = 31;

  // Left Box: Commercial Terms & Engagement Conditions
  doc.setFillColor(...lightCardBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, termsBoxWidth, lowerBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('COMMERCIAL TERMS & ENGAGEMENT CONDITIONS', margin + 3.5, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.7);
  doc.setTextColor(...slateTextColor);

  const termLines = [
    `1. Fixed Scope: Pricing corresponds strictly to agreed deliverables & server specs.`,
    `2. Milestone Sign-off: Invoices are settled upon client review and acceptance.`,
    hostingEnabled
      ? `3. Cloud Server: AWS EC2 and domain charges are billed per resource usage schedule.`
      : `3. Hosting & Domain: Cloud hosting / domain infrastructure billed per actuals if required.`,
    `4. Intellectual Property: 100% IP rights and source code transferred upon final handover.`,
    `5. Quality Warranty: Includes 30-day post-launch technical warranty and bug resolution.`,
  ];

  let termY = currentY + 8.5;
  termLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, termsBoxWidth - 7);
    doc.text(wrapped[0], margin + 3.5, termY);
    termY += 4.2;
  });

  // Right Box: Commercial Quotation Summary (No GST taxes)
  doc.setFillColor(...lightCardBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxWidth, lowerBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('COMMERCIAL QUOTATION SUMMARY', summaryBoxX + 3.5, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...slateTextColor);

  // Breakdown lines
  let sumY = currentY + 9;
  doc.text('Development Milestones:', summaryBoxX + 3.5, sumY);
  doc.text(`INR ${devAmount.toLocaleString('en-IN')}`, summaryBoxX + summaryBoxWidth - 3.5, sumY, { align: 'right' });
  sumY += 3.6;

  if (hostingEnabled) {
    doc.text('Cloud Hosting (AWS):', summaryBoxX + 3.5, sumY);
    doc.text(`INR ${hostingSubtotal.toLocaleString('en-IN')}`, summaryBoxX + summaryBoxWidth - 3.5, sumY, { align: 'right' });
    sumY += 3.6;
  }

  if (servicesEnabled) {
    doc.text('Managed Services / AMC:', summaryBoxX + 3.5, sumY);
    doc.text(`INR ${servicesSubtotal.toLocaleString('en-IN')}`, summaryBoxX + summaryBoxWidth - 3.5, sumY, { align: 'right' });
    sumY += 3.6;
  }

  // Highlight Box for Total Commercial Value
  const totalRowY = currentY + 18.5;
  const totalRowH = 10;
  doc.setFillColor(...lavenderBadgeBg);
  doc.setDrawColor(...lavenderBorder);
  doc.roundedRect(summaryBoxX + 2, totalRowY, summaryBoxWidth - 4, totalRowH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL COMMERCIAL VALUE:', summaryBoxX + 4, totalRowY + 4);

  doc.setFontSize(8.8);
  doc.text(`INR ${grandTotal.toLocaleString('en-IN')}`, summaryBoxX + 4, totalRowY + 8);

  currentY += lowerBoxHeight + 4.5;

  // Ensure room for Acceptance box (23mm)
  ensureSpace(25);

  // --- Section: Acceptance & Sign-off Block (Dual Columns - No Authorized Signatory) ---
  const signSectionHeight = 22;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth, signSectionHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('PROPOSAL ACCEPTANCE & SIGN-OFF CONFIRMATION', margin + 3.5, currentY + 4);

  const signColWidth = (contentWidth - 14) / 2;

  // Column 1: For TechnoKraft Services LLP
  const sign1X = margin + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...darkTextColor);
  doc.text(`For ${COMPANY_INFO.name}`, sign1X, currentY + 8.5);

  doc.setDrawColor(148, 163, 184); // #94A3B8 dashed line
  doc.setLineDashPattern([1, 1], 0);
  doc.line(sign1X, currentY + 16, sign1X + signColWidth, currentY + 16);
  doc.setLineDashPattern([], 0); // reset dash

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...slateTextColor);
  doc.text(commercialOwner, sign1X, currentY + 19.5);

  // Column 2: Accepted & Confirmed by Client
  const sign2X = margin + 4 + signColWidth + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...darkTextColor);
  doc.text(`Accepted & Confirmed by: ${clientCompany}`, sign2X, currentY + 8.5);

  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(sign2X, currentY + 16, sign2X + signColWidth, currentY + 16);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...slateTextColor);
  doc.text(proposal.contactName || 'Client Representative', sign2X, currentY + 19.5);

  // --- Footers across all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 7;
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Commercial Quotation • ${COMPANY_INFO.name} • Ref: ${proposalCode}`,
      margin,
      footerY
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  return doc;
}

/**
 * Generates and downloads the binary PDF using jsPDF.
 */
export async function generateProposalPDF(proposal: ProposalRecord): Promise<void> {
  const doc = await createProposalJsPdf(proposal);
  const proposalCode = proposal.proposalCode || 'PR-0000';
  const clientCompany = proposal.companyName || 'Valued Client';
  const cleanComp = clientCompany.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Quotation_${proposalCode}_${cleanComp}.pdf`;
  doc.save(filename);
}

/**
 * Generates the proposal PDF and returns base64 string, dataUri and file details for email dispatch.
 */
export async function generateProposalPdfBase64(proposal: ProposalRecord): Promise<{
  base64: string;
  dataUri: string;
  fileName: string;
  fileSizeFormatted: string;
}> {
  const doc = await createProposalJsPdf(proposal);
  const proposalCode = proposal.proposalCode || 'PR-0000';
  const clientCompany = proposal.companyName || 'Valued Client';
  const cleanComp = clientCompany.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Quotation_${proposalCode}_${cleanComp}.pdf`;

  const dataUri = doc.output('datauristring');
  const base64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
  const byteLength = (base64.length * 3) / 4;
  const kb = Math.round(byteLength / 1024);
  const fileSizeFormatted = `${kb > 0 ? kb : 60} KB`;

  return { base64, dataUri, fileName, fileSizeFormatted };
}
