import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Patient from './pages/Patient';
import Hopital from './pages/Hopital';

function App() {
  return (
    <Router>
      {/* Barre de navigation visible sur toutes les pages */}
      <nav>
        <Link to="/">Patient</Link> | <Link to="/admin">Hôpital</Link>
      </nav>

      {/* C'est ici que le contenu change en fonction du clic */}
      <Routes>
        <Route path="/" element={<Patient />} />
        <Route path="/admin" element={<Hopital />} />
      </Routes>
    </Router>
  );
}

export default App;