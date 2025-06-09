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

  if (loading) return <div className="user-container"><p>Cargando información de saldo...</p></div>;

  return (
    <div className="user-container">
      <div className="user-content">
        <div className="user-header">
          <div className="ucn-logo">
            <span className="ucn-text">UCN</span>
            <span>Reservas</span>
          </div>
          <h1 className="user-title">Mi Saldo</h1>
          <p className="user-subtitle">Visualice y recargue su saldo</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="user-dashboard">

          <div className="user-card">
            <div className="card-icon saldo-icon">
              {/* Ícono de dinero */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                <line x1="12" y1="12" x2="12" y2="12"></line>
                <path d="M8 12h.01"></path>
                <path d="M16 12h.01"></path>
              </svg>
            </div>
            <div className="card-content">
              <h2 className="card-title">Saldo Disponible</h2>
              <p className="saldo-monto">${saldo.toLocaleString()}</p>
              <input
                type="number"
                min="1"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto a cargar"
              />
              <button onClick={handleCargarSaldo} className="user-btn reservas-btn">
                Cargar Saldo
              </button>
            </div>
          </div>

          <div className="user-card">
            <div className="card-icon">
              {/* Historial icono */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0-.51-5.5L1 10"></path>
              </svg>
            </div>
            <div className="card-content">
              <h2 className="card-title">Historial de Transacciones</h2>
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
                        <span className="transaccion-fecha">{new Date(trans.fecha).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay transacciones registradas</p>
              )}
            </div>
          </div>
        </div>

        <div className="user-actions">
          <button className="secondary-btn" onClick={() => navigate("/opciones")}>
            Volver
          </button>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            navigate("/login");
          }}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaldoUsuario;
