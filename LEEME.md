# EduPan · Panel de control (PPX) — versión 3.2 (en línea: reportes diarios, pagos programados, inventario y personal)

Panel web para que la administradora de EduPan registre las ventas, la producción,
las compras a proveedores y las pérdidas de **Matriz, Sucursal 1 y Sucursal 2** (dos
panaderías y una pastelería), lleve el inventario de cada local y vea el consolidado:
ventas, costos, pérdidas, ganancia y gráficos de cómo se comporta cada sede.

Los datos se guardan en la nube (**Cloud Firestore** de Firebase) y el acceso se hace
con **Google o correo y contraseña** (Firebase Authentication), igual que Refills EC.
La página se publica en **Netlify**.

👉 **Para instalarlo, abre `GUIA-PASO-A-PASO.html`** (doble clic) y sigue los 12 pasos.

El sistema arranca **vacío**: sin productos ni reportes. En el primer ingreso de Ely
Piccinini (elypiccinini298@gmail.com) se crean los tres locales. Por defecto, Matriz y
Sucursal 1 son panaderías y Sucursal 2 es la pastelería; se cambia en **Ajustes → Locales**.

## Estructura

```
edupan-ppx/
├── index.html              Página principal (estructura HTML)
├── GUIA-PASO-A-PASO.html   Instalación: Firebase + Netlify + primer uso
├── LEEME.md                Este archivo
├── firestore.rules         Reglas de seguridad de la base de datos (se pegan en Firebase)
├── _headers                Cabeceras de seguridad para Netlify
└── assets/
    ├── css/
    │   └── styles.css      Diseño: colores, tipografía, animaciones, celular
    ├── js/
    │   ├── config.js       Empresa, administradora y configuración de Firebase
    │   ├── core.js         Formatos y reglas de negocio (cálculos, validaciones)
    │   ├── excel.js        Genera los informes en Excel (.xlsx) y lee el Excel de productos
    │   ├── catalogo-edupan.js  Los 282 productos del Excel de EduPan (28/10/2026) para la carga inicial
    │   ├── datos.js        Login (Firebase Auth) y base de datos (Firestore)
    │   └── app.js          Pantallas: login, panel, ventas, inventario (con pérdidas), productos, informes, ajustes
    └── img/
        ├── logo-light.webp Logo para fondo claro
        ├── logo-dark.webp  Logo para fondo oscuro
        ├── mark-light.webp Ícono pequeño (fondo claro)
        └── mark-dark.webp  Ícono pequeño (fondo oscuro)
```

Los archivos JavaScript se cargan en este orden: `config.js` → `core.js` → `excel.js` → `catalogo-edupan.js` → `datos.js` → `app.js`.

## Cómo se usa (lo principal)

1. **Reportes diarios → Registrar día:** local, fecha, **ingresos** y **egresos**. Cada uno se
   registra como **un solo total** o **por categoría** (ingresos: ventas de panadería,
   pastelería, pedidos…; egresos: arriendo, luz, agua, gas, insumos, transporte…).
   Al final hay una observación opcional para todo el día. En «Por categoría» se puede
   crear una categoría nueva con «+ Nueva categoría…». Se ve como una tabla del mes:
   filas = días, columnas = locales; tocar una celda abre el día para corregirlo.
   La pestaña *Categorías* sirve para renombrar, desactivar o crear categorías.
2. **Personal:** ficha de cada trabajador (local, cargo, sueldo, mensual o quincenal, fecha
   de ingreso) y qué recibe: afiliación al IESS, décimos (y si se los pagan cada mes) y
   fondos de reserva. Un trabajador sin IESS ni beneficios cuesta solo su sueldo.
   **Roles de pago** por local y período: días, horas extra, bonos, anticipos y descuentos;
   calcula el neto a recibir y el costo real. Al **aprobarlo**, su costo cuenta como egreso
   de sueldos del local (por eso los sueldos no se ponen en el reporte diario).
   Los valores de ley (salario básico 2026 = $482, % IESS) se editan en *Valores de ley*.
3. **Pagos programados:** arriendo, luz, agua, internet, facturas de proveedores… con su
   fecha, local, categoría, monto aproximado y si se repite (cada semana, 15 días, mes, año
   o una sola vez). **Desde 3 días antes** (y si ya venció), cada vez que se entra al panel
   aparece una ventana con los pagos pendientes, hasta que se toque **Registrar pago**. El
   pago queda como egreso del local en el reporte diario de esa fecha y el recordatorio
   avanza solo al siguiente período. Una campana con el número de pendientes queda arriba.
4. **Productos:** el catálogo de EduPan (ID, código de barras, categoría, marca, unidad, IVA,
   costo y precio con IVA). **Importar Excel** lee el reporte de productos del sistema de la
   empresa: agrega los nuevos, actualiza los existentes (por ID o código) y puede registrar su
   stock como conteo físico del local que elijas (es obligatorio elegirlo; los otros locales no se tocan). Todo es editable; categoría, marca y unidad aceptan
   valores nuevos y «Generar» crea un código de barras libre.
5. **Inventario:** existencias por local con búsqueda por nombre, código o ID y filtro por
   categoría; entradas, pérdidas y conteos físicos.
6. **Panel:** ingresos, egresos, **utilidad** y el local que más deja, con gráficos y el
   estado de resultados por local: **Utilidad = ingresos − egresos del día − sueldos.**
   Los sueldos salen de los roles aprobados, repartidos por días (un rol de octubre cuenta
   28/31 si se mira hasta el 28). Si hay días sin rol aprobado, se **estiman** con el costo
   mensual de cada trabajador activo y el panel lo indica; al aprobar el rol se usa el valor exacto.
7. **Informes:** Excel con *Estado de resultados* (con ingresos y egresos por categoría),
   *Reportes diarios*, *Egresos* y *Roles de pago*.

## Propuesta: registro por producto

**Resumen por producto** y **Ventas** quedan en el menú como **«Propuesta · por producto»**. *Ventas → Registrar nueva venta* funciona como una
factura: local, fecha (hoy por defecto) y los productos vendidos con su total; al
guardarla se resta del inventario. No suma en el panel principal.

## Cómo funciona el inventario (propuesta)

- Cada local tiene su propio inventario: Matriz, Sucursal 1 y Sucursal 2 nunca se mezclan.
- **Existencia = entradas − ventas confirmadas − pérdidas**, por producto y por local.
- **Conteo físico (opcional):** si cuentas lo que hay y no coincide con el sistema,
  registra el conteo. La existencia pasa a ser lo contado y queda guardada la
  diferencia (lo que falta suele ser pérdida que no se registró).
- Si un producto queda en negativo, el panel avisa: falta registrar alguna entrada.

## Qué muestra el resumen por producto (propuesta)

- **Ventas**, **Costos (egresos)** = costo de lo vendido + pérdidas, **Ganancia** =
  ventas − costos − pérdidas, y el **local con más ventas**.
- Gráficos: ventas por semana por local, participación de cada local (circular),
  de las ventas a la ganancia (cascada), rentabilidad por local, tendencia semanal
  y pérdidas por motivo. Al pasar el mouse por cada gráfico se ve el detalle.
- La ganancia no incluye arriendo, sueldos ni servicios de los locales.

## Informes en Excel

**Informes** (o el botón *Informe Excel* del panel) descarga un Excel real (.xlsx)
para revisarlo o enviárselo al jefe por correo o WhatsApp. Se elige el período,
los locales y las hojas:

| Hoja | Qué trae |
|---|---|
| Estado de resultados | Ingresos, egresos del día, sueldos, utilidad y margen por local y total; ingresos y egresos por categoría |
| Reportes diarios | Cada día: ingresos y egresos de cada local, totales y lo que queda; detalle por categoría |
| Egresos | Cada egreso con fecha, local, categoría y monto, incluidos los sueldos de los roles |
| Roles de pago | Cada trabajador: ingresos, IESS, anticipos, neto pagado, aporte patronal, beneficios y costo |
| Propuesta · … | Las hojas por producto de la versión anterior (opcionales) |

Los totales y porcentajes son fórmulas de Excel, así que se recalculan si se edita
alguna cifra. Cada hoja tiene filtros y la fila de encabezado fija.

## Dónde se guardan los datos y quién puede verlos

- **Base de datos:** Cloud Firestore (Google). Cada cambio se guarda al instante y se
  ve igual desde la computadora y el celular. Abajo a la derecha aparece
  «Guardando…» / «Guardado»; si se corta internet aparece «No se guardó».
- **Acceso:** solo correos confirmados. Ely (dueña) registra y cambia todo; los correos
  de *solo lectura* ven el panel y descargan informes. Las reglas de `firestore.rules`
  lo hacen cumplir en el servidor, no solo en la pantalla.
- **Contraseña olvidada:** «¿Olvidaste tu contraseña?» en la entrada envía un enlace al correo.
- **Respaldo:** Ajustes → Descargar respaldo, una vez por semana (el panel avisa).
  Opcional: copias automáticas de Firebase con el plan Blaze (ver la guía, paso 10).
- **Actividad:** cada registro, cambio, respaldo y acceso queda en Ajustes → Actividad,
  y no se puede borrar.

Colecciones en Firestore:

| Ruta | Contenido |
|---|---|
| `ppx/acceso` | Correos con acceso: `admins`, `lectores` y sus nombres |
| `ppx/catalogo` | Locales, categorías de ingresos y egresos, trabajadores, valores de ley, pagos programados, productos y último respaldo |
| `reportes/{id}` | Un documento por registro: reporte diario (CAJA), rol de pagos (ROL) y, en la propuesta, ventas, entradas, pérdidas y conteos |
| `auditoria/{id}` | Registro de actividad (solo se agrega) |

## Personalizar

- **Correo de la dueña:** `assets/js/config.js` **y** `firestore.rules` (deben coincidir).
- **Colores:** al inicio de `assets/css/styles.css` (sección `:root`) para el tema
  claro, y en los bloques `prefers-color-scheme: dark` y `[data-theme="dark"]` para
  el oscuro.
