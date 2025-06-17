import React, { useState, useEffect } from 'react';
import { getHistorial, HistorialEntry } from '../services/historialService';
import './Historial.css'; // Crearemos este archivo para los estilos

const Historial: React.FC = () => {
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const data = await getHistorial();
        setHistorial(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el historial.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  if (loading) {
    return <div className="historial-container">Cargando historial...</div>;
  }

  if (error) {
    return <div className="historial-container error">Error: {error}</div>;
  }

  return (
    <div className="historial-container">
      <h2>Historial de Acciones</h2>
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
          {historial.length > 0 ? (
            historial.map((entry) => (
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
              <td colSpan={5}>No hay registros en el historial.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Historial;
