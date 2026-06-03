/**
 * mailer.js — NextOwner transactional email utility
 *
 * Uses Nodemailer + Gmail SMTP (App Password).
 * If MAIL_PASS is not set the module degrades gracefully:
 *   sendMail() logs to console instead of throwing, so the
 *   rest of the application continues to work.
 *
 * All mail appears as:
 *   NextOwner Support <nishchalkc370@gmail.com>
 */

const nodemailer = require('nodemailer')

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'nishchalkc370@gmail.com'
const SUPPORT_NAME  = process.env.SUPPORT_NAME  || 'NextOwner Support'
const FROM          = `"${SUPPORT_NAME}" <${SUPPORT_EMAIL}>`

/* ── Create transport (lazy — only if credentials present) ── */
function createTransport() {
  const user = process.env.MAIL_USER || SUPPORT_EMAIL
  const pass = process.env.MAIL_PASS

  if (!pass) {
    console.warn('[mailer] MAIL_PASS not set — email sending is disabled.')
    return null
  }

  return nodemailer.createTransport({
    host:   process.env.MAIL_HOST || 'smtp.gmail.com',
    port:   Number(process.env.MAIL_PORT) || 587,
    secure: false,           // STARTTLS on port 587
    auth:   { user, pass },
    tls:    { rejectUnauthorized: false },
  })
}

let _transport = null
function getTransport() {
  if (!_transport) _transport = createTransport()
  return _transport
}

/* ── Core send function ── */
async function sendMail({ to, subject, html, text }) {
  const transport = getTransport()
  if (!transport) {
    console.log(`[mailer] Would send "${subject}" to ${to}`)
    return { skipped: true }
  }
  return transport.sendMail({ from: FROM, to, subject, html, text })
}

/* ────────────────────────────────────────────────────────────
   Template helpers
   ──────────────────────────────────────────────────────────── */

/* Shared HTML wrapper */
function wrap(body) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
           background:#09090b; color:#e4e4e7; margin:0; padding:0; }
    .wrapper { max-width:560px; margin:32px auto; padding:0 16px; }
    .card { background:#18181b; border:1px solid rgba(255,255,255,0.08);
            border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#f97316,#7c6af7);
               padding:24px 28px; }
    .header h1 { margin:0; color:#fff; font-size:20px; font-weight:800; }
    .body  { padding:28px; }
    .body p { margin:0 0 14px; font-size:14px; line-height:1.6; color:#a1a1aa; }
    .body strong { color:#e4e4e7; }
    .cta { display:inline-block; margin-top:8px; padding:12px 24px;
           background:linear-gradient(135deg,#f97316,#ea580c);
           color:#fff !important; text-decoration:none;
           border-radius:10px; font-size:13px; font-weight:700; }
    .footer { padding:16px 28px; border-top:1px solid rgba(255,255,255,0.06); }
    .footer p { margin:0; font-size:11px; color:#52525b; }
    .footer a { color:#71717a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header"><h1>NextOwner</h1></div>
      <div class="body">${body}</div>
      <div class="footer">
        <p>NextOwner Support · <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p style="margin-top:4px">This email was sent by NextOwner. Do not reply if you did not expect it.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

/* ── Welcome email ── */
async function sendWelcome({ to, name }) {
  return sendMail({
    to,
    subject: 'Welcome to NextOwner 🎉',
    html: wrap(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to <strong>NextOwner</strong> — India's campus marketplace for students!</p>
      <p>You can now browse listings, list items for free, and chat directly with buyers and sellers on your campus.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta">Explore NextOwner</a>
      <p style="margin-top:20px">Need help? Just reply to this email or visit our <a href="${process.env.CLIENT_URL}/help" style="color:#fb923c">Support Centre</a>.</p>
    `),
    text: `Hi ${name}, welcome to NextOwner! Visit ${process.env.CLIENT_URL} to get started.`,
  })
}

/* ── Password reset email ── */
async function sendPasswordReset({ to, name, resetUrl }) {
  return sendMail({
    to,
    subject: 'Reset your NextOwner password',
    html: wrap(`
      <p>Hi <strong>${name || 'there'}</strong>,</p>
      <p>We received a request to reset your NextOwner password. Click the button below to choose a new one.</p>
      <a href="${resetUrl}" class="cta">Reset Password</a>
      <p style="margin-top:20px;font-size:12px;color:#52525b">
        This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.
      </p>
    `),
    text: `Reset your NextOwner password: ${resetUrl}`,
  })
}

/* ── Account suspended email ── */
async function sendSuspensionNotice({ to, name, reason }) {
  return sendMail({
    to,
    subject: 'Your NextOwner account has been suspended',
    html: wrap(`
      <p>Hi <strong>${name || 'there'}</strong>,</p>
      <p>Your NextOwner account has been suspended${reason ? ` for the following reason: <strong>${reason}</strong>` : ' due to a violation of our community guidelines'}.</p>
      <p>If you believe this is a mistake, please appeal by replying to this email or contacting us at:</p>
      <a href="mailto:${SUPPORT_EMAIL}?subject=Account Appeal" class="cta">Appeal Suspension</a>
      <p style="margin-top:20px;font-size:12px;color:#52525b">
        NextOwner Support · ${SUPPORT_EMAIL}
      </p>
    `),
    text: `Your NextOwner account has been suspended. To appeal, email ${SUPPORT_EMAIL}.`,
  })
}

/* ── Verification approved ── */
async function sendVerificationApproved({ to, name }) {
  return sendMail({
    to,
    subject: '✅ Student Verification Approved — NextOwner',
    html: wrap(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your student verification has been <strong>approved</strong>! You now have a verified badge on your profile — buyers can see you're a real student.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" class="cta">View Your Profile</a>
    `),
    text: `Hi ${name}, your NextOwner student verification has been approved!`,
  })
}

/* ── OTP email ── */
async function sendOtp({ to, name, otp }) {
  return sendMail({
    to,
    subject: `${otp} — Your NextOwner Verification Code`,
    html: wrap(`
      <p>Hi <strong>${name || 'there'}</strong>,</p>
      <p>Use the 6-digit code below to verify your student email on NextOwner.</p>
      <div style="margin:24px 0;text-align:center">
        <div style="display:inline-block;background:rgba(249,115,22,0.12);border:2px solid rgba(249,115,22,0.40);
                    border-radius:16px;padding:18px 32px;">
          <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#fb923c;font-family:monospace">
            ${otp}
          </span>
        </div>
      </div>
      <p style="font-size:12px;color:#52525b">⏱️ This code expires in <strong style="color:#e4e4e7">10 minutes</strong>.</p>
      <p style="font-size:12px;color:#52525b">If you didn't request this, you can safely ignore this email.</p>
    `),
    text: `Your NextOwner student email verification code is: ${otp}. Expires in 10 minutes.`,
  })
}

/* ── Verification submitted (user confirmation) ── */
async function sendVerificationSubmitted({ to, name, university }) {
  return sendMail({
    to,
    subject: 'Verification Submitted — NextOwner',
    html: wrap(`
      <p>Hi <strong>${name || 'there'}</strong>,</p>
      <p>Your student verification request has been received. Here's a summary:</p>
      <div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.18);border-radius:12px;padding:16px;margin:16px 0">
        <p style="margin:0 0 6px"><span style="color:#34d399">✓</span> <strong>Email Verified</strong></p>
        <p style="margin:0 0 6px"><span style="color:#34d399">✓</span> <strong>Student ID Uploaded</strong></p>
        ${university ? `<p style="margin:0 0 6px"><span style="color:#34d399">✓</span> <strong>University:</strong> ${university}</p>` : ''}
        <p style="margin:0"><span style="color:#facc15">⏳</span> <strong>Admin Review:</strong> Pending (within 24 hours)</p>
      </div>
      <p>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#fb923c">${SUPPORT_EMAIL}</a></p>
    `),
    text: `Hi ${name}, your NextOwner verification has been submitted. We'll review your student ID within 24 hours.`,
  })
}

/* ── Admin alert — new verification request ── */
async function sendAdminVerificationAlert({ userName, studentEmail, university, country, adminUrl }) {
  const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
  return sendMail({
    to: SUPPORT_EMAIL,
    subject: 'New Student Verification Request — NextOwner',
    html: wrap(`
      <p><strong>A new student verification request requires your review.</strong></p>
      <div style="background:rgba(124,106,247,0.07);border:1px solid rgba(124,106,247,0.20);border-radius:12px;padding:16px;margin:16px 0;font-size:13px">
        <p style="margin:0 0 8px"><span style="color:#a79cf9">👤 Name:</span> <strong>${userName}</strong></p>
        <p style="margin:0 0 8px"><span style="color:#a79cf9">📧 Official Email:</span> <strong>${studentEmail}</strong></p>
        <p style="margin:0 0 8px"><span style="color:#a79cf9">🎓 University:</span> <strong>${university || '—'}</strong></p>
        ${country ? `<p style="margin:0 0 8px"><span style="color:#a79cf9">🌍 Country:</span> <strong>${country}</strong></p>` : ''}
        <p style="margin:0 0 8px"><span style="color:#34d399">✓ Official Email Verified:</span> <strong>YES</strong></p>
        <p style="margin:0"><span style="color:#a79cf9">🕐 Submitted At:</span> <strong>${ts} IST</strong></p>
      </div>
      <p>Student ID has been uploaded and is ready for review.</p>
      <a href="${adminUrl}" class="cta">Open Admin Dashboard →</a>
    `),
    text: `New verification: ${userName} | ${studentEmail} | ${university} | ${ts}. Review at ${adminUrl}`,
  })
}

/* ── Bug / support report acknowledgement ── */
async function sendSupportAck({ to, name, subject: issueSubject }) {
  return sendMail({
    to,
    subject: `We got your message — NextOwner Support`,
    html: wrap(`
      <p>Hi <strong>${name || 'there'}</strong>,</p>
      <p>Thanks for reaching out! We've received your message about: <strong>${issueSubject || 'your issue'}</strong></p>
      <p>Our team typically replies within <strong>24 hours</strong> (Mon–Fri, 9 AM – 8 PM IST).</p>
      <p>You can also reach us directly at any time:</p>
      <a href="mailto:${SUPPORT_EMAIL}" class="cta">${SUPPORT_EMAIL}</a>
    `),
    text: `Hi ${name}, we received your message "${issueSubject}". We'll reply within 24 hours. — NextOwner Support`,
  })
}

module.exports = {
  SUPPORT_EMAIL,
  FROM,
  sendMail,
  sendWelcome,
  sendPasswordReset,
  sendSuspensionNotice,
  sendVerificationApproved,
  sendOtp,
  sendVerificationSubmitted,
  sendAdminVerificationAlert,
  sendSupportAck,
}
