from pathlib import Path
import json, hashlib, platform, warnings
import numpy as np
import pandas as pd
import sklearn
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, average_precision_score, roc_auc_score, precision_recall_curve,
    ConfusionMatrixDisplay, PrecisionRecallDisplay)

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'maintenance_output';OUT.mkdir(exist_ok=True)
FIG=OUT/'figures';FIG.mkdir(exist_ok=True)
SEED=42
# Kaynak dosyası yoksa doğrudan UCI'den indir. Sağlama toplamını doğrula.
import urllib.request, zipfile, io
source_url='https://archive.ics.uci.edu/static/public/601/ai4i+2020+predictive+maintenance+dataset.zip'
csv_path=OUT/'ai4i2020.csv'
expected_sha256='dc6630cd9b1f0f853922fad78a1b6436570d3f1ec863f1dd5c4340ac56bc8a8e'
if not csv_path.exists():
    payload=urllib.request.urlopen(source_url,timeout=60).read()
    csv_path.write_bytes(zipfile.ZipFile(io.BytesIO(payload)).read('ai4i2020.csv'))
assert hashlib.sha256(csv_path.read_bytes()).hexdigest()==expected_sha256, 'Veri sürümü beklenenden farklı.'
df=pd.read_csv(csv_path).sort_values('UDI').reset_index(drop=True)
raw_num=['Air temperature [K]','Process temperature [K]','Rotational speed [rpm]','Torque [Nm]','Tool wear [min]']
excluded=['UDI','Product ID','TWF','HDF','PWF','OSF','RNF']
def make_features(frame):
    out=frame[['Type']+raw_num].copy()
    out['Temperature gap [K]']=out['Process temperature [K]']-out['Air temperature [K]']
    out['Mechanical power [W]']=out['Torque [Nm]']*out['Rotational speed [rpm]']*2*np.pi/60
    out['Wear torque [minNm]']=out['Tool wear [min]']*out['Torque [Nm]']
    return out
X=make_features(df);y=df['Machine failure']
Xtr,Xv,Xte=X.iloc[:6000],X.iloc[6000:8000],X.iloc[8000:]
ytr,yv,yte=y.iloc[:6000],y.iloc[6000:8000],y.iloc[8000:]
nums=[c for c in X.columns if c!='Type']
def preprocessing(scaled):
    num=[('impute',SimpleImputer(strategy='median'))]
    if scaled:num.append(('scale',StandardScaler()))
    return ColumnTransformer([('numeric',Pipeline(num),nums),('category',Pipeline([
        ('impute',SimpleImputer(strategy='most_frequent')),
        ('encode',OneHotEncoder(handle_unknown='ignore',sparse_output=False))]),['Type'])])
models={
 'Çoğunluk':Pipeline([('prep',preprocessing(False)),('model',DummyClassifier(strategy='most_frequent'))]),
 'Lojistik regresyon':Pipeline([('prep',preprocessing(True)),('model',LogisticRegression(C=1,class_weight='balanced',max_iter=2000,random_state=SEED))]),
 'Random Forest':Pipeline([('prep',preprocessing(False)),('model',RandomForestClassifier(n_estimators=300,min_samples_leaf=2,max_features=1.0,class_weight='balanced_subsample',random_state=SEED,n_jobs=2))])}
thresholds=np.round(np.arange(.05,.951,.01),2)
valrows=[];val_probs={};chosen_thresholds={}
for name,model in models.items():
    model.fit(Xtr,ytr);p=model.predict_proba(Xv)[:,1];val_probs[name]=p
    if name=='Çoğunluk':t=.5
    else:
        # F1 first, then precision, then a larger threshold for deterministic ties.
        t=max(thresholds,key=lambda q:(f1_score(yv,p>=q,zero_division=0),precision_score(yv,p>=q,zero_division=0),q))
    chosen_thresholds[name]=float(t);pr=p>=t
    valrows.append({'model':name,'threshold':float(t),'f1':f1_score(yv,pr,zero_division=0),'precision':precision_score(yv,pr,zero_division=0),'recall':recall_score(yv,pr,zero_division=0),'ap':average_precision_score(yv,p)})
selected=max(valrows,key=lambda r:(r['f1'],r['precision']))['model']
# Model and thresholds are now frozen. Test data was not used for selection.
testrows=[];test_probs={}
for name,model in models.items():
    p=model.predict_proba(Xte)[:,1];test_probs[name]=p;pr=p>=chosen_thresholds[name]
    testrows.append({'model':name,'threshold':chosen_thresholds[name],
      'accuracy':accuracy_score(yte,pr),'precision':precision_score(yte,pr,zero_division=0),
      'recall':recall_score(yte,pr,zero_division=0),'f1':f1_score(yte,pr,zero_division=0),
      'ap':average_precision_score(yte,p),'roc_auc':roc_auc_score(yte,p),
      'confusion':confusion_matrix(yte,pr,labels=[0,1]).tolist()})
pd.DataFrame(testrows).drop(columns='confusion').to_csv(OUT/'test_metrics.csv',index=False)
selected_p=test_probs[selected];pred=selected_p>=chosen_thresholds[selected]
err=df.iloc[8000:].copy();err['probability']=selected_p;err['prediction']=pred.astype(int)
err['error_type']=np.select([(yte.to_numpy()==1)&(~pred),(yte.to_numpy()==0)&pred],['FN','FP'],default='correct')
err.to_csv(OUT/'test_predictions.csv',index=False)
failure_modes={}
for col in ['TWF','HDF','PWF','OSF','RNF']:
    mask=(err[col]==1)&(err['Machine failure']==1)
    failure_modes[col]={'positive_rows':int(mask.sum()),'missed':int((mask&(err['prediction']==0)).sum())}

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'axes.titleweight':'bold','savefig.facecolor':'white','axes.labelcolor':'#193B45'})
green='#147D83';orange='#D87A43';navy='#193B45'
def save(name):plt.savefig(FIG/name,dpi=180,bbox_inches='tight');plt.close()
fig,ax=plt.subplots(figsize=(6.4,3.6));cts=ytr.value_counts().reindex([0,1]);bars=ax.bar(['Arıza yok','Arıza var'],cts,color=[green,orange]);ax.bar_label(bars,padding=4);ax.set_ylabel('Kayıt sayısı');ax.set_ylim(0,6500);ax.set_title('Eğitim bölümünde sınıf dağılımı');save('eda_class.png')
fig,ax=plt.subplots(figsize=(6.4,3.6));ax.boxplot([Xtr.loc[ytr==k,'Torque [Nm]'] for k in [0,1]],tick_labels=['Arıza yok','Arıza var'],patch_artist=True,boxprops={'facecolor':'#B3D9D7'},medianprops={'color':orange});ax.set_ylabel('Tork (Nm)');ax.set_title('Arıza sınıfına göre tork');save('eda_torque.png')
fig,ax=plt.subplots(figsize=(6.4,3.6))
for k,lab,col,alpha in [(0,'Arıza yok',green,.18),(1,'Arıza var',orange,.8)]:
 mask=ytr==k;ax.scatter(Xtr.loc[mask,'Temperature gap [K]'],Xtr.loc[mask,'Rotational speed [rpm]'],s=10 if k==0 else 20,c=col,alpha=alpha,label=lab,rasterized=True)
ax.set_xlabel('Proses - hava sıcaklığı (K)');ax.set_ylabel('Dönüş hızı (rpm)');ax.set_title('Sıcaklık farkı ve dönüş hızı');ax.legend(frameon=False);save('eda_thermal.png')
fig,ax=plt.subplots(figsize=(5.2,3.8));ConfusionMatrixDisplay.from_predictions(yte,pred,labels=[0,1],display_labels=['Arıza yok','Arıza var'],cmap='Blues',colorbar=False,ax=ax);ax.set_title('Seçilen model / Test hata matrisi');ax.set_xlabel('Tahmin');ax.set_ylabel('Gerçek');save('confusion.png')
fig,ax=plt.subplots(figsize=(6,3.8))
for name in ['Lojistik regresyon','Random Forest']:PrecisionRecallDisplay.from_predictions(yte,test_probs[name],name=name,ax=ax)
ax.axhline(yte.mean(),ls='--',color='grey',label=f'Arıza oranı: {yte.mean():.3f}');ax.set_xlabel('Duyarlılık (recall)');ax.set_ylabel('Kesinlik (precision)');ax.set_title('Test precision-recall eğrileri');ax.legend(fontsize=9);save('pr_curve.png')

summary={'versions':{'python':platform.python_version(),'numpy':np.__version__,'pandas':pd.__version__,'sklearn':sklearn.__version__},'data_sha256':hashlib.sha256((OUT/'ai4i2020.csv').read_bytes()).hexdigest(),
 'shape':list(df.shape),'missing':int(df.isna().sum().sum()),'duplicates':int(df.duplicated().sum()),'unique_id':bool(df.UDI.is_unique),'target_counts':{str(k):int(v) for k,v in y.value_counts().items()},
 'splits':{name:{'n':len(yy),'positive':int(yy.sum()),'udi_start':int(df.iloc[idx[0]].UDI),'udi_end':int(df.iloc[idx[-1]].UDI)} for name,yy,idx in [('train',ytr,range(0,6000)),('validation',yv,range(6000,8000)),('test',yte,range(8000,10000))]},
 'features':list(X.columns),'excluded':excluded,'validation':valrows,'selected':selected,'test':testrows,'failure_modes':failure_modes,
 'feature_duplicate_rows':int(df[['Type']+raw_num].duplicated().sum()),'mode_target_disagreements':int(((df[['TWF','HDF','PWF','OSF','RNF']].max(axis=1))!=y).sum()),
 'false_negative_ids':err.loc[err.error_type=='FN','UDI'].astype(int).tolist(),
 'false_positive_ids':err.loc[err.error_type=='FP','UDI'].astype(int).tolist()}
(OUT/'results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False,indent=2))
