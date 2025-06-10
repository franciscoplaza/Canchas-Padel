// src/components/GestionarEquipamiento.tsx
"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./GestionarEquipamiento.css"

interface Equipamiento {
  _id: string
  id_equipamiento: string
  nombre: string
  stock: number
  tipo: string
  costo: number
}

const GestionarEquipamiento = () => {
  const [equipamientos, setEquipamientos] = useState<Equipamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editData, setEditData] = useState({
    stock: 0,
    costo: 0,
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEquipamiento, setNewEquipamiento] = useState({
    nombre: "",
    stock: "",
    tipo: "",
    costo: "",
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    const fetchEquipamientos = async () => {
      try {
        const response = await fetch("http://localhost:3000/equipamiento", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Error al obtener equipamientos")
        const data = await response.json()
        setEquipamientos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchEquipamientos()
  }, [navigate])

  // Función para filtrar equipamientos
  const filteredEquipamientos = equipamientos.filter((equipamiento) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      equipamiento.nombre.toLowerCase().includes(searchLower) || equipamiento.tipo.toLowerCase().includes(searchLower)
    )
  })

  const handleEliminar = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este equipamiento?")) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:3000/equipamiento/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al eliminar equipamiento")
      setEquipamientos(equipamientos.filter((eq) => eq._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const iniciarEdicion = (equipamiento: Equipamiento) => {
    setEditingId(equipamiento._id)
    setEditData({
      stock: equipamiento.stock,
      costo: equipamiento.costo,
    })
  }

  const cancelarEdicion = () => {
    setEditingId(null)
  }

  const actualizarEquipamiento = async (id: string) => {
    if (editData.stock <= 0 || editData.costo <= 0) {
      alert("El stock y el costo deben ser mayores a 0")
      return
    }

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:3000/equipamiento/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: editData.stock,
          costo: editData.costo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar equipamiento")
      }

      const data = await response.json()
      setEquipamientos(equipamientos.map((eq) => (eq._id === id ? data : eq)))
      setEditingId(null)
      alert("Cambios guardados exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
      console.error("Error al actualizar equipamiento:", err)
    }
  }

  const agregarEquipamiento = async () => {
    if (
      !newEquipamiento.nombre.trim() ||
      newEquipamiento.stock === "" ||
      !newEquipamiento.tipo.trim() ||
      newEquipamiento.costo === ""
    ) {
      window.alert("Error: Todos los campos son obligatorios")
      return
    }

    const stock = Number(newEquipamiento.stock)
    const costo = Number(newEquipamiento.costo)

    if (stock <= 0 || costo <= 0) {
      window.alert("El stock y el costo deben ser valores mayores a cero.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const response = await fetch("http://localhost:3000/equipamiento", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: newEquipamiento.nombre,
          stock: stock,
          tipo: newEquipamiento.tipo,
          costo: costo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.message.includes("ya existe")) {
          window.alert(`El equipamiento "${newEquipamiento.nombre}" ya existe en el sistema.`)
          return
        }
        throw new Error(errorData.message || "Error al crear equipamiento")
      }

      const nuevoEquipamiento = await response.json()
      setEquipamientos([...equipamientos, nuevoEquipamiento])
      setShowAddForm(false)
      setNewEquipamiento({
        nombre: "",
        stock: "",
        tipo: "",
        costo: "",
      })

      window.alert(
        `✅ Equipamiento creado exitosamente\n\n${newEquipamiento.nombre} registrado con ${stock} unidades y costo $${costo.toLocaleString()}`,
      )
    } catch (err) {
      if (err instanceof Error && !err.message.includes("ya existe")) {
        window.alert(`⛔ Error inesperado\n\n${err.message || "Ocurrió un problema al crear el equipamiento"}`)
      }
    }
  }

  if (loading)
    return (
      <div className="equipamiento-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando equipamiento...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="equipamiento-container">
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
          <h2>Error al cargar el equipamiento</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
        </div>
      </div>
    )

  return (
    <div className="equipamiento-container">
      <div className="equipamiento-content">
        <div className="equipamiento-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="equipamiento-title">Administrar Equipamiento</h1>
          <p className="equipamiento-subtitle">Gestione el equipamiento disponible en el sistema</p>
        </div>

        {/* Barra de búsqueda simplificada */}
       

        <div className="equipamiento-actions">
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="add-equipamiento-btn">
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
              Agregar Equipamiento
            </button>
          ) : (
            <div className="add-form">
              <h3>Nuevo Equipamiento</h3>
              <div className="form-row">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={newEquipamiento.nombre}
                  onChange={(e) => setNewEquipamiento({ ...newEquipamiento, nombre: e.target.value })}
                  placeholder="Ej: Pelotas de tenis"
                />
              </div>
              <div className="form-row">
                <label>Tipo:</label>
                <input
                  type="text"
                  value={newEquipamiento.tipo}
                  onChange={(e) => setNewEquipamiento({ ...newEquipamiento, tipo: e.target.value })}
                  placeholder="Ej: Deportivo"
                />
              </div>
              <div className="form-row">
                <label>Stock:</label>
                <input
                  type="number"
                  min="1"
                  value={newEquipamiento.stock}
                  onChange={(e) => setNewEquipamiento({ ...newEquipamiento, stock: e.target.value })}
                  placeholder="Ej: 10"
                />
              </div>
              <div className="form-row">
                <label>Costo:</label>
                <input
                  type="number"
                  min="1"
                  value={newEquipamiento.costo}
                  onChange={(e) => setNewEquipamiento({ ...newEquipamiento, costo: e.target.value })}
                  placeholder="Ej: 5000"
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
                <button onClick={agregarEquipamiento} className="save-btn">
                  Guardar
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>

        <div className="equipamiento-stats">
          <div className="stat-card">
            <div className="stat-value">{filteredEquipamientos.length}</div>
            <div className="stat-label">{searchTerm ? "Items Encontrados" : "Total Items"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{filteredEquipamientos.reduce((acc, eq) => acc + eq.stock, 0)}</div>
            <div className="stat-label">{searchTerm ? "Unidades Encontradas" : "Total Unidades"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ${filteredEquipamientos.reduce((acc, eq) => acc + eq.costo * eq.stock, 0).toLocaleString()}
            </div>
            <div className="stat-label">{searchTerm ? "Valor Encontrado" : "Valor Total"}</div>
          </div>
        </div>

          <div className="busqueda-simple">
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-busqueda"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="boton-limpiar">
              Limpiar
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="equipamiento-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Stock</th>
                <th>Costo Unitario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipamientos.length > 0 ? (
                filteredEquipamientos.map((equipamiento) => (
                  <tr key={equipamiento._id}>
                    <td>{equipamiento.nombre}</td>
                    <td>{equipamiento.tipo}</td>
                    <td>
                      {editingId === equipamiento._id ? (
                        <input
                          type="number"
                          min="0"
                          value={editData.stock}
                          onChange={(e) => setEditData({ ...editData, stock: Number(e.target.value) })}
                          className="stock-input"
                        />
                      ) : (
                        equipamiento.stock
                      )}
                    </td>
                    <td>
                      {editingId === equipamiento._id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editData.costo}
                          onChange={(e) => setEditData({ ...editData, costo: Number(e.target.value) })}
                          className="costo-input"
                        />
                      ) : (
                        `$${equipamiento.costo.toLocaleString()}`
                      )}
                    </td>
                    <td className="acciones-cell">
                      {editingId === equipamiento._id ? (
                        <>
                          <button onClick={() => actualizarEquipamiento(equipamiento._id)} className="save-btn">
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
                          <button onClick={() => iniciarEdicion(equipamiento)} className="edit-btn">
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
                          <button onClick={() => handleEliminar(equipamiento._id)} className="delete-btn">
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
                  <td colSpan={5} className="no-results">
                    {searchTerm
                      ? `No se encontraron equipamientos que coincidan con "${searchTerm}"`
                      : "No hay equipamiento disponible. ¡Agrega un nuevo item!"}
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

export default GestionarEquipamiento
