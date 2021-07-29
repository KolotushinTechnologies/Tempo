const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendResetPasswordEmailCode(to, code) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Восстановление пароля в Tempo TM",
      text: "",
      html: `
        <div>
          <h1>Для восстановления пароля в Tempo введите данный код</h1>
          <h3>${code}</h3>
        </div>
      `,
    });
  }
}

module.exports = new MailService();
