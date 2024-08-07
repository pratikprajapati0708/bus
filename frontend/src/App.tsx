import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ResetPassword } from './pages/ResetPassword';
import SeatLayout from './pages/SeatLayout';
import { Navbar } from './pages/NavigationBar';

function AppContent() {
    const location = useLocation();
    const excludeNavbarPaths = ['/login', '/register', '/resetpassword'];

    return (
        <>
            {!excludeNavbarPaths.includes(location.pathname) && <Navbar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/resetpassword" element={<ResetPassword />} />
                <Route path="/seatlayout" element={<SeatLayout />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
