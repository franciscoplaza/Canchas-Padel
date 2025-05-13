import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CanchaInfo {
  id_cancha: string;
}

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_cancha: string; // Solo necesitamos el ID directo
}

const MisReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchReservas = async () => {
      try {
        const response = await fetch('http://localhost:3000/reservas/mis-reservas', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Error al obtener reservas');
        const data = await response.json();
        setReservas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [navigate]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
  {reservas.map((reserva) => (
    <li key={reserva._id}>
      <p>Fecha: {new Date(reserva.fecha_hora).toLocaleString()}</p>
      <p>Cancha: {reserva.id_cancha}</p> {/* Muestra directamente el ID */}
    </li>
  ))}
</ul>
  );
};

export default MisReservas;