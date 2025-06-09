//src/components/OpcionesUsuario.tsx
import { useNavigate } from "react-router-dom";
import "./OpcionesUsuario.css";

const OpcionesUsuario = () => {
  const navigate = useNavigate();

  return (
    <div className="user-container">
      <div className="user-content">
        <div className="user-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="user-title">Panel de Usuario</h1>
          <p className="user-subtitle">Gestione sus reservas de canchas</p>
        </div>

        <div className="user-dashboard">
          <div className="user-card">
            <div className="card-icon reservar-icon">
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
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </div>
            <div className="card-content">
              <h2 className="card-title">Reservar Cancha</h2>
              <p className="card-description">
                Realice una nueva reserva de cancha seleccionando fecha y horario disponible.
              </p>
              <button 
                onClick={() => navigate("/reservar-cancha")} 
                className="user-btn reservar-btn"
              >
                Nueva Reserva
              </button>
            </div>
          </div>

          <div className="user-card">
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
              <h2 className="card-title">Mis Reservas</h2>
              <p className="card-description">
                Visualice, edite o cancele las reservas que ha realizado anteriormente.
              </p>
              <button 
                onClick={() => navigate("/mis-reservas")} 
                className="user-btn reservas-btn"
              >
                Ver Mis Reservas
              </button>
            </div>
          </div>

          <div className="user-card">
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
              <h2 className="card-title">Saldo</h2>
              <p className="card-description">
                Cargar Saldo
              </p>
              <button 
                onClick={() => navigate("/saldo")} 
                className="user-btn reservas-btn"
              >
                Ver mi Saldo
              </button>
            </div>
          </div>

        </div>

        <div className="user-actions">
          <button 
            className="secondary-btn" 
            onClick={() => navigate("/")}
          >
            Volver al Inicio
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("usuario");
              navigate("/login");
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpcionesUsuario;