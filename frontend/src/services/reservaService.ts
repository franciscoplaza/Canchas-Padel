const API_URL = 'http://localhost:3000';

// --- Interfaces: La "plantilla" de cómo se ven los datos ---
export interface IUsuario {
  nombreUsuario: string;
  email: string;
  rol: string;
}

export interface IReserva {
  _id: string;
  id_cancha: string;
  fecha: string;
  hora: string;
  usuario?: IUsuario; // Usuario es opcional porque "mis reservas" no lo incluye
  reminderSent: boolean;
}

// --- Funciones del Servicio ---

export const crearReserva = async (token: string, datos: { id_cancha: string, fecha: string, hora_inicio: string }) => {
  const response = await fetch(`${API_URL}/reservas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al crear la reserva');
  }
  return await response.json();
};

export const getMisReservas = async (token: string): Promise<IReserva[]> => {
  const response = await fetch(`${API_URL}/reservas/mis-reservas`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Error al obtener tus reservas');
  return await response.json();
};

export const getAllReservas = async (token: string): Promise<IReserva[]> => {
  const response = await fetch(`${API_URL}/reservas/todas`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('No se pudieron cargar las reservas');
  return await response.json();
};

export const eliminarReserva = async (token: string, idReserva: string) => {
  const response = await fetch(`${API_URL}/reservas/${idReserva}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al eliminar la reserva');
  }
  return await response.json();
};