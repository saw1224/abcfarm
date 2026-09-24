# Farmacias ABC — instalación en servidor

Este paquete corresponde a la versión 32 del sistema Farmacias ABC. Incluye la aplicación, el inventario, usuarios, lectura de documentos e imágenes, fuentes de consulta configurables y base de datos persistente.

## Requisitos recomendados

- Servidor Linux Ubuntu 22.04 o 24.04.
- 2 GB de memoria RAM como mínimo; 4 GB recomendados.
- 10 GB de espacio libre.
- Docker Engine y Docker Compose.
- Dominio y certificado HTTPS si se accederá desde Internet.

## Instalación

1. Descomprime el archivo en una carpeta del servidor.
2. Abre una terminal dentro de la carpeta `Farmacias_ABC_Servidor`.
3. Copia `.env.example` con el nombre `.env`.
4. Abre `.env` y sustituye `Cambia_Esta_Clave_123!` por una contraseña privada y robusta.
5. Ejecuta:

   ```bash
   docker compose up -d --build
   ```

6. Abre `http://IP-DEL-SERVIDOR:8080`.

El usuario administrador será el correo indicado en `ADMIN_EMAIL` y la contraseña indicada en `ADMIN_PASSWORD`.

## Respaldo

Los datos quedan guardados en el volumen de Docker `farmacia_abc_data`. Incluye este volumen en el respaldo periódico del servidor. No basta con copiar solamente la carpeta de la aplicación.

## Actualización de la contraseña principal

Modifica `ADMIN_PASSWORD` en `.env` y ejecuta:

```bash
docker compose up -d
```

## Publicación segura en Internet

Para acceso público utiliza un dominio, HTTPS y un proxy inverso como Nginx, Caddy o el panel de tu proveedor. No publiques directamente el puerto 8080 sin HTTPS.

## Funciones que operan al instalarlo

- Login y administración de usuarios.
- Inventario y precios propios.
- Importación y revisión de productos desde documentos compatibles.
- Lectura de imágenes, código de barras, lote y caducidad desde el navegador.
- Filtros, ordenamiento y comparaciones guardadas por el sistema.
- Configuración de fuentes de consulta.

## Funciones que requieren servicios externos

- La búsqueda automática de precios reales en otras farmacias requiere integrar proveedores, APIs o conectores autorizados.
- La atención automática a clientes por WhatsApp requiere WhatsApp Business Platform, un número registrado, credenciales de Meta y un módulo de webhook.

El paquete deja estas integraciones pendientes; no genera precios reales de Internet ni contesta WhatsApp sin dichas credenciales y desarrollo adicional.

## Comandos útiles

Ver funcionamiento:

```bash
docker compose ps
docker compose logs -f farmacias-abc
```

Detener el sistema:

```bash
docker compose down
```

Detenerlo sin borrar datos:

```bash
docker compose stop
```

No utilices `docker compose down -v`, porque elimina el volumen que contiene la base de datos.
