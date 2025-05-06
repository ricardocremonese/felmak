
import { createRoot } from 'react-dom/client'
import App from './App'
import './i18n/i18n' // Import i18n before rendering the app
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
