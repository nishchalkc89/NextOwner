const router = require('express').Router()
const { sendMail, sendSupportAck, SUPPORT_EMAIL } = require('../config/mailer')

/**
 * POST /api/support/contact
 * Accepts contact form submissions, sends ack to user and
 * forwards the message to the support inbox.
 */
router.post('/contact', async (req, res) => {
  const { name, email, subject, message, type } = req.body

  if (!email || !message) {
    return res.status(400).json({ message: 'Email and message are required.' })
  }

  try {
    // 1. Send acknowledgement to the person who submitted
    await sendSupportAck({ to: email, name: name || 'there', subject: subject || type || 'Support Request' }).catch(() => {})

    // 2. Forward full message to support inbox
    const issueType = type ? `[${type.toUpperCase()}] ` : ''
    const subjectLine = `${issueType}${subject || 'NextOwner Support Request'}`
    await sendMail({
      to:      SUPPORT_EMAIL,
      subject: `New Contact: ${subjectLine}`,
      html: `
        <p><strong>From:</strong> ${name || 'Anonymous'} &lt;${email}&gt;</p>
        <p><strong>Type:</strong> ${type || 'general'}</p>
        <p><strong>Subject:</strong> ${subject || '—'}</p>
        <hr/>
        <p style="white-space:pre-wrap">${message}</p>
      `,
      text: `From: ${name || 'Anonymous'} <${email}>\nType: ${type || 'general'}\nSubject: ${subject || '—'}\n\n${message}`,
    }).catch(() => {})

    res.json({ ok: true, message: 'Message received! We\'ll reply within 24 hours.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
