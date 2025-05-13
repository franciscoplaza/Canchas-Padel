import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import { ReservasAdmin } from './components/AdminReservas';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/reservas" element={<ReservasAdmin />} />
      </Routes>
    </Router>
  );
};

export default App;