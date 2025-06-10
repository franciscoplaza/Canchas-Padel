//src/components/Registro.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Registro.css"

const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    contraseña: "",
    rut: "",
    correo: "",
    nombre: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("http://localhost:3000/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error en el registro")
      }

      navigate("/login") // Redirige al login después del registro exitoso
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  return (
    <div className="registro-container">
      <div className="registro-card">
        <div className="registro-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="registro-title">Crear una cuenta</h1>
          <p className="registro-subtitle">Continuar a UCN Reservas</p>
        </div>

        {error && <div className="registro-error">{error}</div>}

        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="form-input"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombreUsuario" className="form-label">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              className="form-input"
              value={formData.nombreUsuario}
              onChange={handleChange}
              required
              placeholder="Elige un nombre de usuario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rut" className="form-label">
              RUT
            </label>
            <input
              type="text"
              id="rut"
              name="rut"
              className="form-input"
              value={formData.rut}
              onChange={handleChange}
              required
              placeholder="12345678-9"
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Correo electrónico
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              className="form-input"
              value={formData.correo}
              onChange={handleChange}
              required
              placeholder="tu@ucn.cl"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contraseña" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              id="contraseña"
              name="contraseña"
              className="form-input"
              value={formData.contraseña}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="registro-actions">
            <Link to="/login" className="signin-link">
              Iniciar sesión
            </Link>
            <button type="submit" className="registro-button">
              Registrarse
            </button>
          </div>
        </form>

        <div className="registro-footer">
          <p>Universidad Católica del Norte</p>
          <p>Sistema de reserva de canchas deportivas</p>
        </div>
      </div>
    </div>
  )
}

export default Registro
