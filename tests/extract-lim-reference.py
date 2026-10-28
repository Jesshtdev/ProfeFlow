"""Read-only reference extraction. Replaces every identity and feedback with fictional data."""
import json
import sys
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
workbook = openpyxl.load_workbook(source, data_only=True, read_only=True)
ids = [str(row[0]) for row in list(workbook['ACP1'].values)[2:] if row[0] is not None]
fictional = {key: str(10001 + i) for i, key in enumerate(ids)}
tables = []
for name in ['P1', 'ACP1', 'Moodle', 'CONFIG']:
    rows = [list(row) for row in workbook[name].values]
    if name == 'CONFIG':
        pass
    elif name == 'Moodle':
        for row in rows[1:]:
            old = str(row[0])
            if old not in fictional:
                continue
            fake = fictional[old]
            row[0:7] = [fake, 'Alumno ' + fake, 'Sintético', fake, 'Institución de prueba', '', fake + '@example.test']
            for i, header in enumerate(rows[0]):
                if header and 'retroalimentaci' in str(header).lower() and row[i]:
                    row[i] = 'Retroalimentación histórica de prueba.'
    else:
        for row in rows[2:]:
            old = str(row[0])
            if old in fictional:
                row[0:5] = [fictional[old], 'Sintético', '', 'Alumno ' + fictional[old], 'ACTIVO']
    tables.append({'name': name, 'rows': rows})
output = Path('tests/fixtures/historical-lim.json')
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(tables, ensure_ascii=False, indent=2), encoding='utf-8')
print('Sanitized reference: 14 fictional identities, 8 activities; original remains unchanged.')
