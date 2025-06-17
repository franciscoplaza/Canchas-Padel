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

interface Reserva {
  _id: string
  fecha_hora: string
  id_cancha: string
  cantidad_acompanantes: number
  capacidad_cancha: number
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelMessage, setCancelMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()
  const [acompanantesPorReserva, setAcompanantesPorReserva] = useState<{[key: string]: Acompanante[]}>({})
  const [expandedReservas, setExpandedReservas] = useState<string[]>([])

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

        // 2. Luego obtenemos las reservas (solo después de tener canchas)
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

        // 3. Obtener acompañantes (igual que antes)
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
  
   // ---  Función para manejar la cancelación ---
   const handleCancelar = async (reservaId: string) => {
    // Usamos window.confirm para pedir una confirmación simple al usuario.
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return; // Si el usuario dice "No", no hacemos nada.
    }

    try {
      setCancelMessage({ type: "", text: "" }); // Limpiamos mensajes anteriores.
      const response = await cancelarReserva(reservaId); // Llamamos a la función del servicio.
      
      // Si todo sale bien, mostramos un mensaje de éxito.
      setCancelMessage({ type: "success", text: response.message });
      
      // Actualizamos la lista de reservas en la pantalla para quitar la que se canceló.
      setReservas(reservas.filter((r) => r._id !== reservaId));

    } catch (err: any) {
      // Si el backend devuelve un error (ej: "no se puede cancelar con menos de 7 días"), lo mostramos.
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
      return dateString // Devolvemos la fecha original si hay error
    }
  }

  const getNombreCancha = (idCancha: string): string => {
    try {
      // Buscar la cancha por su ID
      const cancha = canchas.find((c) => c._id === idCancha || c.id_cancha === idCancha)

      if (cancha) {
        // Si encontramos la cancha, formateamos su nombre
        const numero = cancha.id_cancha.replace(/\D/g, "")
        if (!numero) return cancha.id_cancha.charAt(0).toUpperCase() + cancha.id_cancha.slice(1)
        return `Cancha ${numero}`
      }

      // Si no encontramos la cancha, devolvemos el ID como fallback
      return `Cancha ${idCancha}`
    } catch (error) {
      console.error("Error al obtener nombre de cancha:", error)
      return `Cancha ${idCancha}` // Fallback seguro
    }
  }

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
                  {
                    reservas.filter((r) => new Date(r.fecha_hora) > new Date()).length
                  }
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
                    <button className="action-btn delete-btn" 
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
    </div>
  )
}

export default MisReservas