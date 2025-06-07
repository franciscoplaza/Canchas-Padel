// La URL base de tu backend
const API_URL = 'http://localhost:3000';

// --- Interfaces para definir la forma de los datos ---
// Estas interfaces nos ayudan a evitar errores en TypeScript

interface IUsuario {
  _id: string;
  nombre: string;
  email: string;
  role: string;
}

export interface IReserva {
  _id: string;
  id_cancha: string;
  fecha: string;
  hora: string;
  id_usuario: IUsuario; // El usuario viene como un objeto dentro de la reserva
  reminderSent: boolean; // El nuevo campo que nos interesa
}


// --- Funciones del Servicio ---

// Tu función original (la dejamos como está)
export async function obtenerReservasUsuario(usuarioId: string) {
  const response = await fetch(`${API_URL}/reserva/mias?usuarioId=${usuarioId}`);
  if (!response.ok) {
    throw new Error('Error al obtener las reservas');
  }
  const data = await response.json();
  console.log('Datos recibidos:', data);
  return data;
}

// 👇 AÑADE ESTA NUEVA FUNCIÓN (es la que usará el admin) 👇
export const getAllReservas = async (token: string): Promise<IReserva[]> => {
  try {
    // El endpoint correcto para obtener TODAS las reservas es /reserva
    const response = await fetch(`${API_URL}/reserva`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener todas las reservas');
    }
    // Le decimos a TypeScript que la respuesta tendrá la forma de un array de IReserva
    const data: IReserva[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllReservas:', error);
    throw error;
  }
};