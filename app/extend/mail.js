'use strict'

const sgMail = require('@sendgrid/mail')

const mail = function() {
}

mail.sendMail = (ctx, to, token) => {
  sgMail.setApiKey(ctx.app.config.mail.sendgrid_apikey)
  const text = `Thank you for signing up a Drip account. Please click the following link to activate your account:. ${ctx.app.config.mail.sendgrid_server}/#/activate?token=${token}. \n Let's go and earn drops!`
  const msg = {
    to,
    from: ' noreply@drip.com',
    subject: 'Need your verification',
    text,
    html: `<strong>${text}</strong>`,
  }
  sgMail.send(msg)
}

module.exports = mail

