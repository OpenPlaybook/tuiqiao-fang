import {DEMO} from './game/demo';
import FilmTest from './film/FilmTest';
import {useEffect,useState} from 'react';
import {useData,useOperation} from '@/src/shared/grain-flow/react';
import {DataReadStateRenderer} from '@/src/shared/grain-flow/data-read-state-renderer';
import {DataWriteStateRenderer} from '@/src/shared/grain-flow/data-write-state-renderer';
import type {ClassroomConfig,ToolContext} from './game/api';
import {useGame,observeClassroom,isOfflineTeaching,isOpen,getState} from './game/store';
import {TopBar,FlyLayer,Toasts,AttentionOverlay} from './components/ui';
import {JoinPage,MePage} from './pages/pages';
import {StoryMap} from './pages/story';
import Teacher from './teacher/Teacher';
import {PLAY_BY_ID} from './shared/play';
import PlayerPage from './pages/player';
function useHash(){
 const [route,setRoute]=useState(()=>location.hash.slice(1)||'/');
 useEffect(()=>{const update=()=>{setRoute(location.hash.slice(1)||'/');window.scrollTo(0,0);};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
 return route;
}
function Game(){
 const route=useHash(),player=useGame(s=>s.player),isTeacher=!DEMO&&route.startsWith('/teacher');
 const synchronization=useOperation('tuiqiao.sync');
 const classroom=useData<ClassroomConfig>(isTeacher||DEMO?null:'tuiqiao.classroom');
 useEffect(()=>isTeacher?undefined:observeClassroom(),[isTeacher]);
 if(isTeacher)return <Teacher/>;
 if(!player)return <JoinPage/>;
 const parts=route.split('/').filter(Boolean),cid=(parts[1]??'').split('?')[0];
 const playing=parts[0]==='c'&&PLAY_BY_ID[cid];
 const page=playing&&isOpen(getState(),cid)?<PlayerPage key={route} id={cid}/>:parts[0]==='me'?<MePage/>:<StoryMap/>;
 const renderGame=()=> <DataWriteStateRenderer result={synchronization} renderData={({contentProps})=><div {...contentProps} className={`${playing?'h-full overflow-hidden':'min-h-full pb-16'} ${contentProps.className??''}`}><TopBar/>{page}<FlyLayer/><AttentionOverlay/></div>}/>;
 return DEMO||isOfflineTeaching()?renderGame():<DataReadStateRenderer result={classroom} renderData={renderGame}/>;
}
function Entry(){const route=useHash();const context=useData<ToolContext>(!DEMO&&route==='/'?'tuiqiao.context':null);if(DEMO||route!=='/')return <Game/>;return <DataReadStateRenderer result={context} renderData={v=>v.isTeacher?<Teacher/>:<Game/>}/>;}
export default function App(){const route=useHash();if(route.startsWith('/filmtest'))return <FilmTest/>;return <><Entry/><Toasts/></>;}
