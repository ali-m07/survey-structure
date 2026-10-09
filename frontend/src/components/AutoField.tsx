import {useEffect,useRef,useState} from 'react';
export function AutoField({value,onSave,label,multiline=false,disabled=false}:{value:string;onSave:(v:string)=>Promise<void>;label:string;multiline?:boolean;disabled?:boolean}){
 const [draft,setDraft]=useState(value);const [status,setStatus]=useState('');const timer=useRef<ReturnType<typeof setTimeout>>();const sequence=useRef(Promise.resolve());
 useEffect(()=>{setDraft(value);},[value]);useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const change=(v:string)=>{setDraft(v);setStatus('ذخیره نشده');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{setStatus('در حال ذخیره…');sequence.current=sequence.current.catch(()=>{}).then(()=>onSave(v)).then(()=>setStatus('ذخیره شد')).catch(e=>setStatus(`خطا: ${String(e)}`));},900);};
 const props={value:draft,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>change(e.target.value),disabled,className:'block border p-2 rounded w-full'};
 return <label className="block">{label}{multiline?<textarea {...props}/>:<input {...props}/>}<span role="status" className="text-xs text-gray-600">{status}</span></label>;
}
