import type { OperationId } from '../utils/operations';

// same shape as the Ans struct in the Go backend
interface CalculationResponse {
  result?: number;
  error?: string;
}

// all the backend calls live here, so the component doesn't deal with fetch
// VITE_API_URL can be set for production, otherwise we use the dev proxy
const API_URL: string = import.meta.env.VITE_API_URL || '/api/calculate';

export async function calculate(operation: OperationId, a: number, b: number): Promise<number> {
  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, a, b }),
    });
  } catch {
    // fetch only fails like this when the server is down or unreachable
    throw new Error('No se pudo conectar con el servidor');
  }

  // if the body isn't valid JSON just use an empty object
  const data: CalculationResponse = await response.json().catch(() => ({}));

  // backend sends { error: "..." } when something goes wrong
  if (!response.ok || data.error) {
    throw new Error(data.error || `Error del servidor (${response.status})`);
  }

  return data.result ?? 0;
}
