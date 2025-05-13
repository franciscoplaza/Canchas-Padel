// frontend/src/services/reservaService.ts
export async function obtenerReservasUsuario(usuarioId: string) {
  const response = await fetch(`http://localhost:3000/reserva/mias?usuarioId=${usuarioId}`);
  if (!response.ok) {
    throw new Error('Error al obtener las reservas');
  }
  const data = await response.json();
  console.log('Datos recibidos:', data);  // Verificación de datos recibidos
  return data;
}
