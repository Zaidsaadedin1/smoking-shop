import { NextResponse } from 'next/server';

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status }
  );
}

export function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}

export function optionalString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function requirePositiveInteger(value: unknown, field: string) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }

  return value;
}

export function requireNumber(value: unknown, field: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${field} must be a valid number`);
  }

  return value;
}
