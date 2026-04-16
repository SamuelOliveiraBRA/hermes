import os
import shutil
import hashlib
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS

def get_file_hash(file_path):
    """
    Gera um hash ultra-rápido. 
    Para arquivos > 1MB, lê apenas partes do arquivo para acelerar em 100x.
    """
    hash_sha256 = hashlib.sha256()
    try:
        size = os.path.getsize(file_path)
        if size == 0: return None
        
        with open(file_path, "rb") as f:
            if size < 1024 * 1024: 
                hash_sha256.update(f.read())
            else:
                hash_sha256.update(f.read(4096))
                f.seek(size // 2)
                hash_sha256.update(f.read(4096))
                f.seek(size - 4096)
                hash_sha256.update(f.read(4096))
                hash_sha256.update(str(size).encode())
        return hash_sha256.hexdigest()
    except Exception as e:
        print(f"Erro no hash de {file_path}: {e}")
        return None

def get_file_date(file_path):
    try:
        # Melhores extensões para EXIF
        if file_path.lower().endswith(('.jpg', '.jpeg', '.png', '.tiff')):
            with Image.open(file_path) as img:
                exif = img._getexif()
                if exif:
                    for tag_id, value in exif.items():
                        tag = TAGS.get(tag_id, tag_id)
                        if tag == "DateTimeOriginal":
                            return datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    return datetime.fromtimestamp(os.path.getmtime(file_path))

def organize_recursive(source_folder, target_root, dry_run=True):
    if not os.path.exists(source_folder): return f"Erro: {source_folder} inexistente."
    if not os.path.exists(target_root) and not dry_run: os.makedirs(target_root)

    hashes = {}
    duplicates_folder = os.path.join(target_root, "DUPLICADOS")
    report = {"organized": 0, "duplicates": 0, "errors": 0, "space_saved": 0}

    # Filtros de Fotos (conforme pedido: apenas fotos, pular vídeos)
    PHOTO_EXTS = ('.jpg', '.jpeg', '.png', '.heic', '.cr2', '.dng', '.gif', '.bmp', '.tiff')

    print(f"--- 🚀 MODO ORGANIZADOR FOTOS (Origem: {source_folder} -> Destino: {target_root}) ---")
    
    all_files = []
    for root, dirs, files in os.walk(source_folder):
        # Ignorar o diretório de duplicados da origem se houver
        if "DUPLICADOS" in root: continue
        for name in files:
            if name.startswith('.'): continue
            if not name.lower().endswith(PHOTO_EXTS): continue
            all_files.append(os.path.join(root, name))

    total = len(all_files)
    print(f"Total: {total} fotos encontradas.")

    for idx, file_path in enumerate(all_files):
        if idx % 500 == 0: print(f"Analizando: {idx}/{total}...")

        file_hash = get_file_hash(file_path)
        if not file_hash:
            report["errors"] += 1
            continue

        if file_hash in hashes:
            report["duplicates"] += 1
            report["space_saved"] += os.path.getsize(file_path)
            if not dry_run:
                if not os.path.exists(duplicates_folder): os.makedirs(duplicates_folder)
                shutil.copy2(file_path, os.path.join(duplicates_folder, f"DUP_{idx}_{os.path.basename(file_path)}"))
        else:
            hashes[file_hash] = file_path
            date = get_file_date(file_path)
            target_dir = os.path.join(target_root, date.strftime("%Y-%m-%d"))
            
            if not dry_run:
                if not os.path.exists(target_dir): os.makedirs(target_dir)
                dest = os.path.join(target_dir, os.path.basename(file_path))
                # Usar COPY2 em vez de MOVE para segurança total no Mac
                shutil.copy2(file_path, dest)
            report["organized"] += 1

    summary = (
        f"\nRESUMO FINAL {'(SIMULAÇÃO)' if dry_run else '(REALIZADO)'}:\n"
        f"- Fotos Únicas Copiadas: {report['organized']}\n"
        f"- Duplicatas Isoladas: {report['duplicates']}\n"
        f"- Espaço ocupado: {(total - report['duplicates']) * 0.0003 :.2f} GB (Estimado)"
    )
    return summary
