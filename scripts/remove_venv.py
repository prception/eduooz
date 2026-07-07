from pathlib import Path
import shutil
root = Path(r'd:\Eduooz\eduooz')
venv = root / '.venv'
script = root / 'scripts' / 'update_meta.py'
if venv.exists():
    shutil.rmtree(venv)
    print('removed .venv')
else:
    print('.venv not found')
if script.exists():
    script.unlink()
    print('removed scripts/update_meta.py')
else:
    print('scripts/update_meta.py not found')
