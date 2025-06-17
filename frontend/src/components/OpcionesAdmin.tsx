//src/components/OpcionesAdmin.tsx
"use client"
import { useNavigate } from "react-router-dom"
import "./OpcionesAdmin.css"

const OpcionesAdmin = () => {
  const navigate = useNavigate()

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">Gestione canchas y reservas del sistema</p>
        </div>

        <div className="admin-dashboard">
          <div className="admin-card">
            <div className="card-icon canchas-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div className="card-content">
              <h2 className="card-title">Mis Canchas</h2>
              <p className="card-description">
                Administre las canchas disponibles, edite información y gestione disponibilidad.
              </p>
              <button onClick={() => navigate("/admin/canchas")} className="admin-btn canchas-btn">
                Gestionar Canchas
              </button>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-icon equipamiento-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 22h16"></path>
                <path d="M5 18h14"></path>
                <path d="M17 14H7"></path>
                <path d="M15 10H9"></path>
                <path d="M12 6h0"></path>
              </svg>
            </div>
            <div className="card-content">
              <h2 className="card-title">Equipamiento</h2>
              <p className="card-description">
                Administre los artículos disponibles.
              </p>
              <button onClick={() => navigate("/admin/equipamiento")} className="admin-btn equipamiento-btn">
                Gestionar Equipamiento
              </button>
            </div>
          </div>


          <div className="admin-card">
            <div className="card-icon reservas-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="card-content">
              <h2 className="card-title">Reservas</h2>
              <p className="card-description">Visualice y gestione todas las reservas realizadas por los usuarios.</p>
              <button onClick={() => navigate("/admin/reservas")} className="admin-btn reservas-btn">
                Ver Reservas
              </button>
            </div>
          </div>
        </div>
        

        <div className="admin-actions">
          {/* <button className="secondary-btn" onClick={() => navigate("/")}>
            Volver al Inicio
          </button> */}
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token")
              localStorage.removeItem("usuario")
              navigate("/login")
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default OpcionesAdmin
