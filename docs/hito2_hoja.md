# Hito 2 · Roses Lolas

## 1 · Tablas

| Tabla | Columnas | Relación |
|---|---|---|
| `pedidos` | `id`, `numero`, `cliente_id`, `ramo_id`, `estado`, `creado_en` | Un pedido pertenece a un cliente y un ramo; tiene una personalización y un detalle |
| `clientes` | `id`, `nombre`, `telefono`, `correo`, `creado_en` | Un cliente tiene muchos pedidos |
| `ramos` | `id`, `tamano`, `flores`, `follaje`, `extras`, `creado_en` | Un ramo pertenece a un pedido |
| `personalizaciones` | `id`, `pedido_id`, `ocasion`, `colores`, `envoltura`, `dedicatoria`, `creado_en` | Una personalización pertenece a un pedido |
| `detalles_pedido` | `id`, `pedido_id`, `preferencias`, `observaciones`, `instrucciones_armado`, `creado_en` | Un detalle pertenece a un pedido |

## 2 · Vista × consulta

| Vista | Qué pide | Tabla / consulta | Qué puede fallar | ¿Funciona ya? |
|---|---|---|---|---|
| Listado de pedidos | Pedidos y ramo personalizado | `pedidos` con relaciones, ordenados por `creado_en desc` | Sin red o Supabase pausado | Sí |
| Detalle de un pedido | Pedido, cliente, ramo, personalización y detalle | `pedidos` filtrado por `id` con relaciones | El registro no existe | Sí |
| Nuevo pedido | Validar y crear un pedido con sus entidades | `insert` en clientes, ramos, pedidos, personalizaciones y detalles | Sin sesión, política rechaza | Sí |
| Bandeja de la florista | Filtrar por estado y cambiarlo | `pedidos` donde `estado in (...)` | Política de cambio todavía no definida | Plan |
| Mis pedidos | Pedidos del usuario | `pedidos` filtrado por cliente autenticado | Falta asociar cliente a usuario | Plan |

## 3 · Matriz rol × tabla × operación

| Tabla / operación | Sin sesión | Cliente autenticado | Florista | ¿Política escrita? |
|---|---:|---:|---:|---|
| `pedidos` · leer | Sí | Sí | Sí | Sí |
| `clientes` · leer | Sí | Sí | Sí | Sí |
| `ramos` · leer | Sí | Sí | Sí | Sí |
| `personalizaciones` · leer | Sí | Sí | Sí | Sí |
| `detalles_pedido` · leer | Sí | Sí | Sí | Sí |
| `pedidos` · crear | No | Sí | Sí | Sí |
| `pedidos` · cambiar estado | No | No | Sí | Diseño |
| `personalizaciones` · crear | No | Sí | Sí | Sí |
| `detalles_pedido` · crear | No | Sí | Sí | Sí |

## 4 · Usuario de ejemplo

Crear en Supabase Auth un usuario inventado para la demostración. No se guarda aquí ninguna contraseña.

## 5 · Recuadro de cumplimiento

- [ ] Las tablas existen en Supabase y tienen datos.
- [x] Los tipos de `src/tipos.ts` tienen las mismas columnas.
- [x] El listado y el detalle están preparados para cargar desde Supabase.
- [x] El formulario valida junto al campo y conserva lo escrito.
- [x] Sin sesión el botón de crear queda bloqueado; con sesión intenta crear.
- [ ] Hay una captura de respaldo de cada demostración.

Ejecutar `docs/hito2_esquema.sql` en el SQL Editor de Supabase y configurar `.env` a partir de `.env.example`.
