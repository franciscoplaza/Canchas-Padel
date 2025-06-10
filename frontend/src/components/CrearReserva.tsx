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
  const [saldo, setSaldo] = useState<number>(0);
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

    const fetchCanchasYSaldo = async () => {
      try {
        const [canchasRes, saldoRes] = await Promise.all([
          fetch('http://localhost:3000/cancha', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/saldo', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!canchasRes.ok) throw new Error('Error al obtener canchas');
        if (!saldoRes.ok) throw new Error('Error al obtener saldo');

        const canchasData = await canchasRes.json();
        const saldoData = await saldoRes.json();

        setCanchas(canchasData);
        setSaldo(saldoData.saldo);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error desconocido al cargar datos';
        alert(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCanchasYSaldo();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!canchaId || !fecha || !hora) {
      alert('Por favor complete todos los campos');
      return;
    }

    const canchaSeleccionada = canchas.find(c => c.id_cancha === canchaId);
    if (!canchaSeleccionada) {
      alert('Cancha no encontrada');
      return;
    }

    if (saldo < canchaSeleccionada.precio) {
      alert('Saldo insuficiente. Por favor cargue saldo antes de reservar.');
      navigate('/saldo');
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

  if (loading) return <div>Cargando canchas y saldo...</div>;

  return (
    <div className="crear-reserva-container">
      <h1>Nueva Reserva</h1>
      <div className="saldo-info">
        <p>Saldo disponible: <span className="saldo-monto">${saldo.toLocaleString()}</span></p>
      </div>
      
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