import type { Mock } from 'vitest';
import { calculate } from './calculatorApi';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

describe('calculate', () => {
  // fake fetch so we can test the API layer without a server
  // a fresh mock per test keeps them independent
  let fetchMock: Mock;
  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('envía la operación y devuelve el resultado', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { result: 2.5 }));

    await expect(calculate('divide', 10, 4)).resolves.toBe(2.5);

    // check the request body matches what the backend expects
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ operation: 'divide', a: 10, b: 4 });
  });

  it('lanza el mensaje de error del backend', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { result: 0, error: 'La división por 0 no es permitida' }));

    await expect(calculate('divide', 1, 0)).rejects.toThrow('La división por 0 no es permitida');
  });

  it('lanza un error genérico si la respuesta no es JSON', async () => {
    fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

    await expect(calculate('add', 1, 2)).rejects.toThrow('Error del servidor (500)');
  });

  it('lanza error de conexión si el servidor está apagado', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(calculate('add', 1, 2)).rejects.toThrow('No se pudo conectar con el servidor');
  });
});
