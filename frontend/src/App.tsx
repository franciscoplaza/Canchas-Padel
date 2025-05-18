// frontend/src/App.tsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MisReservas from './components/MisReservas';
import AdminReservas from './components/AdminReservas';
import Registro from './components/Registro';
// 👇 Agrega esto
import Reservar from './components/Reservar';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/admin/reservas" element={<AdminReservas />} />
          {/* 👇 Ruta para el formulario de reserva */}
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
