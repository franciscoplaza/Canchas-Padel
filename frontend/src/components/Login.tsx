//src/components/Login.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Login.css"

const Login: React.FC = () => {
  const [correo, setCorreo] = useState<string>("")
  const [contraseña, setContraseña] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contraseña }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión")
      }

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("usuario", JSON.stringify(data.usuario))

      if (data.usuario.rol === "admin") {
        navigate("/admin")
      } else {
        navigate("/usuario")
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error desconocido al iniciar sesión")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">Continuar a UCN Reservas</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              className="form-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="tu@ucn.cl"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contraseña" className="form-label">
              Contraseña
            </label>
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

          <div className="forgot-password">
            <Link to="/recuperar-contrasena" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="login-actions">
            <Link to="/registro" className="create-account-link">
              Crear cuenta
            </Link>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Cargando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>Universidad Católica del Norte</p>
          <p>Sistema de reserva de canchas deportivas</p>
        </div>
      </div>
    </div>
  )
}

export default Login
