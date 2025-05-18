import { useState } from 'react';
import axios from 'axios';

const Reservar = () => {
  const [usuarioId, setUsuarioId] = useState('');
  const [canchaId, setCanchaId] = useState('');
  const [fechaHoraInicio, setFechaHoraInicio] = useState('');
  const [duracionHoras, setDuracionHoras] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/reserva', {
        usuarioId,
        canchaId,
        fechaHoraInicio,
        duracionHoras,
      });
      alert('✅ Reserva creada con éxito');
    } catch (error: any) {
      alert('❌ Error al crear reserva: ' + error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reservar Cancha</h2>

      <input
        type="text"
        placeholder="ID del Usuario"
        value={usuarioId}
        onChange={(e) => setUsuarioId(e.target.value)}
      />
      <br />

      <input
        type="text"
        placeholder="ID de la Cancha"
        value={canchaId}
        onChange={(e) => setCanchaId(e.target.value)}
      />
      <br />

      <input
        type="datetime-local"
        value={fechaHoraInicio}
        onChange={(e) => setFechaHoraInicio(e.target.value)}
      />
      <br />

      <input
        type="number"
        min={1}
        value={duracionHoras}
        onChange={(e) => setDuracionHoras(Number(e.target.value))}
      />
      <br />

      <button type="submit">Reservar</button>
    </form>
  );
};

export default Reservar;
