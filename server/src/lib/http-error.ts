export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Datos inválidos', details?: unknown) {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = 'No autorizado') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'Acceso denegado') {
    return new HttpError(403, message);
  }

  static notFound(message = 'No encontrado') {
    return new HttpError(404, message);
  }

  static conflict(message = 'Conflicto con el estado actual') {
    return new HttpError(409, message);
  }
}
