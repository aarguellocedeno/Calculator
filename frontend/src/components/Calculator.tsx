import { useState, type FormEvent } from 'react';
import { calculate } from '../api/calculatorApi';
import { OPERATIONS, findOperation, type OperationId } from '../utils/operations';
import { validateInput } from '../utils/validation';

export default function Calculator() {
  // inputs are kept as strings so the user can type freely ("-", "2.", etc)
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [operation, setOperation] = useState<OperationId>('add');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // sqrt only needs one number, so we hide the second input
  const isUnary = findOperation(operation)?.unary ?? false;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);

    // validate first so we don't call the backend with bad data
    const validationError = validateInput(operation, a, b);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const value = await calculate(operation, Number(a), isUnary ? 0 : Number(b));
      setResult(value);
    } catch (err) {
      // could be a backend error or the server being down
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  // reset everything except the selected operation
  function handleClear() {
    setA('');
    setB('');
    setResult(null);
    setError('');
  }

  return (
    <main className="calculator">
      <h1>Calculadora</h1>

      <form onSubmit={handleSubmit} noValidate>
        {/* first number */}
        <label htmlFor="a">{isUnary ? 'Número' : 'Primer número'}</label>
        <input
          id="a"
          type="text"
          inputMode="decimal" // shows the number keyboard on mobile
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="0"
        />

        {/* operation buttons, built from the OPERATIONS list */}
        <fieldset className="operations">
          <legend>Operación</legend>
          {OPERATIONS.map((op) => (
            <button
              key={op.id}
              type="button"
              title={op.name}
              aria-label={op.name}
              aria-pressed={operation === op.id}
              className={operation === op.id ? 'active' : ''}
              onClick={() => setOperation(op.id)}
            >
              {op.label}
            </button>
          ))}
        </fieldset>

        {/* second number, hidden for sqrt */}
        {!isUnary && (
          <>
            <label htmlFor="b">Segundo número</label>
            <input
              id="b"
              type="text"
              inputMode="decimal"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="0"
            />
          </>
        )}

        <div className="actions">
          <button type="button" className="secondary" onClick={handleClear}>
            Limpiar
          </button>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Calculando…' : 'Calcular'}
          </button>
        </div>
      </form>

      {/* aria-live so screen readers read the result/error when it shows up */}
      <div className="output" aria-live="polite">
        {error && <p className="error" role="alert">{error}</p>}
        {result !== null && (
          <p className="result">
            Resultado: <strong data-testid="result">{result}</strong>
          </p>
        )}
      </div>
    </main>
  );
}
