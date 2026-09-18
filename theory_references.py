"""Serve only indexed literature, with cached ZIPs for multi-paper groups."""
from __future__ import annotations

import hashlib
import json
import os
import re
import tempfile
import zipfile
from pathlib import Path
from threading import Lock

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / '知识库' / '参考文献'
MANIFEST = ROOT / '知识库' / '参考文献索引.json'
CACHE = ROOT / '.runtime' / 'reference-downloads'
_lock = Lock()
_manifest_stamp = None
_entries = {}


def clean_reference_name(name):
    """Remove list numbering, preserving meaningful titles such as 20世纪…."""
    cleaned = re.sub(r'^\s*(?:[（(\[【]\d+[）)\]】]\s*|\d+\s*[、.．。_-]\s*)(?=\S)', '', name)
    return cleaned if cleaned and not cleaned.startswith('.') else name


def get_entry(entry_id):
    global _manifest_stamp, _entries
    with _lock:
        stamp = MANIFEST.stat().st_mtime_ns
        if stamp != _manifest_stamp:
            data = json.loads(MANIFEST.read_text(encoding='utf-8'))
            _entries = {entry['id']: entry for entry in data['groups']}
            _manifest_stamp = stamp
        if entry_id not in _entries:
            raise KeyError(entry_id)
        return _entries[entry_id]


def prepare_download(entry_id):
    entry = get_entry(entry_id)
    sources = []
    for item in entry['files']:
        path = (SOURCE / item['path']).resolve()
        if not path.is_relative_to(SOURCE.resolve()):
            raise ValueError('Reference path is outside the literature directory')
        if not path.is_file():
            raise FileNotFoundError(item['name'])
        sources.append(path)
    if not sources:
        raise FileNotFoundError('No literature files in this group')
    if len(sources) == 1:
        mime = 'application/pdf' if sources[0].suffix.lower() == '.pdf' else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        return sources[0], clean_reference_name(entry['filename']), mime
    signature = hashlib.sha256(json.dumps([(str(p), p.stat().st_size, p.stat().st_mtime_ns, clean_reference_name(p.name)) for p in sources]).encode()).hexdigest()[:24]
    CACHE.mkdir(parents=True, exist_ok=True)
    target = CACHE / f'{entry_id}-{signature}.zip'
    if not target.exists():
        fd, temp_name = tempfile.mkstemp(dir=CACHE, suffix='.tmp')
        os.close(fd)
        try:
            with zipfile.ZipFile(temp_name, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
                used = set()
                for path in sources:
                    base_name = clean_reference_name(path.name)
                    name, suffix = base_name, 2
                    while name.casefold() in used:
                        name = f'{Path(base_name).stem}（{suffix}）{path.suffix}'
                        suffix += 1
                    used.add(name.casefold())
                    archive.write(path, arcname=name)
            os.replace(temp_name, target)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
    return target, clean_reference_name(entry['filename']), 'application/zip'
