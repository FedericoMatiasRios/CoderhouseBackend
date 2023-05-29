import { emailService } from "../services/email.service.js";

export function handleGetMail (req, res, next) {
    req.logger.info(req.body)
    res.render('email');
}
export async function handlePostMail (req, res, next) {
    const { destinatario, mensaje } = req.body

    try {
        const info = await emailService.send(destinatario, mensaje)
        req.logger.info(info)
    } catch (error) {
        req.logger.error(error)
    }

    res.send('Mensaje enviado!')
}