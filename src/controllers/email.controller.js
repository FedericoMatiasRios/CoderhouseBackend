import { emailService } from "../services/email.service.js";

export function handleGetMail (req, res, next) {
    console.log(req.body)
    res.render('email');
}
export async function handlePostMail (req, res, next) {
    const { destinatario, mensaje } = req.body

    try {
        const info = await emailService.send(destinatario, mensaje)
        console.log(info)
    } catch (error) {
        console.log(error)
    }

    res.send('Mensaje enviado!')
}