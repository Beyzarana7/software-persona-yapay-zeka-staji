/** @typedef {'Planlandı'|'Devam ediyor'|'Tamamlandı'} ActionStatus */
/** @typedef {'Yüksek'|'Orta'|'Düşük'} ActionPriority */
/** @typedef {{id:string,title:string,department:string,owner:string,status:ActionStatus,priority:ActionPriority,dueDate:string,description:string,createdAt:string,updatedAt:string}} Action */
export const STATUSES = ['Planlandı','Devam ediyor','Tamamlandı'];
export const PRIORITIES = ['Yüksek','Orta','Düşük'];
export const DEPARTMENTS = ['Üretim','Kalite','Bakım','Enerji','Lojistik'];
export const STORAGE_KEY = 'ivme.actions.v1';
export function localDate(date=new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function dateAtOffset(days) { const d=new Date();d.setDate(d.getDate()+days);return localDate(d); }
export function isValidDate(s) {if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&localDate(d)===s;}
export function validateAction(a) {
  if(!a || typeof a!=='object')return 'Aksiyon bilgileri eksik.';
  if(typeof a.title!=='string'||!a.title.trim()||a.title.trim().length>100)return 'Başlık 1–100 karakter olmalı.';
  if(typeof a.owner!=='string'||!a.owner.trim()||a.owner.trim().length>60)return 'Sorumlu adı 1–60 karakter olmalı.';
  if(!DEPARTMENTS.includes(a.department))return 'Geçerli bir departman seçin.';
  if(!STATUSES.includes(a.status))return 'Geçerli bir durum seçin.';
  if(!PRIORITIES.includes(a.priority))return 'Geçerli bir öncelik seçin.';
  if(typeof a.dueDate!=='string'||!isValidDate(a.dueDate))return 'Geçerli bir hedef tarih girin.';
  if(typeof a.description!=='string'||a.description.length>1500)return 'Açıklama en fazla 1500 karakter olmalı.';
  return '';
}
export function validRecords(data) {
  return Array.isArray(data)&&data.length<=5000&&data.every(a=>!validateAction(a)&&typeof a.id==='string'&&a.id.length>0&&typeof a.createdAt==='string'&&typeof a.updatedAt==='string')&&new Set(data.map(a=>a.id)).size===data.length;
}
export function createAction(values, id=crypto.randomUUID(), now=new Date().toISOString()) {
  const a={...values,title:values.title?.trim(),owner:values.owner?.trim(),description:values.description?.trim()??'',id,createdAt:now,updatedAt:now};
  const error=validateAction(a);if(error)throw new Error(error);return a;
}
export function updateAction(records,id,values,now=new Date().toISOString()) {
  if(!records.some(a=>a.id===id))throw new Error('Bu aksiyon artık bulunmuyor. Listeyi yenileyin.');
  return records.map(a=>{if(a.id!==id)return a;const n={...a,...values,id:a.id,createdAt:a.createdAt,updatedAt:now};n.title=n.title.trim();n.owner=n.owner.trim();n.description=n.description.trim();const e=validateAction(n);if(e)throw new Error(e);return n;});
}
export const overdue=(a,today=localDate())=>a.status!=='Tamamlandı'&&a.dueDate<today;
export function summary(records,today=localDate()) {const completed=records.filter(a=>a.status==='Tamamlandı').length;return {total:records.length,active:records.length-completed,completed,overdue:records.filter(a=>overdue(a,today)).length,rate:records.length?Math.round(completed/records.length*100):0};}
export function filterActions(records,{search='',status='',priority='',department='',view='overview',sort='due'}={},today=localDate()) {
  const needle=search.trim().toLocaleLowerCase('tr-TR');
  const result=records.filter(a=>(!needle||[a.title,a.owner,a.description,a.department].join(' ').toLocaleLowerCase('tr-TR').includes(needle))&&(!status||a.status===status)&&(!priority||a.priority===priority)&&(!department||a.department===department)&&(view!=='completed'||a.status==='Tamamlandı')&&(view!=='overdue'||overdue(a,today)));
  const ranks={'Yüksek':0,'Orta':1,'Düşük':2};
  return result.sort((a,b)=>sort==='priority'?(ranks[a.priority]-ranks[b.priority]||a.dueDate.localeCompare(b.dueDate)):sort==='newest'?b.createdAt.localeCompare(a.createdAt):a.dueDate.localeCompare(b.dueDate));
}
export function csvContent(records) {
  const safe=v=>'"'+String(/^[=+\-@\t\r]/.test(String(v))?'\''+v:v).replaceAll('"','""')+'"';
  return '\uFEFF'+[['Başlık','Departman','Sorumlu','Durum','Öncelik','Hedef tarih','Açıklama'],...records.map(a=>[a.title,a.department,a.owner,a.status,a.priority,a.dueDate,a.description])].map(r=>r.map(safe).join(';')).join('\r\n');
}
export function seedActions() {
  const seed=[
    ['Basınçlı hava kaçaklarının giderilmesi','Enerji','Elif Demir','Devam ediyor','Yüksek',-2,'Kompresör hattında tespit edilen bağlantı kaçaklarını giderin. Bakım sonrası kontrol ölçümü yapın.'],
    ['Montaj hattı 5S düzenlemesi','Üretim','Mert Kaya','Devam ediyor','Orta',2,'Montaj istasyonunda el aletlerini kullanım sırasına göre yerleştirin. Alan işaretlemelerini güncelleyin.'],
    ['Giriş kalite kontrol listesinin güncellenmesi','Kalite','Selin Aydın','Planlandı','Yüksek',4,'Kritik ölçüleri ve numune kontrol adımlarını tek bir kontrol listesinde toplayın.'],
    ['Önleyici bakım planının hazırlanması','Bakım','Can Arslan','Planlandı','Orta',7,'Pres ve konveyör için periyodik kontrol sıklıklarını belirleyin.'],
    ['İç lojistik rota standardizasyonu','Lojistik','Zeynep Eren','Tamamlandı','Düşük',-4,'Malzeme besleme güzergâhlarını belirleyin ve görsel rota kartlarını hazırlayın.'],
    ['Vardiya devir formunun standartlaştırılması','Üretim','Mert Kaya','Tamamlandı','Orta',-1,'Açık iş, duruş ve kalite notlarını içeren standart vardiya devir formu oluşturun.'],
    ['Boşta çalışma sürelerinin gözlemlenmesi','Enerji','Elif Demir','Planlandı','Orta',10,'Üç vardiyada makine bekleme sürelerini gözlemleyin. Kapatma prosedürü için ilk bulguları toplayın.'],
    ['Kritik yedek parça listesinin oluşturulması','Bakım','Can Arslan','Devam ediyor','Yüksek',-1,'Arıza halinde üretimi durdurabilecek parçaları listeleyin. Minimum stok seviyelerini değerlendirin.']
  ];
  return seed.map((r,i)=>createAction({title:r[0],department:r[1],owner:r[2],status:r[3],priority:r[4],dueDate:dateAtOffset(r[5]),description:r[6]},`demo-${i+1}`,new Date(Date.now()-(i+1)*86400000).toISOString()));
}
