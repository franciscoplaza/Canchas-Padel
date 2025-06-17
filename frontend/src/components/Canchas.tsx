//src/components/Canchas.tsx
"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Canchas.css"

interface Cancha {
  _id: string
  id_cancha: string
  precio: number
  capacidad_maxima: number
}

const Canchas = () => {
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    precio: 0,
    capacidad_maxima: 0
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [nuevoNumero, setNuevoNumero] = useState<number | "">("")
  const [nuevoPrecioAdd, setNuevoPrecioAdd] = useState<number | "">("")
  const [nuevaCapacidadAdd, setNuevaCapacidadAdd] = useState<number | "">("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    const fetchCanchas = async () => {
      try {
        const response = await fetch("http://localhost:3000/cancha", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Error al obtener canchas")
        const data = await response.json()
        setCanchas(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchCanchas()
  }, [navigate])

  const handleEliminar = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cancha?")) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:3000/cancha/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al eliminar cancha")
      setCanchas(canchas.filter((cancha) => cancha._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const iniciarEdicion = (cancha: Cancha) => {
    setEditingId(cancha._id)
    setEditData({
      precio: cancha.precio,
      capacidad_maxima: cancha.capacidad_maxima
    })
  }

  const cancelarEdicion = () => {
    setEditingId(null)
  }

  const actualizarCancha = async (id: string) => {
    if (editData.precio <= 0 || editData.capacidad_maxima <= 0) {
      alert("El precio y la capacidad deben ser mayores a 0")
      return
    }

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:3000/cancha/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          precio: editData.precio,
          capacidad_maxima: editData.capacidad_maxima  // ✅ Envía ambos campos
        }),
      })

      if (!response.ok) throw new Error("Error al actualizar cancha")

      const data = await response.json()
      setCanchas(canchas.map((c) => (c._id === id ? data : c)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  const agregarCancha = async () => {
    // Validar campos no vacíos (incluyendo 0 como valor válido aquí)
    if (nuevoNumero === "" || nuevoPrecioAdd === "" || nuevaCapacidadAdd === "") {
      window.alert("Error: Todos los campos son obligatorios")
      return
    }

    // Ahora validamos específicamente los valores numéricos
    const numCancha = Number(nuevoNumero)
    const precio = Number(nuevoPrecioAdd)
    const capacidad = Number(nuevaCapacidadAdd)

    if (numCancha <= 0 || precio <= 0 || capacidad <= 0) {
      window.alert("El número de cancha, precio y capacidad deben ser valores mayores a cero.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const response = await fetch("http://localhost:3000/cancha", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: numCancha,
          precio: precio,
          capacidad_maxima: capacidad
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (errorData.message.includes("ya existe")) {
          window.alert(`La Cancha ${numCancha} ya existe en el sistema.`)
          return
        }

        throw new Error(errorData.message || "Error al crear cancha")
      }

      // Éxito: actualizar estado y limpiar formulario
      const nuevaCancha = await response.json()
      setCanchas([...canchas, nuevaCancha])
      setShowAddForm(false)
      setNuevoNumero("")
      setNuevoPrecioAdd("")
      setNuevaCapacidadAdd("")

      window.alert(
        `✅ Cancha creada exitosamente\n\nCancha ${numCancha} registrada con precio $${precio.toLocaleString()} y capacidad para ${capacidad} personas`,
      )
    } catch (err) {
      if (err instanceof Error && !err.message.includes("ya existe")) {
        window.alert(`⛔ Error inesperado\n\n${err.message || "Ocurrió un problema al crear la cancha"}`)
      }
    }
  }

  const formatearNombreCancha = (idCancha: string): string => {
    const numero = idCancha.replace(/\D/g, "")
    if (!numero) return idCancha.charAt(0).toUpperCase() + idCancha.slice(1)
    return `Cancha ${numero}`
  }

  if (loading)
    return (
      <div className="canchas-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando canchas...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="canchas-container">
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
          <h2>Error al cargar las canchas</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
        </div>
      </div>
    )

  return (
    <div className="canchas-container">
      <div className="canchas-content">
        <div className="canchas-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="canchas-title">Administrar Canchas</h1>
          <p className="canchas-subtitle">Gestione las canchas disponibles en el sistema</p>
        </div>

        <div className="canchas-actions">
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="add-cancha-btn">
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
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Agregar Cancha
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
                  onChange={(e) => setNuevoNumero(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Ej: 1, 2, 3..."
                />
              </div>
              <div className="form-row">
                <label>Precio:</label>
                <input
                  type="number"
                  min="1"
                  value={nuevoPrecioAdd}
                  onChange={(e) => setNuevoPrecioAdd(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Ej: 15000"
                />
              </div>
              <div className="form-row">
                <label>Capacidad Máxima:</label>
                <input
                  type="number"
                  min="1"
                  value={nuevaCapacidadAdd}
                  onChange={(e) => setNuevaCapacidadAdd(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Ej: 4"
                />
              </div>
              <div className="form-actions">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setError("")
                  }}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button onClick={agregarCancha} className="save-btn">
                  Guardar
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>

        <div className="canchas-stats">
          <div className="stat-card">
            <div className="stat-value">{canchas.length}</div>
            <div className="stat-label">Total Canchas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${Math.min(...canchas.map((c) => c.precio)).toLocaleString()}</div>
            <div className="stat-label">Precio Mínimo</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${Math.max(...canchas.map((c) => c.precio)).toLocaleString()}</div>
            <div className="stat-label">Precio Máximo</div>
          </div>
        </div>

        <div className="table-container">
          <table className="canchas-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Capacidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {canchas.length > 0 ? (
                canchas.map((cancha) => (
                  <tr key={cancha._id}>
                    <td>{formatearNombreCancha(cancha.id_cancha)}</td>
                    <td>
                      {editingId === cancha._id ? (
                        <input
                          type="number"
                          min="0"
                          value={editData.precio}
                          onChange={(e) => setEditData({...editData, precio: Number(e.target.value)})}
                          className="precio-input"
                        />
                      ) : (
                        `$${cancha.precio.toLocaleString()}`
                      )}
                    </td>
                    <td>
                      {editingId === cancha._id ? ( 
                        
                        <input
                          type="number"
                          min="1"
                          value={editData.capacidad_maxima}
                          onChange={(e) => {
                            const nuevoValor = Number(e.target.value)
                            console.log("Capacidad cambiada a:", nuevoValor)
                            setEditData({ ...editData, capacidad_maxima: nuevoValor })
                          }}
                          className="precio-input"
                        />
                      ) : (
                        `${cancha.capacidad_maxima} personas`
                      )}
                    </td>

                    <td className="acciones-cell">
                      {editingId === cancha._id ? (
                        <>
                          <button onClick={() => actualizarCancha(cancha._id)} className="save-btn">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                              <polyline points="17 21 17 13 7 13 7 21"></polyline>
                              <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Guardar
                          </button>
                          <button onClick={cancelarEdicion} className="cancel-btn">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => iniciarEdicion(cancha)} className="edit-btn">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
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
                            Modificar
                          </button>
                          <button onClick={() => handleEliminar(cancha._id)} className="delete-btn">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
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
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="no-results">
                    No hay canchas disponibles. ¡Agrega una nueva!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-actions">
          <button className="secondary-btn" onClick={() => navigate("/admin")}>
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default Canchas