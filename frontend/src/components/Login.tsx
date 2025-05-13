import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Asegúrate de crear este archivo CSS

const Login: React.FC = () => {
  const [correo, setCorreo] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      if (data.usuario.rol === 'admin') {
        navigate('/admin/reservas');
      } else {
        navigate('/mis-reservas');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="correo" className="form-label">Correo Electrónico</label>
            <input
              id="correo"
              type="email"
              className="form-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="tu@correo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contraseña" className="form-label">Contraseña</label>
            <input
              id="contraseña"
              type="password"
              className="form-input"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <span>¿No tienes cuenta? </span>
          <Link to="/registro" className="register-link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;