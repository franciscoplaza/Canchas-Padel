import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Usuario {
  nombreUsuario: string;
  correo: string;
  rol: string;
}

interface Cancha {
  id_cancha: string;
  precio: number;
}

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_usuario: Usuario;
  id_cancha: Cancha;
}

const AdminReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioString = localStorage.getItem('usuario');
    const usuario: Usuario = usuarioString ? JSON.parse(usuarioString) : { rol: '' };

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

        if (!response.ok) {
          throw new Error('No se pudieron obtener las reservas');
        }

        const data: Reserva[] = await response.json();
        setReservas(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error desconocido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [navigate]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Todas las Reservas</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Cancha</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva._id}>
              <td>{new Date(reserva.fecha_hora).toLocaleString()}</td>
              <td>{reserva.id_usuario.nombreUsuario}</td>
              <td>{reserva.id_usuario.correo}</td>
              <td>{reserva.id_cancha.id_cancha}</td>
              <td>${reserva.id_cancha.precio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReservas;