// ids must match what the Go backend expects
export type OperationId = 'add' | 'subtract' | 'multiply' | 'divide' | 'sqrt';

export interface Operation {
  id: OperationId; // what we send to the API
  label: string; // button text
  name: string; // accessible name / tooltip
  unary: boolean; // only needs one number (like sqrt)
}

export const OPERATIONS: Operation[] = [
  { id: 'add', label: '+', name: 'Sumar', unary: false },
  { id: 'subtract', label: '−', name: 'Restar', unary: false },
  { id: 'multiply', label: '×', name: 'Multiplicar', unary: false },
  { id: 'divide', label: '÷', name: 'Dividir', unary: false },
  { id: 'sqrt', label: '√', name: 'Raíz cuadrada', unary: true },
];

export function findOperation(id: string): Operation | undefined {
  return OPERATIONS.find((op) => op.id === id);
}
