export class NotFoundError extends Error {
    constructor() {
        super('Recurso no encontrado')
    }
}