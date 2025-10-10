import {resendClient, sender} from "../lib/resend.js";
import {createWelcomeEmailTemplate} from "../emails/emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const {data, error} = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: 'Bem vindo ao Talkalot!',
    html: createWelcomeEmailTemplate(name, clientURL),
  })

  if (error) {
    console.error("Erro ao enviar e-mail de boas-vindas", error);
    throw new Error("Falha ao enviar e-mail de boas-vindas");
  }

  console.log("E-mail de boas-vindas enviado com sucesso:", data);
};