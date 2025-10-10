export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Talkalot!</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #EAEAEA; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0F2027;">
  
  <div style="background: linear-gradient(135deg, #203A43, #2C5364); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
    <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg?t=st=1741295028~exp=1741298628~hmac=0d076f885d7095f0b5bc8d34136cd6d64749455f8cb5f29a924281bafc11b96c&w=1480" 
         alt="Messenger Logo" 
         style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: #1C1C1C; padding: 10px;">
    <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 500;">Bem-vindo ao Talkalot!</h1>
  </div>

  <div style="background-color: #1C1C1C; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
    <p style="font-size: 18px; color: #4CA1AF;"><strong>Olá ${name},</strong></p>
    <p style="color: #CFCFCF;">Estamos felizes em ter você junto com o Talkalot! O Talkalot conecta você com amigos, familiares e colegas em tempo real, não importa onde eles estejam.</p>
    
    <div style="background-color: #121212; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #2C5364;">
      <p style="font-size: 16px; margin: 0 0 15px 0; color: #EAEAEA;"><strong>Comece em apenas alguns passos:</strong></p>
      <ul style="padding-left: 20px; margin: 0; color: #B0B0B0;">
        <li style="margin-bottom: 10px;">Configure sua foto de perfil</li>
        <li style="margin-bottom: 10px;">Encontre e adicione seus contatos</li>
        <li style="margin-bottom: 10px;">Inicie uma conversa</li>
        <li style="margin-bottom: 0;">Compartilhe fotos, vídeos e muito mais</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href=${clientURL} 
         style="background: linear-gradient(135deg, #203A43, #2C5364); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 500; display: inline-block; transition: 0.3s;">
         Abrir Talkalot
      </a>
    </div>
    
    <p style="margin-bottom: 5px; color: #B0B0B0;">Se precisar de ajuda ou tiver dúvidas, estamos sempre aqui para ajudar.</p>
    <p style="margin-top: 0; color: #B0B0B0;">Boas mensagens!</p>
    
    <p style="margin-top: 25px; margin-bottom: 0; color: #888;">Atenxiosamente,<br>Equipe Talkalot</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© 2025 Talkalot. Todos os Direitos Reservados.</p>
    <p>
      <a href="#" style="color: #4CA1AF; text-decoration: none; margin: 0 10px;">Política de Privacidade</a>
      <a href="#" style="color: #4CA1AF; text-decoration: none; margin: 0 10px;">Termos de Serviço</a>
      <a href="#" style="color: #4CA1AF; text-decoration: none; margin: 0 10px;">Contate-nos</a>
    </p>
  </div>

</body>
</html>
  `;
}