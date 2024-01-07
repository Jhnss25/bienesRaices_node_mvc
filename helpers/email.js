import nodemailer from 'nodemailer';

// Este sirve para cuando al usuario se le olvide el password
const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos;

    // Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        // asunto
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}</p>

            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a>
            </p>

            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    });
}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos;

    // Enviar email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Restablece tu Password en BienesRaices.com',
        text: 'Restablece tu Password en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, has solicitado restablecer tu Password en bienesRaices.com</p>

            <p>Sigue el siguiente enlace para generar un password nuevo:
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer Password</a>
            </p>

            <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje</p>
        `
    })

}

export {
    emailRegistro,
    emailOlvidePassword
}