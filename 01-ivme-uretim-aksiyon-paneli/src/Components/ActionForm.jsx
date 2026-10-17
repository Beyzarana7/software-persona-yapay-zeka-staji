import React,{useState} from 'react';
import {ArrowUpRight,Check,AlertCircle} from 'lucide-react';
import {STATUSES,PRIORITIES,DEPARTMENTS,dateAtOffset,validateAction} from '../Interfaces/action.js';
export default function ActionForm({action,onSave,onCancel}) {
  const [v,set]=useState(action?{...action}:{title:'',owner:'',department:'Üretim',status:'Planlandı',priority:'Orta',dueDate:dateAtOffset(7),description:''});
  const [error,setError]=useState('');
  function field(name){return {value:v[name],onChange:e=>set({...v,[name]:e.target.value})};}
  function submit(e){e.preventDefault();const err=validateAction(v);if(err){setError(err);return;}try{onSave(v);}catch(err){setError(err.message);}}
  return <form onSubmit={submit} className="action-form">
    <p className="form-intro">İyileştirmeyi somut bir aksiyona dönüştürün. Yıldızlı alanlar zorunludur.</p>
    <label>Aksiyon başlığı <span>*</span><input autoFocus required maxLength={100} placeholder="Örn. Montaj hattında hazırlık süresini azaltma" {...field('title')}/></label>
    <div className="form-grid"><label>Departman <span>*</span><select {...field('department')}>{DEPARTMENTS.map(s=><option key={s}>{s}</option>)}</select></label><label>Sorumlu <span>*</span><input required maxLength={60} placeholder="Ad soyad" {...field('owner')}/></label></div>
    <div className="form-grid three"><label>Durum<select {...field('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label><label>Öncelik<select {...field('priority')}>{PRIORITIES.map(s=><option key={s}>{s}</option>)}</select></label><label>Hedef tarih <span>*</span><input type="date" required {...field('dueDate')}/></label></div>
    <label>Açıklama<textarea rows={4} maxLength={1500} placeholder="Yapılacak işi, beklenen çıktıyı ve takip notlarını yazın." {...field('description')}/><small>{v.description.length} / 1500</small></label>
    {error&&<p className="form-error" role="alert"><AlertCircle size={17}/>{error}</p>}
    <div className="modal-actions"><button type="button" className="btn secondary" onClick={onCancel}>Vazgeç</button><button type="submit" className="btn primary">{action?<Check size={17}/>:<ArrowUpRight size={17}/>} {action?'Değişiklikleri kaydet':'Aksiyon oluştur'}</button></div>
  </form>;
}
