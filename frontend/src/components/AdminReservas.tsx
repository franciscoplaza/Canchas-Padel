"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AdminReservas.css"

// Interfaces ajustadas según tu backend
interface Cancha {
  _id: string
  id_cancha: string
  precio: number
}

interface Reserva {
  _id: string
  fecha_hora: string
  id_cancha: string
  usuario: {
    nombreUsuario: string
    // Otros campos del usuario si los necesitas
  }
}

const AdminReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}")

    if (!token || usuarioActual.rol !== "admin") {
      navigate("/login")
      return
    }

    const fetchData = async () => {
      try {
        // 1. Obtenemos las canchas
        console.log("Obteniendo canchas...")
        const canchasResponse = await fetch("http://localhost:3000/cancha", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!canchasResponse.ok) throw new Error("Error al obtener canchas")
        const canchasData = await canchasResponse.json()
        setCanchas(canchasData)
        console.log("Canchas obtenidas:", canchasData.length)

        // 2. Obtenemos las reservas (que ya incluyen información del usuario)
        console.log("Obteniendo reservas...")
        const reservasResponse = await fetch("http://localhost:3000/reservas/todas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!reservasResponse.ok) throw new Error("Error al obtener reservas")
        const reservasData = await reservasResponse.json()

        // Verificamos la estructura de los datos
        console.log("Ejemplo de reserva:", reservasData.length > 0 ? reservasData[0] : "No hay reservas")

        setReservas(reservasData)
        console.log("Reservas obtenidas:", reservasData.length)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

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

  const filteredReservas = reservas.filter((reserva) => {
    try {
      return (
        (reserva.usuario?.nombreUsuario || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        getNombreCancha(reserva.id_cancha).toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error("Error al filtrar reserva:", error, reserva)
      return false // Excluimos la reserva si hay error
    }
  })

  if (loading)
    return (
      <div className="admin-reservas-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="admin-reservas-container">
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
          <h2>Error al cargar los datos</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
        </div>
      </div>
    )

  return (
    <div className="admin-reservas-container">
      <div className="admin-reservas-content">
        <div className="admin-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="admin-title">Gestión de Reservas</h1>
          <p className="admin-subtitle">Administre todas las reservas del sistema</p>
        </div>

        <div className="admin-toolbar">
          <div className="search-container">
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
              className="search-icon"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o cancha..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="reservas-stats">
          <div className="stat-card">
            <div className="stat-value">{reservas.length}</div>
            <div className="stat-label">Total Reservas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{new Set(reservas.map((r) => r.usuario?.nombreUsuario)).size}</div>
            <div className="stat-label">Usuarios Únicos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{new Set(reservas.map((r) => r.id_cancha)).size}</div>
            <div className="stat-label">Canchas Reservadas</div>
          </div>
        </div>

        <div className="table-container">
          <table className="reservas-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Nombre Usuario</th>
                <th>Cancha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservas.length > 0 ? (
                filteredReservas.map((reserva) => (
                  <tr key={reserva._id}>
                    <td>{formatDate(reserva.fecha_hora)}</td>
                    <td>{reserva.usuario?.nombreUsuario || "Usuario desconocido"}</td>
                    <td>{getNombreCancha(reserva.id_cancha)}</td>
                    <td>
                      <span className="status-badge status-pending">Pendiente</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view-btn" title="Ver detalles">
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
                        <button className="action-btn edit-btn" title="Editar reserva">
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
                        <button className="action-btn delete-btn" title="Cancelar reserva">
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-results">
                    No se encontraron reservas que coincidan con los criterios de búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-actions">
          <button className="secondary-btn" onClick={() => navigate("/admin")}>
            Volver al Panel
          </button>
          <button className="primary-btn" onClick={() => window.print()}>
            Imprimir Reservas
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminReservas
