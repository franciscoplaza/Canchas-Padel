// frontend/src/components/SaldoUsuario.tsx
"use client"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SaldoUsuario.css";

interface Transaccion {
  tipo: 'carga' | 'gasto';
  monto: number;
  descripcion: string;
  fecha: string | Date;
}

const SaldoUsuario = () => {
  const [saldo, setSaldo] = useState(0);
  const [monto, setMonto] = useState("");
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchSaldo = async () => {
      try {
        const [saldoRes, transaccionesRes] = await Promise.all([
          fetch("http://localhost:3000/saldo", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/saldo/transacciones", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!saldoRes.ok || !transaccionesRes.ok) {
          throw new Error("Error al obtener datos de saldo");
        }

        const saldoData = await saldoRes.json();
        const transaccionesData = await transaccionesRes.json();

        setSaldo(saldoData.saldo);
        setTransacciones(transaccionesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchSaldo();
  }, [navigate]);

  const handleCargarSaldo = async () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingrese un monto válido mayor a 0");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/saldo/cargar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ monto: montoNum }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar saldo");
      }

      const data = await response.json();
      setSaldo(data.saldo);
      setTransacciones(data.transacciones);
      setMonto("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (loading) {
    return <div>Cargando información de saldo...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="saldo-container">
      <h2>Mi Saldo</h2>
      <div className="saldo-display">
        <span className="saldo-monto">${saldo.toLocaleString()}</span>
      </div>

      <div className="cargar-saldo-form">
        <h3>Cargar Saldo</h3>
        <input
          type="number"
          min="1"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="Monto a cargar"
        />
        <button onClick={handleCargarSaldo}>Cargar</button>
      </div>

      <div className="transacciones-container">
        <h3>Historial de Transacciones</h3>
        {transacciones.length > 0 ? (
          <ul className="transacciones-list">
            {transacciones.map((trans, index) => (
              <li key={index} className={`transaccion ${trans.tipo}`}>
                <div className="transaccion-info">
                  <span className="transaccion-tipo">{trans.tipo}</span>
                  <span className="transaccion-monto">
                    {trans.tipo === 'carga' ? '+' : '-'}${trans.monto.toLocaleString()}
                  </span>
                </div>
                <div className="transaccion-detalle">
                  <span className="transaccion-desc">{trans.descripcion}</span>
                  <span className="transaccion-fecha">
                    {new Date(trans.fecha).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay transacciones registradas</p>
        )}
      </div>
    </div>
  );
};

export default SaldoUsuario;