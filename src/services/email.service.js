import { createTransport } from "nodemailer";
import { emailPass, emailUser } from "../config/config.js";

class EmailService {
    #clienteNodemailer

    constructor(credencialesMail) {
        this.#clienteNodemailer = createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: credencialesMail
        });
    }
    async send(destinatario, mensaje) {
        const mailOptions = {
            from: 'Quien envía',
            to: destinatario,
            subjet: 'Asunto',
            text: mensaje,
        }
        try {
            const info = await this.#clienteNodemailer.sendMail(mailOptions)
            console.log(info)
            return info
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

export const emailService = new EmailService({
    user: emailUser,
    pass: emailPass
})