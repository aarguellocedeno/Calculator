import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from './Calculator';
import { calculate } from '../api/calculatorApi';

// mock the API so the tests run without the Go server
vi.mock('../api/calculatorApi', () => ({ calculate: vi.fn() }));
const calculateMock = vi.mocked(calculate);

describe('Calculator', () => {
  // reset the mock between tests
  beforeEach(() => vi.clearAllMocks());

  it('muestra el resultado que devuelve el backend', async () => {
    calculateMock.mockResolvedValue(8);
    render(<Calculator />);

    await userEvent.type(screen.getByLabelText('Primer número'), '5');
    await userEvent.type(screen.getByLabelText('Segundo número'), '3');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    // check we sent the right data and the result shows up
    expect(calculateMock).toHaveBeenCalledWith('add', 5, 3);
    expect(await screen.findByTestId('result')).toHaveTextContent('8');
  });

  it('muestra error de validación sin llamar al backend', async () => {
    render(<Calculator />);

    // submit with empty inputs
    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/número válido/);
    expect(calculateMock).not.toHaveBeenCalled();
  });

  it('oculta el segundo campo para raíz cuadrada', async () => {
    calculateMock.mockResolvedValue(3);
    render(<Calculator />);

    await userEvent.click(screen.getByRole('button', { name: 'Raíz cuadrada' }));
    expect(screen.queryByLabelText('Segundo número')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Número'), '9');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    expect(calculateMock).toHaveBeenCalledWith('sqrt', 9, 0);
    expect(await screen.findByTestId('result')).toHaveTextContent('3');
  });

  it('muestra el error que devuelve el backend', async () => {
    // simulate the server being down
    calculateMock.mockRejectedValue(new Error('No se pudo conectar con el servidor'));
    render(<Calculator />);

    await userEvent.type(screen.getByLabelText('Primer número'), '1');
    await userEvent.type(screen.getByLabelText('Segundo número'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
  });

  it('el botón Limpiar borra los campos y el resultado', async () => {
    calculateMock.mockResolvedValue(3);
    render(<Calculator />);

    await userEvent.type(screen.getByLabelText('Primer número'), '1');
    await userEvent.type(screen.getByLabelText('Segundo número'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }));
    await screen.findByTestId('result');

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(screen.getByLabelText('Primer número')).toHaveValue('');
    expect(screen.queryByTestId('result')).not.toBeInTheDocument();
  });
});
