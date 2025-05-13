import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_cancha: string;
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

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-reservas-container">
      <header className="user-header">
        <h1>Mis Reservas</h1>
        <p className="user-subtitle">Tus reservas activas</p>
      </header>

      <div className="reservas-list-container">
        <ul className="reservas-list">
          {reservas.map((reserva) => (
            <li key={reserva._id} className="reserva-item">
              <div className="reserva-info">
                <span className="reserva-label">Fecha:</span>
                <span>{new Date(reserva.fecha_hora).toLocaleString()}</span>
              </div>
              <div className="reserva-info">
                <span className="reserva-label">Cancha:</span>
                <span>{reserva.id_cancha}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MisReservas;