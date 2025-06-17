import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistorial, HistorialEntry } from '../services/historialService';
import './Historial.css';

const Historial: React.FC = () => {
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [filtered, setFiltered] = useState<HistorialEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    fecha: '',
    usuario: '',
    accion: '',
    entidad: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const data = await getHistorial();
        setHistorial(data);
        setFiltered(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el historial.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  const filtrar = () => {
    const { fecha, usuario, accion, entidad } = filtros;
    const filtrados = historial.filter((item) => {
      const fechaFormateada = new Date(item.createdAt).toLocaleDateString();
      return (
        (!fecha || fechaFormateada.includes(fecha)) &&
        (!usuario || item.usuario?.correo?.toLowerCase().includes(usuario.toLowerCase())) &&
        (!accion || item.tipoAccion.toLowerCase().includes(accion.toLowerCase())) &&
        (!entidad || item.entidadAfectada.toLowerCase().includes(entidad.toLowerCase()))
      );
    });
    setFiltered(filtrados);
  };

  useEffect(() => {
    filtrar();
  }, [filtros, historial]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  if (loading) {
    return <div className="historial-container">Cargando historial...</div>;
  }

  if (error) {
    return <div className="historial-container error">Error: {error}</div>;
  }

  return (
    <div className="historial-container">
      <h2>Historial de Acciones</h2>

      {/* Filtros */}
      <div className="filtros-barra">
        <input
          type="text"
          name="fecha"
          placeholder="Filtrar por fecha (dd/mm/aaaa)"
          value={filtros.fecha}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="usuario"
          placeholder="Filtrar por usuario"
          value={filtros.usuario}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="accion"
          placeholder="Filtrar por acción"
          value={filtros.accion}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="entidad"
          placeholder="Filtrar por entidad"
          value={filtros.entidad}
          onChange={handleInputChange}
        />
      </div>

      <table className="historial-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((entry) => (
              <tr key={entry._id}>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
                <td>{entry.usuario?.correo || 'N/A'}</td>
                <td>{entry.tipoAccion}</td>
                <td>{entry.entidadAfectada}</td>
                <td>
                  <pre>{JSON.stringify(entry.detalles, null, 2)}</pre>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No hay registros que coincidan con los filtros.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ textAlign: 'center' }}>
        <button className="volver-btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default Historial;
