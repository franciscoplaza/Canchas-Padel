import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const HORARIOS_DISPONIBLES = [
    '09:00', '10:30', '12:00', // Mañana
    '14:00', '15:30', '17:00', '18:30', '20:00' // Tarde
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
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
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!canchaId || !fecha || !hora) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/reservas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_cancha: canchaId,
          fecha,
          hora_inicio: hora
        }),
      });

      if (!response.ok) {
        const errorData: { message?: string } = await response.json();
        throw new Error(errorData.message || 'Error al reservar');
      }

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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCanchaId(e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFecha(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label>Hora de inicio:</label>
          <select 
            value={hora}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHora(e.target.value)}
            required
          >
            <option value="">Seleccione un horario</option>
            {HORARIOS_DISPONIBLES.map(hora => (
              <option key={hora} value={hora}>{hora}</option>
            ))}
          </select>
        </div>

        <button type="submit">Reservar</button>
      </form>
    </div>
  );
};

export default CrearReserva;