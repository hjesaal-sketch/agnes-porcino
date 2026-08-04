import sqlite3
from sqlalchemy import create_engine, text

# Conexión SQLite
sqlite_conn = sqlite3.connect("granjas.db")
sqlite_cursor = sqlite_conn.cursor()

# Conexión Supabase
supabase_url = "postgresql://postgres:V1C2FBGDT6g3tPc2@db.fstqqslcbcbbjksaydte.supabase.co:5432/postgres"
engine = create_engine(supabase_url)

# Obtener tablas
sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
tablas = sqlite_cursor.fetchall()

for (nombre,) in tablas:
    print(f"Migrando {nombre}...")
    
    # Obtener estructura
    sqlite_cursor.execute(f"PRAGMA table_info({nombre})")
    columnas = [col[1] for col in sqlite_cursor.fetchall()]
    
    # Leer datos
    datos = sqlite_conn.execute(f"SELECT * FROM {nombre}").fetchall()
    
    if not datos:
        print(f"  {nombre} está vacía")
        continue
    
    # Insertar
    for fila in datos:
        placeholders = ','.join(['%s'] * len(fila))
        sql = f"INSERT INTO {nombre} VALUES ({placeholders})"
        with engine.connect() as conn:
            conn.execute(text(sql), fila)
            conn.commit()
    
    print(f"  ✓ {len(datos)} filas migradas")

print("¡Completado!")