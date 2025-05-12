// src/components/MisReservas.tsx
import { useEffect, useState } from 'react';
import { obtenerReservasUsuario } from '../services/reservaService'; 
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
        console.log('Reservas cargadas:', data);  // Verificación de datos recibidos
        setReservas(data);
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      }
    };

    if (usuarioId) cargarReservas();
  }, [usuarioId]);

  return (
    <div>
      <h2>Mis Reservas</h2>
      {reservas.length === 0 ? (
        <p>No tienes reservas.</p>
      ) : (
        <ul>
          {reservas.map((reserva) => (
            <li key={reserva._id}>
              <strong>Fecha:</strong> {new Date(reserva.fecha_hora).toLocaleString()} <br />
              <strong>Cancha:</strong> {reserva.id_cancha.id_cancha} - ${reserva.id_cancha.precio}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisReservas;
