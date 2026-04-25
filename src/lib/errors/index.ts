// ============================================================
// Custom Error Classes — Tratamento estruturado de erros
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly type: string;

  constructor(message: string, statusCode: number, type: string) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 400 — Dados inválidos enviados pelo cliente
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

// 401 — Não autenticado
export class UnauthorizedError extends AppError {
  constructor(message = "Acesso não autorizado. Faça login para continuar.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

// 403 — Autenticado mas sem permissão
export class ForbiddenError extends AppError {
  constructor(message = "Você não tem permissão para acessar este recurso.") {
    super(message, 403, "FORBIDDEN");
  }
}

// 404 — Recurso não encontrado
export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} não encontrado.`, 404, "NOT_FOUND");
  }
}

// 409 — Conflito (ex: email já cadastrado)
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}
