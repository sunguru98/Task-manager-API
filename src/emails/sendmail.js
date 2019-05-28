const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
sgMail.send({
  to: 'webdevdesign@sundeepcharan.com',
  from: 'webdevdesign@sundeepcharan.com',
  subject: 'Test email through sendgrid',
  text: 'Hey there. Is this working ?'
})