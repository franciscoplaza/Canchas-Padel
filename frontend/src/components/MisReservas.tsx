import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos las funciones y tipos correctos
import { getMisReservas, eliminarReserva, IReserva } from '../services/reservaService';
import './MisReservas.css';

const MisReservas: React.FC = () => {
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Función para cargar las reservas, la podemos reutilizar
  const fetchReservas = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const data = await getMisReservas(token);
      data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setReservas(data);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar tus reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  const handleEliminar = async (idReserva: string) => {
    if (!token) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      return;
    }
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      try {
        await eliminarReserva(token, idReserva);
        alert('Reserva eliminada exitosamente.');
        // Actualizamos el estado para remover la reserva de la lista sin recargar
        setReservas(prevReservas => prevReservas.filter(r => r._id !== idReserva));
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar la reserva');
      }
    }
  };
  
  if (loading) return <div className="mis-reservas-container"><p>Cargando tus reservas...</p></div>;
  if (error) return <div className="mis-reservas-container"><div className="error-container">{error}</div></div>;

  return (
    <div className="mis-reservas-container">
      <h1 className="user-title">Mis Reservas</h1>
      {reservas.length === 0 ? (
        <div className="no-reservas">
          <h2>No tienes reservas activas</h2>
          <button className="primary-btn" onClick={() => navigate("/reservar-cancha")}>
            Hacer una reserva
          </button>
        </div>
      ) : (
        <div className="reservas-list-container">
          {reservas.map((reserva) => (
            <div key={reserva._id} className="reserva-card">
              <div className="reserva-header">
                <h3>Cancha {reserva.id_cancha.replace(/\D/g, "")}</h3>
              </div>
              <div className="reserva-details">
                {/* Corregido para usar los campos separados de la interfaz */}
                <p><strong>Fecha:</strong> {new Date(reserva.fecha).toLocaleDateString('es-CL')}</p>
                <p><strong>Hora:</strong> {reserva.hora}</p>
              </div>
              <div className="reserva-actions">
                <button onClick={() => handleEliminar(reserva._id)} className="action-btn delete-btn">
                  Cancelar Reserva
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReservas;