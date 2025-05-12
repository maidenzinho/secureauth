const CryptoUtil = require('../utils/crypto');
const { sendEmail } = require('./email.service');
const User = require('../models/User');

class RecoveryService {
  static async initiateRecovery(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Usuário não encontrado");

    const token = CryptoUtil.hash(`${email}-${Date.now()}`);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    user.recoveryToken = token;
    user.recoveryExpires = expiresAt;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Recuperação de Senha - SecureAuth",
      html: `Clique <a href="${process.env.CLIENT_URL}/recover?token=${token}">aqui</a> para redefinir sua senha.`
    });

    return { message: "Email de recuperação enviado" };
  }

  static async completeRecovery(token, newPassword) {
    const user = await User.findOne({ 
      recoveryToken: token,
      recoveryExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error("Token inválido ou expirado");

    user.password = newPassword;
    user.recoveryToken = undefined;
    user.recoveryExpires = undefined;
    await user.save();

    return { message: "Senha redefinida com sucesso" };
  }
}

module.exports = RecoveryService;