import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminReservas.css';
interface UsuarioInfo {
  nombreUsuario: string;
}

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_cancha: string;
  usuario: UsuarioInfo;
}

const AdminReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!token || usuario.rol !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchReservas = async () => {
      try {
        const response = await fetch('http://localhost:3000/reservas/todas', {
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
    <div className="admin-reservas-container">
      <header className="admin-header">
        <h1>Sistema de Reservas</h1>
        <p className="admin-subtitle">Panel de administración</p>
      </header>
      
      <div className="reservas-content">
        <h2>Todas las reservas</h2>
        <table className="reservas-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Usuario</th>
              <th>Cancha</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva._id}>
                <td>{new Date(reserva.fecha_hora).toLocaleString()}</td>
                <td>{reserva.usuario.nombreUsuario}</td>
                <td>{reserva.id_cancha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReservas;