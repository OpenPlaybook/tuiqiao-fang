import { useEffect, useState } from 'react';
import { useGame, pollConfig, syncNow } from './game/store';
import { TopBar, FlyLayer, Toasts, AttentionOverlay } from './components/ui';
import { JoinPage, MePage } from './pages/pages';
import { StoryMap } from './pages/story';
import Teacher from './teacher/Teacher';
import { DEMO } from './game/demo';
import { PLAY_BY_ID } from './shared/play';
import PlayerPage from './pages/player';
import FilmTest from './film/FilmTest';

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
  const isTeacher = !DEMO && route.startsWith('/teacher');
  useEffect(() => {
    if (isTeacher) return;
    pollConfig();
    const a = setInterval(pollConfig, 3000);
    const b = setInterval(syncNow, 15000);
    const onHide = () => syncNow();
    window.addEventListener('beforeunload', onHide);
    return () => { clearInterval(a); clearInterval(b); window.removeEventListener('beforeunload', onHide); };
  }, [isTeacher]);
  if (route.startsWith('/filmtest')) return <FilmTest />; // 分镜联系表（检查画面用）
  if (isTeacher) return <Teacher />;
  if (!player) return <JoinPage />;
  const parts = route.split('/').filter(Boolean);
  const cid = (parts[1] ?? '').split('?')[0];
  const page = parts[0] === 'c' && PLAY_BY_ID[cid] ? <PlayerPage key={route} id={cid} /> : parts[0] === 'me' ? <MePage /> : <StoryMap />;
  return (
    <div className={parts[0] === 'c' && PLAY_BY_ID[cid] ? 'h-full overflow-hidden' : 'min-h-full pb-16'}>
      <TopBar />
      {page}
      <FlyLayer />
      <Toasts />
      <AttentionOverlay />
    </div>
  );
}
