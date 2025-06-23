// frontend/src/services/reservaService.ts
  const API_URL = 'http://localhost:3000';
export async function obtenerReservasUsuario(usuarioId: string) {
  const response = await fetch(`http://localhost:3000/reserva/mias?usuarioId=${usuarioId}`);
  if (!response.ok) {
    throw new Error('Error al obtener las reservas');
  }
  const data = await response.json();
  console.log('Datos recibidos:', data);  // Verificación de datos recibidos
  return data;
}
 // --- FUNCIÓN NUEVA AÑADIDA PARA CANCELAR RESERVAS ---
export async function cancelarReserva(reservaId: string) {
  const token = localStorage.getItem('token');
  if (!token) {
    // Si no hay token, no se puede continuar.
    throw new Error('No estás autenticado para realizar esta acción.');
  }

  const response = await fetch(`${API_URL}/reservas/${reservaId}/cancelar`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // Si la respuesta del backend no es exitosa (ej. error 400, 403)
  if (!response.ok) {
    // Intentamos leer el mensaje de error que envía el backend
    const errorData = await response.json();
    // Lanzamos un error con el mensaje específico del backend (ej. "No se puede cancelar con menos de 7 días")
    throw new Error(errorData.message || 'No se pudo cancelar la reserva.');
  }

  // Si la cancelación es exitosa, devolvemos el mensaje del backend.
  return response.json();
}