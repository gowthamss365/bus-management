import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PassengerPortal from './pages/PassengerPortal';
import DriverCockpit from './pages/DriverCockpit';
import ManagerOCC from './pages/ManagerOCC';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/passenger/*" element={<PassengerPortal />} />
          <Route path="/driver/*" element={<DriverCockpit />} />
          <Route path="/manager/*" element={<ManagerOCC />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
