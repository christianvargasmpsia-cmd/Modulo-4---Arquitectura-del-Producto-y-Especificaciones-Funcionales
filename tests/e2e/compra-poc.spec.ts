import { test, expect } from '@playwright/test';

test('cliente compra dos poleras y ve su pedido confirmado por Bs 100', async ({ page }) => {
  await page.goto('/umss_ecommerce.html');

  // Cada navegación inicializa el catálogo en memoria y el contexto es nuevo.
  // Esta compra y sus pagos se crean mediante la interfaz en esta ejecución.
  const carrito = page.getByTestId('carrito');
  const pedidos = page.getByTestId('pedidos-cliente');
  await expect(carrito).toHaveText('Tu carrito está vacío');
  await expect(pedidos.getByRole('heading', { name: /^Pedido / })).toHaveCount(0);

  const producto = page.getByRole('group', { name: 'Polera UMSS', exact: true });
  await producto.getByLabel('Cantidad de Polera UMSS', { exact: true }).fill('2');
  await producto.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(carrito).toContainText('Polera UMSS');
  await expect(carrito).toContainText('2x Bs 50 = Bs 100');
  await expect(page.getByTestId('total-carrito')).toContainText('Bs 100');

  await page.getByLabel('Monto a Pagar (Bs):', { exact: true }).fill('100');
  await page.getByRole('button', { name: '💳 Pagar', exact: true }).click();

  await expect(pedidos.getByRole('heading', { name: /^Pedido / })).toHaveCount(1);
  await expect(pedidos.getByText('Productos: 2x Polera UMSS', { exact: true })).toBeVisible();
  await expect(pedidos.getByText('Total: Bs 100', { exact: true })).toBeVisible();
  await expect(pedidos.getByText('CONFIRMADO', { exact: true })).toBeVisible();
  await expect(carrito).toHaveText('Tu carrito está vacío');
});
