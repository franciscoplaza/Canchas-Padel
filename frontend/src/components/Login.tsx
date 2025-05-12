import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const [mensajeError, setMensajeError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      nombreUsuario,
      contraseña,
    });

    // Almacena el token en localStorage
    localStorage.setItem('token', response.data.token);
    alert(response.data.mensaje);
    // Redirigir al usuario a otra página si es necesario
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      setMensajeError(error.response?.data?.message || 'Ocurrió un error');
    } else {
      setMensajeError('Error desconocido');
    }
  }
};


  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre de usuario</label>
          <input
            type="text"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar sesión</button>
      </form>
      {mensajeError && <p style={{ color: 'red' }}>{mensajeError}</p>}
    </div>
  );
};

export default Login;
