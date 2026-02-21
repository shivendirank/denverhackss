export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(400, "VALIDATION_ERROR", message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ToolSpecInvalidError extends AppError {
  constructor(message: string) {
    super(400, "TOOL_SPEC_INVALID", message);
    Object.setPrototypeOf(this, ToolSpecInvalidError.prototype);
  }
}

export class ToolNotFoundError extends AppError {
  constructor(toolId: string) {
    super(404, "TOOL_NOT_FOUND", `Tool ${toolId} not found`);
    Object.setPrototypeOf(this, ToolNotFoundError.prototype);
  }
}

export class AgentNotFoundError extends AppError {
  constructor(agentId: string) {
    super(404, "AGENT_NOT_FOUND", `Agent ${agentId} not found`);
    Object.setPrototypeOf(this, AgentNotFoundError.prototype);
  }
}

export class AgentAlreadyExistsError extends AppError {
  constructor(wallet: string) {
    super(409, "AGENT_ALREADY_EXISTS", `Agent for wallet ${wallet} already exists`);
    Object.setPrototypeOf(this, AgentAlreadyExistsError.prototype);
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(available: string, required: string) {
    super(402, "INSUFFICIENT_BALANCE", `Balance ${available} < required ${required}`);
    Object.setPrototypeOf(this, InsufficientBalanceError.prototype);
  }
}

export class SignatureVerificationError extends AppError {
  constructor(message: string) {
    super(401, "SIGNATURE_VERIFICATION_FAILED", message);
    Object.setPrototypeOf(this, SignatureVerificationError.prototype);
  }
}

export class UpstreamExecutionError extends AppError {
  constructor(
    statusCode: number,
    message: string,
    public readonly upstreamStatus?: number
  ) {
    super(statusCode, "UPSTREAM_EXECUTION_FAILED", message);
    Object.setPrototypeOf(this, UpstreamExecutionError.prototype);
  }
}

export class UCPNonceConflictError extends AppError {
  constructor(nonce: string) {
    super(409, "UCP_NONCE_CONFLICT", `UCP nonce ${nonce} already used`);
    Object.setPrototypeOf(this, UCPNonceConflictError.prototype);
  }
}

export class BlockchainError extends AppError {
  constructor(chain: string, message: string) {
    super(502, "BLOCKCHAIN_ERROR", `${chain} blockchain error: ${message}`);
    Object.setPrototypeOf(this, BlockchainError.prototype);
  }
}

export class HederaError extends AppError {
  constructor(message: string) {
    super(502, "HEDERA_ERROR", `Hedera error: ${message}`);
    Object.setPrototypeOf(this, HederaError.prototype);
  }
}

export class X402PaymentError extends AppError {
  constructor(message: string) {
    super(402, "X402_PAYMENT_REQUIRED", message);
    Object.setPrototypeOf(this, X402PaymentError.prototype);
  }
}

export class ZGStorageError extends AppError {
  constructor(message: string) {
    super(502, "ZG_STORAGE_ERROR", message);
    Object.setPrototypeOf(this, ZGStorageError.prototype);
  }
}
