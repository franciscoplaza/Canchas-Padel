//src/components/MisReservas.tsx
"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { cancelarReserva } from "../services/reservaService"
import "./MisReservas.css"

interface Cancha {
  _id: string
  id_cancha: string
  precio: number
  capacidad_maxima: number
}

interface Equipamiento {
  _id: string
  nombre: string
  cantidad_disponible: number
  costo_unitario: number
}

interface Reserva {
  _id: string;
  fecha_hora: string;
  id_cancha: string;
  cantidad_acompanantes: number;
  capacidad_cancha: number;
  equipamiento: {
    id_equipamiento: string;
    nombre: string;
    cantidad: number;
    costo_unitario: number;
    subtotal: number;
  }[];
}

interface Acompanante {
  nombres: string
  apellidos: string
  rut: string
  edad: number
}

const MisReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [equipamientos, setEquipamientos] = useState<Equipamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelMessage, setCancelMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()
  const [acompanantesPorReserva, setAcompanantesPorReserva] = useState<{[key: string]: Acompanante[]}>({})
  const [expandedReservas, setExpandedReservas] = useState<string[]>([])
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [editAcompanantes, setEditAcompanantes] = useState<Acompanante[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEquipamiento, setEditEquipamiento] = useState<{[key: string]: number}>({});
  const [showEquipamientoModal, setShowEquipamientoModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Primero obtenemos las canchas
        console.log("Obteniendo canchas...");
        const canchasResponse = await fetch("http://localhost:3000/cancha", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!canchasResponse.ok) {
          throw new Error("Error al obtener canchas");
        }
        const canchasData = await canchasResponse.json();
        setCanchas(canchasData);
        console.log("Canchas obtenidas:", canchasData.length);

        // 2. Obtener equipamientos
        const equipamientosResponse = await fetch("http://localhost:3000/equipamiento", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!equipamientosResponse.ok) {
          throw new Error("Error al obtener equipamientos");
        }
        const equipamientosData = await equipamientosResponse.json();
        setEquipamientos(equipamientosData);

        // 3. Luego obtenemos las reservas (solo después de tener canchas)
        console.log("Obteniendo mis reservas...");
        const reservasResponse = await fetch("http://localhost:3000/reservas/mis-reservas", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!reservasResponse.ok) throw new Error("Error al obtener reservas");
        const reservasData = await reservasResponse.json();
        
        // Ahora sí podemos mapear correctamente con las canchas ya cargadas
        const reservasConCapacidad = reservasData.map((reserva: any) => {
          const cancha = canchasData.find((c: any) => 
            c._id === reserva.id_cancha || c.id_cancha === reserva.id_cancha
          );
          return {
            ...reserva,
            capacidad_cancha: cancha?.capacidad_maxima || reserva.capacidad_cancha // Usa el valor de la reserva como fallback
          };
        });
        
        setReservas(reservasConCapacidad);
        console.log("Reservas obtenidas:", reservasData.length);

        // 4. Obtener acompañantes (igual que antes)
        const acompanantesPromises = reservasData.map(async (reserva: any) => {
          const response = await fetch(`http://localhost:3000/acompanantes/reserva/${reserva._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) return [];
          return response.json();
        });

        const acompanantesData = await Promise.all(acompanantesPromises);
        
        const acompanantesMap = reservasData.reduce((acc: any, reserva: any, index: number) => {
          acc[reserva._id] = acompanantesData[index] || [];
          return acc;
        }, {});

        setAcompanantesPorReserva(acompanantesMap);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);
  
  const handleCancelar = async (reservaId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }

    try {
      setCancelMessage({ type: "", text: "" });
      const response = await cancelarReserva(reservaId);
      
      setCancelMessage({ type: "success", text: response.message });
      setReservas(reservas.filter((r) => r._id !== reservaId));

    } catch (err: any) {
      setCancelMessage({ type: "error", text: err.message });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return dateString
    }
  }

  const getNombreCancha = (idCancha: string): string => {
    try {
      const cancha = canchas.find((c) => c._id === idCancha || c.id_cancha === idCancha)

      if (cancha) {
        const numero = cancha.id_cancha.replace(/\D/g, "")
        if (!numero) return cancha.id_cancha.charAt(0).toUpperCase() + cancha.id_cancha.slice(1)
        return `Cancha ${numero}`
      }

      return `Cancha ${idCancha}`
    } catch (error) {
      console.error("Error al obtener nombre de cancha:", error)
      return `Cancha ${idCancha}`
    }
  }

  const iniciarEdicion = (reserva: Reserva) => {
    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha_hora);
    const diferencia = fechaReserva.getTime() - ahora.getTime();
    const sieteDias = 7 * 24 * 60 * 60 * 1000;

    if (diferencia < sieteDias) {
      alert('No puedes modificar reservas con menos de 7 días de anticipación');
      return;
    }

    setEditingReserva(reserva);
    setEditAcompanantes(acompanantesPorReserva[reserva._id] || []);
    setEditEquipamiento(
      reserva.equipamiento.reduce((acc, item) => {
        acc[item.id_equipamiento] = item.cantidad;
        return acc;
      }, {} as {[key: string]: number})
    );
    setShowEditModal(true);
  };

  const handleGuardarCambios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/reservas/${editingReserva?._id}/modificar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          acompanantes: editAcompanantes,
          equipamiento: editEquipamiento
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al modificar reserva');
      }

      // Actualizar el estado local
      const updatedReserva = await response.json();
      setReservas(reservas.map(r => r._id === updatedReserva._id ? updatedReserva : r));
      
      // Actualizar acompañantes
      setAcompanantesPorReserva({
        ...acompanantesPorReserva,
        [updatedReserva._id]: editAcompanantes
      });

      setShowEditModal(false);
      alert('Reserva modificada exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const toggleExpandReserva = (reservaId: string) => {
    setExpandedReservas(prev => 
      prev.includes(reservaId) 
        ? prev.filter(id => id !== reservaId) 
        : [...prev, reservaId]
    )
  }

  if (loading)
    return (
      <div className="mis-reservas-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tus reservas...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="mis-reservas-container">
        <div className="error-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2>Error al cargar tus reservas</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
        </div>
      </div>
    )

  return (
    <div className="mis-reservas-container">
      <div className="mis-reservas-content">
        <div className="user-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="user-title">Mis Reservas</h1>
          <p className="user-subtitle">Gestiona tus reservas de canchas deportivas</p>
        </div>

        {cancelMessage.text && (
          <div className={`cancel-message ${cancelMessage.type}`}>
            {cancelMessage.text}
          </div>
        )}

        {reservas.length === 0 ? (
          <div className="no-reservas">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="no-reservas-icon"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <h2>No tienes reservas activas</h2>
            <p>Realiza una reserva para comenzar a utilizar nuestras instalaciones deportivas.</p>
            <button className="primary-btn" onClick={() => navigate("/reservar-cancha")}>
              Hacer una reserva
            </button>
          </div>
        ) : (
          <>
            <div className="reservas-stats">
              <div className="stat-card">
                <div className="stat-value">{reservas.length}</div>
                <div className="stat-label">Total Reservas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {reservas.filter((r) => new Date(r.fecha_hora) > new Date()).length}
                </div>
                <div className="stat-label">Reservas Futuras</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{new Set(reservas.map((r) => r.id_cancha)).size}</div>
                <div className="stat-label">Canchas Diferentes</div>
              </div>
            </div>

            <div className="reservas-list-container">
              <h2 className="section-title">Tus Reservas</h2>
              {reservas.map((reserva) => (
                <div key={reserva._id} className="reserva-card">
                  <div className="reserva-header">
                    <div className="reserva-date">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="reserva-icon"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{formatDate(reserva.fecha_hora)}</span>
                    </div>
                    <span className="status-badge status-pending">Pendiente</span>
                  </div>
                  <div className="reserva-details">
                    <div className="reserva-detail">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="reserva-icon"
                      >
                        <path d="M2 18h20M2 6h20M12 2v20"></path>
                      </svg>
                      <span className="detail-label">Cancha:</span>
                      <span className="detail-value">{getNombreCancha(reserva.id_cancha)}</span>
                    </div>
                    <div className="reserva-detail">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="reserva-icon"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span className="detail-label">Hora:</span>
                      <span className="detail-value">
                        {new Date(reserva.fecha_hora).toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="reserva-detail">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="reserva-icon"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="detail-label">Acompañantes:</span>
                      <span className="detail-value">
                        {acompanantesPorReserva[reserva._id]?.length || 0}
                      </span>
                    </div>
                    <div className="reserva-detail">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="reserva-icon"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="detail-label">Asistencia:</span>
                      <span className="detail-value">
                        {(acompanantesPorReserva[reserva._id]?.length || 0) + 1}/{reserva.capacidad_cancha}
                      </span>
                    </div>
                  </div>

                  {expandedReservas.includes(reserva._id) && (
                    <div className="acompanantes-list">
                      <h4>Acompañantes:</h4>
                      {acompanantesPorReserva[reserva._id]?.length > 0 ? (
                        <ul>
                          {acompanantesPorReserva[reserva._id].map((acomp, index) => (
                            <li key={index}>
                              {acomp.nombres} {acomp.apellidos} (RUT: {acomp.rut}, Edad: {acomp.edad})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No hay acompañantes registrados</p>
                      )}
                    </div>
                  )}

                  <div className="reserva-actions">
                    <button 
                      className="action-btn view-btn" 
                      title="Ver detalles"
                      onClick={() => toggleExpandReserva(reserva._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>

                    <button 
                      className="action-btn edit-btn" 
                      title="Editar reserva"
                      onClick={() => iniciarEdicion(reserva)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <button 
                      className="action-btn delete-btn" 
                      title="Cancelar reserva"
                      onClick={() => handleCancelar(reserva._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="user-actions">
          <button className="secondary-btn" onClick={() => navigate("/usuario")}>
            Volver
          </button>
          <button className="primary-btn" onClick={() => navigate("/reservar-cancha")}>
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && editingReserva && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h2>Modificar Reserva</h2>
            <p>Cancha: {getNombreCancha(editingReserva.id_cancha)}</p>
            <p>Fecha: {formatDate(editingReserva.fecha_hora)}</p>
            
            <div className="form-section">
              <h3>Acompañantes</h3>
              <button 
                className="add-btn"
                onClick={() => setEditAcompanantes([...editAcompanantes, {
                  nombres: '',
                  apellidos: '',
                  rut: '',
                  edad: 0
                }])}
              >
                Agregar Acompañante
              </button>
              
              {editAcompanantes.map((acomp, index) => (
                <div key={index} className="acompanante-form">
                  <input
                    type="text"
                    placeholder="Nombres"
                    value={acomp.nombres}
                    onChange={(e) => {
                      const newAcomp = [...editAcompanantes];
                      newAcomp[index].nombres = e.target.value;
                      setEditAcompanantes(newAcomp);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Apellidos"
                    value={acomp.apellidos}
                    onChange={(e) => {
                      const newAcomp = [...editAcompanantes];
                      newAcomp[index].apellidos = e.target.value;
                      setEditAcompanantes(newAcomp);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="RUT"
                    value={acomp.rut}
                    onChange={(e) => {
                      const newAcomp = [...editAcompanantes];
                      newAcomp[index].rut = e.target.value;
                      setEditAcompanantes(newAcomp);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Edad"
                    value={acomp.edad}
                    onChange={(e) => {
                      const newAcomp = [...editAcompanantes];
                      newAcomp[index].edad = parseInt(e.target.value) || 0;
                      setEditAcompanantes(newAcomp);
                    }}
                  />
                  <button 
                    className="remove-btn"
                    onClick={() => setEditAcompanantes(editAcompanantes.filter((_, i) => i !== index))}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="form-section">
              <h3>Equipamiento</h3>
              <button 
                className="equipamiento-btn"
                onClick={() => setShowEquipamientoModal(true)}
              >
                Modificar Equipamiento
              </button>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="save-btn"
                onClick={handleGuardarCambios}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de equipamiento */}
      {showEquipamientoModal && (
        <div className="modal-overlay">
          <div className="equipamiento-modal">
            <h2>Modificar Equipamiento</h2>
            <table>
              <thead>
                <tr>
                  <th>Equipamiento</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {equipamientos.map(equip => (
                  <tr key={equip._id}>
                    <td>{equip.nombre}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={editEquipamiento[equip._id] || 0}
                        onChange={(e) => setEditEquipamiento({
                          ...editEquipamiento,
                          [equip._id]: parseInt(e.target.value) || 0
                        })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button onClick={() => setShowEquipamientoModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MisReservas