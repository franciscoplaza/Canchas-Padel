import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReservas, IReserva } from '../services/reservaService';
import './AdminReservas.css';

const AdminReservas: React.FC = () => {
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioString = localStorage.getItem('usuario');

    if (!token || !usuarioString) {
      navigate('/login');
      return;
    }

    const usuarioActual = JSON.parse(usuarioString);
    
    // Usamos 'rol' para que coincida con tu localStorage
    if (usuarioActual.rol !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllReservas(token);
        data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setReservas(data);
      } catch (err: any) {
        setError(err.message || 'No se pudieron cargar las reservas.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="admin-reservas-container"><p>Cargando reservas...</p></div>;
  }
  if (error) {
    return <div className="admin-reservas-container error-message">{error}</div>;
  }

  return (
    <div className="admin-reservas-container">
      <h1>Gestión de Reservas</h1>
      <p>Visualice todas las reservas del sistema y el estado de los recordatorios.</p>

      <div className="table-container">
        <table className="reservas-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Cancha</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Recordatorio Enviado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length > 0 ? (
              reservas.map((reserva) => (
                <tr key={reserva._id}>
                  {/* Usamos los campos correctos: id_usuario.nombreUsuario */}
                  <td>{reserva.id_usuario?.nombreUsuario || 'N/A'}</td>
                  <td>{reserva.id_usuario?.correo || 'N/A'}</td>
                  <td>{reserva.id_cancha}</td>
                  {/* Usamos los campos separados fecha y hora */}
                  <td>{new Date(reserva.fecha).toLocaleDateString('es-CL')}</td>
                  <td>{reserva.hora}</td>
                  <td className={reserva.reminderSent ? 'status-sent' : 'status-pending'}>
                    {reserva.reminderSent ? 'Enviado' : 'Pendiente'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No se encontraron reservas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReservas;