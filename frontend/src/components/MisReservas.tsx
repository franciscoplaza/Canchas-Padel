// frontend/src/components/MisReservas.tsx
import { useEffect, useState } from 'react';
import { obtenerReservasUsuario } from '../services/reservaService';
import './MisReservas.css';  // Si el archivo CSS está en la misma carpeta

type Reserva = {
  _id: string;
  fecha_hora: string;
  id_cancha: {
    id_cancha: string;
    precio: number;
  };
};

type Props = {
  usuarioId: string;
};

const MisReservas = ({ usuarioId }: Props) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);

  useEffect(() => {
    const cargarReservas = async () => {
      try {
        const data = await obtenerReservasUsuario(usuarioId);
        setReservas(data);
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      }
    };

    if (usuarioId) cargarReservas();
  }, [usuarioId]);

  return (
    <div className="reservas-container">
      <h2>Mis Reservas</h2>
      {reservas.length === 0 ? (
        <p>No tienes reservas.</p>
      ) : (
        <div className="reservas-list">
          {reservas.map((reserva, index) => (
            <div key={reserva._id} className="reserva-card">
              <p><strong>Reserva {index + 1}:</strong></p>
              <p><strong>Fecha:</strong> {new Date(reserva.fecha_hora).toLocaleString()}</p>
              <p><strong>Cancha:</strong> {reserva.id_cancha.id_cancha}</p>
              <p><strong>Precio:</strong> ${reserva.id_cancha.precio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReservas;
