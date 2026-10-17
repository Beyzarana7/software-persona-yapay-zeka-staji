import React,{useEffect,useRef} from 'react';
import {X} from 'lucide-react';
export default function Modal({title,onClose,children,wide=false}) {
  const ref=useRef(null);
  useEffect(()=>{const el=ref.current;el.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=old;};},[]);
  return <dialog ref={ref} className={`modal ${wide?'wide':''}`} onCancel={e=>{e.preventDefault();onClose();}} aria-labelledby="modal-title" onClick={e=>{if(e.target===ref.current){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
    <div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Pencereyi kapat"><X size={20}/></button></div>{children}
  </dialog>;
}
