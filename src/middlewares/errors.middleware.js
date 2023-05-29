import { InvalidArgumentError } from "../services/InvalidArgumentError.service.js";
import { NotFoundError } from "../services/NotFoundError.service.js";
import { descripciones, errors } from "../services/errors.service.js";

export function errorHandlerMiddleware(err, req, res, next) {
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: descripciones[errors.ERROR_NOT_FOUND] });
    } else if (err instanceof InvalidArgumentError) {
        return res.status(400).json({ error: descripciones[errors.ERROR_INVALID_ARGUMENT] });
    }
    return res.status(500).json({ error: 'Error desconocido' });
}