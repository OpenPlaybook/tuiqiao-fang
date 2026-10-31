import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import {GrainFlowContext} from '@/src/shared/grain-flow/internal-context';
import {flow} from './game/api';
import { ToastProvider } from '@/src/shared/components/toast/toast-provider';

// ToastProvider shares service failures with the app host and retains local action feedback.
window.addEventListener('pagehide',()=>{void flow.dispose();},{once:true});
const app=<GrainFlowContext.Provider value={flow}><App /></GrainFlowContext.Provider>;
createRoot(document.getElementById('root')!).render(<StrictMode><ToastProvider>{app}</ToastProvider></StrictMode>);
