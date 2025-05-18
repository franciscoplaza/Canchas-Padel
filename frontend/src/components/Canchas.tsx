import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Canchas.css';

interface Cancha {
  _id: string;
  id_cancha: string;
  precio: number;
}

const Canchas = () => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCanchas = async () => {
      try {
        const response = await fetch('http://localhost:3000/cancha', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Error al obtener canchas');
        const data = await response.json();
        setCanchas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCanchas();
  }, [navigate]);

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cancha?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/cancha/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar cancha');
      
      // Actualizar lista después de eliminar
      setCanchas(canchas.filter(cancha => cancha._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (loading) return <div className="loading">Cargando canchas...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="canchas-container">
      <header className="canchas-header">
        <h1>Administrar Canchas</h1>
        <p className="canchas-subtitle">Listado completo de canchas</p>
      </header>

      <div className="canchas-list-container">
        <table className="canchas-table">
          <thead>
            <tr>
              <th>ID Cancha</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {canchas.map((cancha) => (
              <tr key={cancha._id}>
                <td>{cancha.id_cancha}</td>
                <td>${cancha.precio.toLocaleString()}</td>
                <td>
                  <button 
                    onClick={() => handleEliminar(cancha._id)}
                    className="delete-btn"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Canchas;