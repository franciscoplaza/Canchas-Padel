// frontend/src/components/CrearReserva.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrearReserva.css';

interface Cancha {
  capacidad_maxima: number;
  _id: string;
  id_cancha: string;
  precio: number;
}

interface Equipamiento {
  _id: string;
  id_equipamiento: string;
  tipo: string;
  nombre: string;
  costo: number;
}

const CrearReserva = () => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [equipamientos, setEquipamientos] = useState<Equipamiento[]>([]);
  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [canchaId, setCanchaId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saldo, setSaldo] = useState<number>(0);
  const [showEquipamientoModal, setShowEquipamientoModal] = useState<boolean>(false);
  const [equipamientoSeleccionado, setEquipamientoSeleccionado] = useState<{[key: string]: number}>({});
  const navigate = useNavigate();
  const [filtroEquipamiento, setFiltroEquipamiento] = useState("");

  const HORARIOS_DISPONIBLES = [
    '09:00', '10:30', '12:00',
    '14:00', '15:30', '17:00', '18:30', '20:00'
  ];

  const [acompanantes, setAcompanantes] = useState<any[]>([]);
  const [showAcompanantesModal, setShowAcompanantesModal] = useState(false);
  const [nuevoAcompanante, setNuevoAcompanante] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    edad: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [canchasRes, equipamientosRes, saldoRes] = await Promise.all([
          fetch('http://localhost:3000/cancha', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/equipamiento', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/saldo', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!canchasRes.ok) throw new Error('Error al obtener canchas');
        if (!equipamientosRes.ok) throw new Error('Error al obtener equipamiento');
        if (!saldoRes.ok) throw new Error('Error al obtener saldo');

        const canchasData = await canchasRes.json();
        const equipamientosData = await equipamientosRes.json();
        const saldoData = await saldoRes.json();

        setCanchas(canchasData);
        setEquipamientos(equipamientosData);
        setSaldo(saldoData.saldo);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error desconocido al cargar datos';
        alert(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleEquipamientoChange = (id: string, cantidad: number) => {
    setEquipamientoSeleccionado(prev => ({
      ...prev,
      [id]: cantidad
    }));
  };

  const calcularTotalEquipamiento = () => {
    return Object.entries(equipamientoSeleccionado).reduce((total, [id, cantidad]) => {
      const equip = equipamientos.find(e => e._id === id);
      return total + (equip ? equip.costo * cantidad : 0);
    }, 0);
  };

  
  const agregarAcompanante = () => {
    if (!nuevoAcompanante.nombres || !nuevoAcompanante.apellidos || 
        !nuevoAcompanante.rut || !nuevoAcompanante.edad) {
      alert('Por favor complete todos los campos del acompañante');
      return;
    }

    setAcompanantes([...acompanantes, nuevoAcompanante]);
    setNuevoAcompanante({
      nombres: '',
      apellidos: '',
      rut: '',
      edad: ''
    });
  };

  const eliminarAcompanante = (index: number) => {
    setAcompanantes(acompanantes.filter((_, i) => i !== index));
  };

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

    if (acompanantes.length > canchaSeleccionada.capacidad_maxima - 1) {
      alert(`Esta cancha tiene capacidad para ${canchaSeleccionada.capacidad_maxima} personas (incluyéndote). 
             Has seleccionado ${acompanantes.length} acompañantes, lo que excede el límite.`);
      return;
    }

    const totalEquipamiento = calcularTotalEquipamiento();
    const totalReserva = canchaSeleccionada.precio + totalEquipamiento;

    if (saldo < totalReserva) {
      alert(`Saldo insuficiente. Necesitas $${totalReserva.toLocaleString()} (Cancha: $${canchaSeleccionada.precio.toLocaleString()} + Equipamiento: $${totalEquipamiento.toLocaleString()}). Por favor cargue saldo antes de reservar.`);
      navigate('/saldo');
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmar reserva?\n\nCancha: $${canchaSeleccionada.precio.toLocaleString()}\nEquipamiento: $${totalEquipamiento.toLocaleString()}\nTotal: $${totalReserva.toLocaleString()}`
    );

    if (!confirmar) return;

    const fechaISO = new Date(`${fecha}T${hora}:00`).toISOString();

    try {
      const response = await fetch('http://localhost:3000/reservas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_cancha: canchaId,
          fecha: fechaISO,
          hora_inicio: hora,
          equipamiento: equipamientoSeleccionado,
          acompanantes
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

  if (loading) return <div>Cargando datos...</div>;

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

        <div className="buttons-group">
          <button 
            type="button" 
            className="equipamiento-btn"
            onClick={() => setShowEquipamientoModal(true)}
          >
            Agregar Equipamiento
          </button>

          <button 
            type="button" 
            className="acompanantes-btn"
            onClick={() => setShowAcompanantesModal(true)}
          >
            Agregar Acompañantes ({acompanantes.length})
          </button>
        </div>

        <button type="submit" className="reservar-btn">Reservar</button>
      </form>

      {showEquipamientoModal && (
      <div className="modal-overlay">
        <div className="equipamiento-modal">
          <h2>Seleccionar Equipamiento</h2>

          {/* Barra de búsqueda */}
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={filtroEquipamiento}
            onChange={(e) => setFiltroEquipamiento(e.target.value)}
            style={{ marginBottom: "10px", width: "100%", padding: "5px" }}
          />

          <table>
            <thead>
              <tr>
                <th>Equipamiento</th>
                <th>Tipo</th>
                <th>Costo Unitario</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {equipamientos
                .filter(equip =>
                  equip.nombre.toLowerCase().includes(filtroEquipamiento.toLowerCase()) ||
                  (equip.tipo && equip.tipo.toLowerCase().includes(filtroEquipamiento.toLowerCase()))
                )
                .map(equip => (
                  <tr key={equip._id}>
                    <td>{equip.nombre}</td>
                    <td>{equip.tipo}</td>
                    <td>${equip.costo.toLocaleString()}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={equipamientoSeleccionado[equip._id] || 0}
                        onChange={(e) => handleEquipamientoChange(equip._id, parseInt(e.target.value) || 0)}
                      />
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          <div className="modal-total">
            Total Equipamiento: ${calcularTotalEquipamiento().toLocaleString()}
          </div>
          <div className="modal-actions">
            <button onClick={() => setShowEquipamientoModal(false)}>Cerrar</button>
          </div>
        </div>
      </div>
    )}


      {showAcompanantesModal && (
        <div className="modal-overlay">
          <div className="acompanantes-modal">
            <h2>Agregar Acompañantes</h2>
            
            <div className="acompanantes-form">
              <div className="form-group">
                <label>Nombres:</label>
                <input
                  type="text"
                  value={nuevoAcompanante.nombres}
                  onChange={(e) => setNuevoAcompanante({...nuevoAcompanante, nombres: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Apellidos:</label>
                <input
                  type="text"
                  value={nuevoAcompanante.apellidos}
                  onChange={(e) => setNuevoAcompanante({...nuevoAcompanante, apellidos: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>RUT:</label>
                <input
                  type="text"
                  value={nuevoAcompanante.rut}
                  onChange={(e) => setNuevoAcompanante({...nuevoAcompanante, rut: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Edad:</label>
                <input
                  type="number"
                  value={nuevoAcompanante.edad}
                  onChange={(e) => setNuevoAcompanante({...nuevoAcompanante, edad: e.target.value})}
                />
              </div>
              
              <button 
                type="button" 
                className="agregar-btn"
                onClick={agregarAcompanante}
              >
                Agregar Acompañante
              </button>
            </div>
            
            <div className="acompanantes-list">
              <h3>Acompañantes agregados ({acompanantes.length})</h3>
              {acompanantes.length === 0 ? (
                <p>No hay acompañantes agregados</p>
              ) : (
                <ul>
                  {acompanantes.map((acompanante, index) => (
                    <li key={index}>
                      <span>{acompanante.nombres} {acompanante.apellidos} (RUT: {acompanante.rut}, Edad: {acompanante.edad})</span>
                      <button 
                        type="button"
                        className="eliminar-btn"
                        onClick={() => eliminarAcompanante(index)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowAcompanantesModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <button 
        className="volver-btn"
        onClick={() => navigate('/usuario')}
      >
        Volver
      </button>
    </div>
  );
};

export default CrearReserva;