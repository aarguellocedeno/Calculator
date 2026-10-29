import { findOperation } from './operations';

// true if the string is a real number (not empty, not "abc")
function isValidNumber(value: string): boolean {
  return value.trim() !== '' && Number.isFinite(Number(value));
}

// checks the input before calling the backend
// returns an error message, or null if everything is ok
export function validateInput(operationId: string, a: string, b: string): string | null {
  const operation = findOperation(operationId);
  if (!operation) return 'Selecciona una operación';

  if (!isValidNumber(a)) return 'Ingresa un número válido en el primer campo';

  // sqrt only uses the first number
  if (operation.unary) {
    if (Number(a) < 0) return 'No se puede sacar raíz de un número negativo';
    return null;
  }

  if (!isValidNumber(b)) return 'Ingresa un número válido en el segundo campo';
  if (operationId === 'divide' && Number(b) === 0) return 'No se puede dividir por 0';

  return null;
}
