import { ToolError } from './store';
export async function readToolBody(request:Request){
 if(Number(request.headers.get('content-length')??0)>700000)throw new ToolError(413,'请求过大');
 const reader=request.body?.getReader();if(!reader)throw new ToolError(400,'请求为空');
 const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>700000){await reader.cancel();throw new ToolError(413,'请求过大');}chunks.push(value);}}
 finally{reader.releaseLock();}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ToolError(400,'请求格式不正确');}
}
