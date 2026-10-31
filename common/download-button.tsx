'use client';
import {useRef,useState,type ReactNode} from 'react';
import {downloadRemoteFile} from '@/src/shared/download';
import {localErrorMessage} from '@/src/shared/server-error';
import {useToast} from '@/src/shared/components/toast/toast-provider';

export function ToolDownloadButton({url,fileName,className,children}:{url:string;fileName:string;className?:string;children:ReactNode}){
 const running=useRef(false),[busy,setBusy]=useState(false),{showToast}=useToast();
 const download=async()=>{
  if(running.current)return;running.current=true;setBusy(true);
  try{await downloadRemoteFile(url,fileName);}
  catch(error){const message=localErrorMessage(error,'下载失败，请重试');if(message)showToast(message,{kind:'error'});}
  finally{running.current=false;setBusy(false);}
 };
 return <button type="button" disabled={busy} aria-busy={busy} className={className} onClick={()=>void download()}>{children}</button>;
}
