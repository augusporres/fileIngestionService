# Instrucciones

## Configuración del Entorno

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Editar `.env` y configurar la contraseña:**
   ```bash
   # Cambia esto por una contraseña segura
   DB_PASSWORD=YourStrongPassword123!
   ```

3. **Iniciar los servicios:**
   ```bash
   make up   
   ```

4. **Crear la base de datos:**
    Si es la primera vez se necesita crear la base de datos
   ```bash
   make create-database
   ```

5. **Reiniciar worker:**
    Solo si es la primera vez, luego de crear la base se necesita reiniciar el worker
   ```bash
   make restart-worker   
   ```

6. **Verificar la configuración:**
   ```bash
   make status
   make query-count
   ```

## Comandos Make Disponibles

```bash
make up              # Iniciar contenedores en segundo plano
make down            # Detener y eliminar contenedores
make down-volumes    # Detener y eliminar contenedores con sus volumenes
make rebuild         # Reconstruir y iniciar
make reset-full      # Borrar docker con volumenes, regenerar, crear base de datos y reiniciar worker
make status          # Mostrar estado de contenedores
make logs            # Ver logs recientes
make logs-follow     # Seguir logs en tiempo real

make generate-file   # Genera de nuevo el archivo. Requiere hacer make reset-full

make create-database # Crear base de datos y tablas
make db-healthcheck  # Verificar si la base de datos existe
make clean-database  # Borrar todos los registros de la db
make restart-worker  # Reiniciar el servicio worker

make query-count     # Contar registros totales
make query-sample    # SELECT TOP 10  de registros
make sql-shell       # Abrir una terminal SQL para queries
```

## Variables de Entorno

| Variable | Descripción | Predeterminado |
|----------|-------------|----------------|
| `DB_HOST` | Host de la base de datos | `sqlserver` |
| `DB_NAME` | Nombre de la base de datos | `ClientsDB` |
| `DB_USER` | Usuario de la base de datos | `sa` |
| `DB_PASSWORD` | Contraseña de la base de datos | *Requerida* |
| `NODE_ENV` | Entorno Node | `development` |
| `PORT` | Puerto HTTP del worker | `3000` |
| `FILE_PATH` | Input file path | `/app/challenge/input/CLIENTES_IN_0425.dat` |



## Monitoreo y Métricas

### Endpoints Disponibles

#### `/health` - Estado del servicio
```bash
curl http://localhost:3000/health

```

Retorna:
- Estado del servicio (healthy/unhealthy)
- Conexión a la base de datos
- Progreso del procesamiento (%)
- Líneas procesadas e insertadas
- Líneas corruptas
- Métricas de CPU y memoria


## Potenciales Mejoras
- Incrementar batch size, para guardar los records en la db de a grupos más grandes.
- Paralelizar el procesamiento dividiendo el archivo en chunks.
    