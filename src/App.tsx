import { useEffect, useState } from 'react';
import { useGame, pollConfig, syncNow } from './game/store';
import { TopBar, FlyLayer, Toasts, AttentionOverlay } from './components/ui';
import { JoinPage, MapPage, MePage, StationPage } from './pages/pages';
import Teacher from './teacher/Teacher';
import type { StationId } from './shared/types';
import { ST } from './shared/adapt';

const useHash = () => {
  const [h, setH] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const f = () => { setH(window.location.hash.slice(1) || '/'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return h;
};

export default function App() {
  const route = useHash();
  const player = useGame((s) => s.player);
  const isTeacher = route.startsWith('/teacher');
  useEffect(() => {
    if (isTeacher) return;
    pollConfig();
    const a = setInterval(pollConfig, 3000);
    const b = setInterval(syncNow, 15000);
    const onHide = () => syncNow();
    window.addEventListener('beforeunload', onHide);
    return () => { clearInterval(a); clearInterval(b); window.removeEventListener('beforeunload', onHide); };
  }, [isTeacher]);
  if (isTeacher) return <Teacher />;
  if (!player) return <JoinPage />;
  const parts = route.split('/').filter(Boolean);
  const page = parts[0] === 's' && parts[1] && ST[parts[1] as StationId] ? <StationPage key={parts[1]} st={parts[1] as StationId} /> : parts[0] === 'me' ? <MePage /> : <MapPage />;
  return (
    <div className="min-h-full pb-16">
      <TopBar />
      {page}
      <FlyLayer />
      <Toasts />
      <AttentionOverlay />
    </div>
  );
}
