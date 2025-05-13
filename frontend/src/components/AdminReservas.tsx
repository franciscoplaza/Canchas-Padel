import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UsuarioInfo {
  nombreUsuario: string;
  correo: string;
}

interface CanchaInfo {
  id_cancha: string;
}

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_cancha: string;
  usuario: {
    nombreUsuario: string;
  };
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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
        <table>
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
            <td>{reserva.id_cancha}</td> {/* Muestra directamente el ID de cancha */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminReservas;