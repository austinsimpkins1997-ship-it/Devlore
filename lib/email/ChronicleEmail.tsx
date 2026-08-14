/**
 * Chronicle Email — Plain HTML email template for weekly chapter notifications.
 *
 * We use plain HTML strings instead of @react-email to avoid the heavy
 * dependency (which was causing disk space issues in CI). Resend's SDK
 * accepts raw HTML directly.
 */

export interface ChronicleEmailProps {
  username: string;
  displayName: string;
  heroClass: string;
  heroTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterSummary: string;
  xpEarned: number;
  newCardsCount: number;
  dashboardUrl: string;
}

/**
 * Returns an HTML string for the weekly chronicle notification email.
 * Designed to render well across major email clients with inline styles only.
 */
export function renderChronicleEmail(props: ChronicleEmailProps): string {
  const {
    displayName,
    heroClass,
    heroTitle,
    chapterNumber,
    chapterTitle,
    chapterSummary,
    xpEarned,
    newCardsCount,
    dashboardUrl,
  } = props;

  const chapterNumStr = String(chapterNumber).padStart(2, '0');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chapter ${chapterNumStr}: ${chapterTitle} — DEVLORE</title>
</head>
<body style="margin:0;padding:0;background-color:#07070f;font-family:Georgia,serif;color:#e0e0e0;">

  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Chapter ${chapterNumStr} of your legend has been written: ${chapterTitle}
  </div>

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#0d0d1a;border:1px solid #c9a84c;border-radius:8px;max-width:600px;width:100%;">

          <!-- Gold top bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#c9a84c,#7d5a2d);height:4px;border-radius:8px 8px 0 0;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">D E V L O R E</p>
              <h1 style="margin:0;font-size:28px;color:#c9a84c;font-family:Georgia,serif;">A New Chapter Is Written</h1>
            </td>
          </tr>

          <!-- Chapter number badge -->
          <tr>
            <td style="padding:0 40px 20px;text-align:center;">
              <div style="display:inline-block;border:1px solid #c9a84c;border-radius:4px;padding:4px 16px;">
                <span style="font-size:12px;color:#c9a84c;letter-spacing:2px;">CHAPTER ${chapterNumStr}</span>
              </div>
            </td>
          </tr>

          <!-- Chapter title -->
          <tr>
            <td style="padding:0 40px 8px;text-align:center;">
              <h2 style="margin:0;font-size:22px;color:#e8d5a3;font-style:italic;">${chapterTitle}</h2>
            </td>
          </tr>

          <!-- Hero byline -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#888;">
                ${displayName} · ${heroClass} · <em>${heroTitle}</em>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid rgba(201,168,76,0.3);margin:0;" />
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:#c8c8c8;">${chapterSummary}</p>
            </td>
          </tr>

          <!-- Stats row -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:6px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0;font-size:28px;font-weight:bold;color:#c9a84c;">+${xpEarned}</p>
                    <p style="margin:4px 0 0;font-size:11px;letter-spacing:2px;color:#888;text-transform:uppercase;">XP Earned</p>
                  </td>
                  <td style="padding:20px;text-align:center;border-left:1px solid rgba(201,168,76,0.2);">
                    <p style="margin:0;font-size:28px;font-weight:bold;color:#c9a84c;">${newCardsCount}</p>
                    <p style="margin:4px 0 0;font-size:11px;letter-spacing:2px;color:#888;text-transform:uppercase;">Lore Cards</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${dashboardUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#7d5a2d);color:#07070f;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">
                Read Your Chapter →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
              <p style="margin:0;font-size:12px;color:#555;">
                You're receiving this because you have weekly chronicles enabled.<br/>
                <a href="${dashboardUrl}/settings" style="color:#888;text-decoration:underline;">Manage email preferences</a>
              </p>
            </td>
          </tr>

          <!-- Bottom gold bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#7d5a2d,#c9a84c);height:2px;border-radius:0 0 8px 8px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
