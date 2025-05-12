// src/components/ReservasAdmin.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_cancha: {
    id_cancha: string;
    precio: number;
  };
  id_usuario: {
    nombre: string;
    email: string;
  };
}

export const ReservasAdmin = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReservas = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No hay token, inicia sesión.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:3000/reservas/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReservas(res.data);
      } catch (err) {
        console.error('Error al obtener reservas:', err);
        setError('No se pudieron cargar las reservas.');
      } finally {
        setLoading(false);
      }
    };

  }, []);

  if (loading) return <p>Cargando reservas...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Reservas del Sistema (Admin)</h2>
      <ul>
        {reservas.map((reserva) => (
          <li key={reserva._id}>
            <strong>Usuario:</strong> {reserva.id_usuario.nombre} ({reserva.id_usuario.email})<br />
            <strong>Cancha:</strong> {reserva.id_cancha.id_cancha} <br />
            <strong>Precio:</strong> ${reserva.id_cancha.precio} <br />
            <strong>Fecha:</strong> {new Date(reserva.fecha_hora).toLocaleString()}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};
