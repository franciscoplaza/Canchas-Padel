import React, { useState, useEffect } from 'react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nuevoPrecio, setNuevoPrecio] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [nuevoNumero, setNuevoNumero] = useState<number | ''>('');
  const [nuevoPrecioAdd, setNuevoPrecioAdd] = useState<number | ''>('');
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
          headers: { Authorization: `Bearer ${token}` },
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
    if (!window.confirm('¿Estás seguro de eliminar esta cancha?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/cancha/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar cancha');
      setCanchas(canchas.filter(cancha => cancha._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const iniciarEdicion = (cancha: Cancha) => {
    setEditingId(cancha._id);
    setNuevoPrecio(cancha.precio);
  };

  const cancelarEdicion = () => {
    setEditingId(null);
  };

  const actualizarPrecio = async (id: string) => {
    if (nuevoPrecio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/cancha/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ precio: nuevoPrecio }),
      });

      if (!response.ok) throw new Error('Error al actualizar precio');

      const data = await response.json();
      setCanchas(canchas.map(c => c._id === id ? data : c));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const agregarCancha = async () => {
  // Validar campos no vacíos (incluyendo 0 como valor válido aquí)
  if (nuevoNumero === '' || nuevoPrecioAdd === '') {
    window.alert('Error: Todos los campos son obligatorios');
    return;
  }

  // Ahora validamos específicamente los valores numéricos
  const numCancha = Number(nuevoNumero);
  const precio = Number(nuevoPrecioAdd);
  
  if (numCancha <= 0 || precio <= 0) {
    window.alert('El número de cancha y el precio deben ser valores mayores a cero.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/cancha', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numero: numCancha,
        precio: precio
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (errorData.message.includes('ya existe')) {
        window.alert(`La Cancha ${numCancha} ya existe en el sistema.`);
        return;
      }
      
      throw new Error(errorData.message || 'Error al crear cancha');
    }

    // Éxito: actualizar estado y limpiar formulario
    const nuevaCancha = await response.json();
    setCanchas([...canchas, nuevaCancha]);
    setShowAddForm(false);
    setNuevoNumero('');
    setNuevoPrecioAdd('');
    
    window.alert(`✅ Cancha creada exitosamente\n\nCancha ${numCancha} registrada con precio $${precio.toLocaleString()}`);

  } catch (err) {
    if (err instanceof Error && !err.message.includes('ya existe')) {
      window.alert(`⛔ Error inesperado\n\n${err.message || 'Ocurrió un problema al crear la cancha'}`);
    }
  }
};

  const formatearNombreCancha = (idCancha: string): string => {
    const numero = idCancha.replace(/\D/g, '');
    if (!numero) return idCancha.charAt(0).toUpperCase() + idCancha.slice(1);
    return `Cancha ${numero}`;
  };

  if (loading) return <div className="loading">Cargando canchas...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="canchas-container">
      <header className="canchas-header">
        <h1>Administrar Canchas</h1>
        <div className="header-actions">
          {!showAddForm ? (
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn-agregar"
            >
              + Agregar Cancha
            </button>
          ) : (
            <div className="add-form">
              <h3>Nueva Cancha</h3>
              <div className="form-row">
                <label>Número:</label>
                <input
                  type="number"
                  min="1"
                  value={nuevoNumero}
                  onChange={(e) => setNuevoNumero(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Ej: 1, 2, 3..."
                />
              </div>
              <div className="form-row">
                <label>Precio:</label>
                <input
                  type="number"
                  min="1"
                  value={nuevoPrecioAdd}
                  onChange={(e) => setNuevoPrecioAdd(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Ej: 15000"
                />
              </div>
              <div className="form-actions">
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setError('');
                  }}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  onClick={agregarCancha}
                  className="btn-guardar"
                >
                  Guardar
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>
      </header>

      <div className="canchas-list-container">
        <table className="canchas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {canchas.map((cancha) => (
              <tr key={cancha._id}>
                <td>{formatearNombreCancha(cancha.id_cancha)}</td>
                <td>
                  {editingId === cancha._id ? (
                    <input
                      type="number"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                      className="precio-input"
                    />
                  ) : (
                    `$${cancha.precio.toLocaleString()}`
                  )}
                </td>
                <td className="acciones-cell">
                  {editingId === cancha._id ? (
                    <>
                      <button 
                        onClick={() => actualizarPrecio(cancha._id)}
                        className="btn-guardar"
                      >
                        Guardar
                      </button>
                      <button 
                        onClick={cancelarEdicion}
                        className="btn-cancelar"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => iniciarEdicion(cancha)}
                        className="btn-modificar"
                      >
                        Modificar
                      </button>
                      <button 
                        onClick={() => handleEliminar(cancha._id)}
                        className="btn-eliminar"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
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