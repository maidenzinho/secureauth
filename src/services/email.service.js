const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

module.exports = {
  sendEmail: async ({ to, subject, text, html }) => {
    try {
      const info = await transporter.sendMail({
        from: `"SecureAuth" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html
      });
      
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      return false;
    }
  },

  sendVerificationEmail: async (email, token) => {
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verifique seu email</h2>
        <p>Por favor, clique no botão abaixo para verificar seu endereço de email:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          Verificar Email
        </a>
        <p>Se você não criou uma conta, por favor ignore este email.</p>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject: 'Verificação de Email - SecureAuth',
      text: `Por favor, acesse este link para verificar seu email: ${verificationUrl}`,
      html
    });
  }
};