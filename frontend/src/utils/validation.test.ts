import { validateInput } from './validation';

// validation is plain TS, so these tests don't need React at all
describe('validateInput', () => {
  it('acepta números válidos', () => {
    expect(validateInput('add', '5', '3')).toBeNull();
    expect(validateInput('multiply', '-2.5', '4')).toBeNull();
  });

  it('rechaza campos vacíos o no numéricos', () => {
    expect(validateInput('add', '', '3')).toMatch(/primer campo/);
    expect(validateInput('add', 'abc', '3')).toMatch(/primer campo/);
    expect(validateInput('add', '5', '')).toMatch(/segundo campo/);
  });

  it('rechaza división por cero', () => {
    expect(validateInput('divide', '10', '0')).toMatch(/dividir por 0/);
  });

  // second number is ignored for sqrt
  it('raíz cuadrada no necesita segundo número', () => {
    expect(validateInput('sqrt', '9', '')).toBeNull();
  });

  it('rechaza raíz de número negativo', () => {
    expect(validateInput('sqrt', '-4', '')).toMatch(/negativo/);
  });

  it('rechaza operaciones desconocidas', () => {
    expect(validateInput('modulo', '1', '2')).toMatch(/operación/);
  });
});
