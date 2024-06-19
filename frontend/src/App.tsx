import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
function App() {
    // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // const [user, setUser] = useState<{ id: string; name: string } | null>(null);

    // const handleSignIn = (token: string, user: { id: string; name: string }) => {
  
    //     localStorage.setItem('authToken', token);
    //     setUser(user);
    //     setIsAuthenticated(true);
    // };

    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login/>} />
                </Routes>
            </BrowserRouter>
            {/* {isAuthenticated && <div>Welcome, {user?.name}!</div>} */}
        </div>
    );
}

export default App;
