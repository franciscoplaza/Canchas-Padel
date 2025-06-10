// frontend/src/App.tsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MisReservas from './components/MisReservas';
import AdminReservas from './components/AdminReservas';
import Canchas from './components/Canchas';
import OpcionesAdmin from './components/OpcionesAdmin';
import CrearReserva from './components/CrearReserva';
import OpcionesUsuario from './components/OpcionesUsuario';
import GestionarEquipamiento from './components/GestionarEquipamiento';

//----------------------------
import Registro from './components/Registro';
//------------------------
import SaldoUsuario from './components/SaldoUsuario';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/registro" element={<Registro />} />

          <Route path="/login" element={<Login />} />
          <Route path="/usuario" element={<OpcionesUsuario />} />
          <Route path="/reservar-cancha" element={<CrearReserva />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/saldo" element={<SaldoUsuario />} />
          <Route path="/admin" element={<OpcionesAdmin />} />
          <Route path="/admin/reservas" element={<AdminReservas />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/admin/canchas" element={<Canchas />} />
          <Route path="/admin/equipamiento" element={<GestionarEquipamiento />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;