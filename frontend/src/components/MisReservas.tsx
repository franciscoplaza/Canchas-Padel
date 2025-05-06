// src/components/MisReservas.tsx
import { useEffect, useState } from 'react';

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_cancha: {
    id_cancha: string;
    precio: number;
  };
}

export const MisReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const usuarioId = 'id-del-usuario'; // Reemplaza por lógica real
  const token = localStorage.getItem('token'); // Simulación

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/reserva/usuario/${usuarioId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setReservas(data);
      } catch (error) {
        console.error('Error cargando reservas', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [usuarioId]);

  if (loading) return <p>Cargando reservas...</p>;

  return (
    <div>
      <h2>Mis Reservas</h2>
      <ul>
        {reservas.map((reserva) => (
          <li key={reserva._id}>
            <strong>Cancha:</strong> {reserva.id_cancha.id_cancha} <br />
            <strong>Precio:</strong> ${reserva.id_cancha.precio} <br />
            <strong>Fecha:</strong> {new Date(reserva.fecha_hora).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};
