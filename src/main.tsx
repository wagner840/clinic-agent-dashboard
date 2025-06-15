
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Força a recarga da aplicação para aplicar novas configurações.
createRoot(document.getElementById("root")!).render(<App />);
