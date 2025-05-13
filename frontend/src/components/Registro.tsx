import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css'; // Opcional: archivo de estilos

const Registro = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    contraseña: '',
    rut: '',
    correo: '',
    nombre: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      navigate('/login'); // Redirige al login después del registro exitoso
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div className="registro-container">
      <h2>Registro de Usuario</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre Completo:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Nombre de Usuario:</label>
          <input
            type="text"
            name="nombreUsuario"
            value={formData.nombreUsuario}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>RUT:</label>
          <input
            type="text"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            required
            placeholder="12345678-9"
          />
        </div>

        <div className="form-group">
          <label>Correo Electrónico:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="submit-btn">Registrarse</button>
      </form>

      <div className="login-link">
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
      </div>
    </div>
  );
};

export default Registro;