import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The sender address. For testing with Resend's free sandbox, 'onboarding@resend.dev' works out-of-the-box.
// In production, configure a verified domain like 'notifications@lumi.lk'.
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || "LUMI Marketplace <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

interface AdApprovedEmailProps {
  sellerName: string;
  sellerEmail: string;
  vehicleTitle: string;
  refId: string;
  priceLKR: number;
}

interface AdRejectedEmailProps {
  sellerName: string;
  sellerEmail: string;
  vehicleTitle: string;
  refId: string;
  rejectionReason: string;
}

/**
 * Sends a notification email to the seller when their advertisement is approved by an administrator.
 */
export async function sendAdApprovedEmail({
  sellerName,
  sellerEmail,
  vehicleTitle,
  refId,
  priceLKR,
}: AdApprovedEmailProps) {
  if (!resend) {
    console.warn(
      "⚠️ [Resend] RESEND_API_KEY is not configured in .env.local. Skipping approval email to:",
      sellerEmail
    );
    return { success: false, reason: "RESEND_API_KEY_NOT_CONFIGURED" };
  }

  if (!sellerEmail || !sellerEmail.includes("@")) {
    console.warn("⚠️ [Resend] Invalid or missing seller email:", sellerEmail);
    return { success: false, reason: "INVALID_EMAIL" };
  }

  try {
    const catalogUrl = `${APP_URL}/vehicles`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Advertisement is Live!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f5f7; color: #333333;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0d1117; padding: 28px 36px; text-align: center; border-bottom: 3px solid #0F52BA;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">
                LUMI AUTOMOTIVE
              </h1>
              <p style="color: #87CEEB; margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
                Sri Lanka's Verified Vehicle Marketplace
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <!-- Status Badge -->
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 6px 14px; margin-bottom: 18px;">
                <span style="color: #059669; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                  ✓ Listing Approved & Live
                </span>
              </div>

              <h2 style="color: #111827; margin: 0 0 12px; font-size: 20px; font-weight: 800;">
                Congratulations, ${sellerName}!
              </h2>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Your vehicle advertisement has been reviewed by our administration team and verified. It is now published live to thousands of active buyers across Sri Lanka.
              </p>

              <!-- Vehicle Spec Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">
                      Listing Reference ID
                    </p>
                    <p style="color: #0F52BA; font-family: monospace; font-size: 16px; font-weight: bold; margin: 0 0 14px;">
                      ${refId}
                    </p>

                    <p style="color: #0f172a; font-size: 17px; font-weight: 800; margin: 0 0 4px;">
                      ${vehicleTitle}
                    </p>
                    <p style="color: #16a34a; font-size: 16px; font-weight: 800; margin: 0;">
                      Listed Price: LKR ${priceLKR.toLocaleString()}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${catalogUrl}" target="_blank" style="display: inline-block; background-color: #0F52BA; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 14px 32px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase;">
                      Browse Vehicle in Catalog →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Tips Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 0 6px 6px 0;">
                <tr>
                  <td>
                    <p style="color: #0369a1; font-size: 13px; font-weight: bold; margin: 0 0 4px;">
                      Next Steps & Seller Tips:
                    </p>
                    <ul style="color: #334155; font-size: 13px; margin: 0; padding-left: 18px; line-height: 1.5;">
                      <li>Keep your phone reachable. Inquiries from verified buyers will arrive via phone calls or WhatsApp.</li>
                      <li>Never transfer vehicle ownership or accept cheques prior to bank clearance.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 36px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px;">
                This is an automated notification from LUMI Automotive Marketplace.
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} LUMI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: sellerEmail,
      subject: `Approved: Your vehicle listing "${vehicleTitle}" is now live!`,
      html: htmlContent,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("❌ [Resend] Failed to send approval email:", error);
    return { success: false, error: error?.message || error };
  }
}

/**
 * Sends a notification email to the seller when their advertisement is rejected, including the reason.
 */
export async function sendAdRejectedEmail({
  sellerName,
  sellerEmail,
  vehicleTitle,
  refId,
  rejectionReason,
}: AdRejectedEmailProps) {
  if (!resend) {
    console.warn(
      "⚠️ [Resend] RESEND_API_KEY is not configured in .env.local. Skipping rejection email to:",
      sellerEmail
    );
    return { success: false, reason: "RESEND_API_KEY_NOT_CONFIGURED" };
  }

  if (!sellerEmail || !sellerEmail.includes("@")) {
    return { success: false, reason: "INVALID_EMAIL" };
  }

  try {
    const postAdUrl = `${APP_URL}/post_advertisement`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Update Regarding Your Advertisement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f5f7; color: #333333;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color: #0d1117; padding: 28px 36px; text-align: center; border-bottom: 3px solid #C8102E;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">
                LUMI AUTOMOTIVE
              </h1>
              <p style="color: #fca5a5; margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
                Listing Moderation Notice
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 36px 28px;">
              <div style="display: inline-block; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 20px; padding: 6px 14px; margin-bottom: 18px;">
                <span style="color: #dc2626; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                  Listing Review Notice
                </span>
              </div>

              <h2 style="color: #111827; margin: 0 0 12px; font-size: 20px; font-weight: 800;">
                Hello ${sellerName},
              </h2>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                Thank you for submitting your vehicle to LUMI. During our verification review of <strong>${vehicleTitle}</strong> (Ref: ${refId}), our moderation team was unable to approve your listing.
              </p>

              <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
                <p style="color: #9f1239; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px;">
                  Reason Provided:
                </p>
                <p style="color: #111827; font-size: 14px; margin: 0; font-weight: 600;">
                  "${rejectionReason}"
                </p>
              </div>

              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                You are welcome to submit an updated advertisement with the required details or revised specifications.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${postAdUrl}" target="_blank" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 28px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase;">
                      Submit Revised Advertisement →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 36px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} LUMI Automotive Marketplace. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: sellerEmail,
      subject: `Update regarding your listing "${vehicleTitle}"`,
      html: htmlContent,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("❌ [Resend] Failed to send rejection email:", error);
    return { success: false, error: error?.message || error };
  }
}
