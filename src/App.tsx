import './App.css';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <AppRouter />
      </PatientProvider>
    </AuthProvider>
  );
}

export default App;
