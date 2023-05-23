export class NotFoundError extends Error {
    constructor() {
        super('recurso no encontrado')
    }
}