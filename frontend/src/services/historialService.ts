 const API_URL = 'http://localhost:3000';

export interface HistorialEntry {
  _id: string;
  usuario: {
    _id: string;
    nombre: string;
    apellido: string;
    correo: string;
  };
  tipoAccion: string;
  entidadAfectada: string;
  entidadId: string;
  detalles: Record<string, any>;
  createdAt: string;
}

export const getHistorial = async (): Promise<HistorialEntry[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No estás autenticado.');
  }

  const response = await fetch(`${API_URL}/historial`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el historial');
  }

  return response.json();
};
