"""Read the private ZIP in memory; emit only structural, synthetic fixtures.
Never extracts the archive, copies names, emails, IDs or personal feedback.
Usage: bundled-python tests/extract-list-structures.py <private-zip>
"""
import io, json, re, sys, zipfile
from pathlib import Path
import openpyxl

archive=zipfile.ZipFile(sys.argv[1]);out=[]
for filename in archive.namelist():
    if not filename.endswith(('.xlsm','.xlsx')): continue
    book=openpyxl.load_workbook(io.BytesIO(archive.read(filename)),data_only=True)
    if filename.endswith('.xlsm'):
        group=filename.removeprefix('Lista_').removesuffix('.xlsm');tables=[]
        for sheetname in ['P1','ACP1']:
            sheet=book[sheetname];header=[c.value for c in sheet[2]]
            selected=[i for i,v in enumerate(header) if v and (re.match(r'^(teoria|practica|criterio \d+)$',str(v),re.I) if sheetname=='P1' else re.match(r'^[PT]\d+$',str(v),re.I))]
            maximum=[sheet.cell(1,i+1).value for i in selected]
            rows=[[sheet.cell(1,1).value,None]+maximum,['ID_Alumno','Nombre']+[header[i] for i in selected]]
            for n in range(3):
                rows.append([str(10001+n),'Alumno ficticio '+str(n+1)]+[sheet.cell(n+3,i+1).value for i in selected])
            tables.append({'name':sheetname,'rows':rows})
        cfg=book['CONFIG'];aliases=[]
        for row in cfg.iter_rows(values_only=True):
            for i,v in enumerate(row[:-1]):
                if isinstance(v,str) and re.fullmatch(r'[PT]\d+',v) and row[i+1]:aliases.append(['','',v,str(row[i+1]),row[i+2] if len(row)>i+2 else 1])
        tables.append({'name':'CONFIG','rows':[['Grupo',group]]+aliases})
        if 'Examen Practico' in book:
            detail=book['Examen Practico'];headers=[c.value for c in detail[1]];cols=[i for i,v in enumerate(headers) if v and re.search(r'/\d+',str(v)) and not re.search('total',str(v),re.I)]
            tables.append({'name':'Examen Practico','rows':[['ID','Alumno']+[headers[i] for i in cols]+['Retroalimentación']]+[[str(10001+n),'Alumno ficticio '+str(n+1)]+[0 if n==1 else float(re.search(r'/(\d+)',headers[i]).group(1)) for i in cols]+['Comentario ficticio'] for n in range(3)]})
            # The original adjustment values live in otherwise unnamed F, not CAL.
            original=book['P1'];bonuses=[original.cell(r,6).value for r in range(3,original.max_row+1) if original.cell(r,6).value==0.5]
            tables.append({'name':'Ajustes de referencia','rows':[['ID_Alumno','Nombre','Teoría','Práctica','Bonificación'],*[[str(10001+n),'Alumno ficticio '+str(n+1),18,20,b] for n,b in enumerate(bonuses)]]})
        out.append({'group':group,'tables':tables})
    else:
        sheet=book.active;header=[c.value for c in sheet[1]];cols=[i for i,v in enumerate(header) if v and str(v).startswith(('Tarea:','Actividad:')) and 'Retroaliment' not in str(v)]
        out.append({'group':'LEX-1A' if 'LEX' in filename else 'CDI-1J','moodle':True,'tables':[{'name':'Moodle','rows':[['ID_Alumno','Nombre']+[header[i] for i in cols]]+[[str(10001+n),'Alumno ficticio '+str(n+1)]+[None if n==1 else '-' if n==2 else 0 for _ in cols] for n in range(3)]}]})
target=Path('tests/fixtures/list-structures.json');target.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Anonymized structural fixtures:',len(out),'files; no original identities or feedback retained.')
