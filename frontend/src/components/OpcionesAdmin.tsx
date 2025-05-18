import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OpcionesAdmin.css';

const OpcionesAdmin = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <p className="admin-subtitle">Seleccione una opción</p>
      </header>

      <div className="admin-options">
        <button 
          onClick={() => navigate('/admin/canchas')}
          className="admin-btn canchas-btn"
        >
          Mis Canchas
        </button>
        
        <button 
          onClick={() => navigate('/admin/reservas')}
          className="admin-btn reservas-btn"
        >
          Ver Reservas
        </button>
      </div>
    </div>
  );
};

export default OpcionesAdmin;