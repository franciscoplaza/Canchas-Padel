import  { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearReserva } from '../services/reservaService';
import './CrearReserva.css';

interface Cancha {
  _id: string;
  id_cancha: string;
  precio: number;
}

const CrearReserva = () => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [canchaId, setCanchaId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const HORARIOS_DISPONIBLES = [
    '09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'
  ];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCanchas = async () => {
      try {
        const response = await fetch('http://localhost:3000/cancha', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener canchas');
        }
        const data: Cancha[] = await response.json();
        setCanchas(data);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error desconocido al cargar canchas';
        alert(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCanchas();
  }, [navigate, token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!canchaId || !fecha || !hora || !token) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      // Usamos la función del servicio con los nombres de campos correctos
      await crearReserva(token, {
        id_cancha: canchaId,
        fecha,
        hora_inicio: hora
      });

      alert('Reserva creada exitosamente!');
      navigate('/mis-reservas');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error desconocido al crear reserva';
      alert(error);
    }
  };

  if (loading) return <div>Cargando canchas...</div>;

  return (
    <div className="crear-reserva-container">
      <h1>Nueva Reserva</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cancha:</label>
          <select 
            value={canchaId}
            onChange={(e) => setCanchaId(e.target.value)}
            required
          >
            <option value="">Seleccione una cancha</option>
            {canchas.map(cancha => (
              <option key={cancha._id} value={cancha.id_cancha}>
                Cancha {cancha.id_cancha.split('_')[1]} - ${cancha.precio}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label>Hora de inicio:</label>
          <select 
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          >
            <option value="">Seleccione un horario</option>
            {HORARIOS_DISPONIBLES.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <button type="submit">Reservar</button>
      </form>
    </div>
  );
};

export default CrearReserva;