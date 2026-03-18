# PRD: Analizador de Precios - Kiosco Inteligente (MVP v1)

## 1. Problema (El "Quilombo")
Reponer mercadería en Venezuela implica caminar locales mayoristas que no tienen web. El comerciante anota precios en un papel o se los acuerda de memoria, mezclando dólares, bolívares y distintas tasas de cambio. Resultado: compra mal, gasta de más y pierde tiempo.

## 2. Propuesta de Valor
Una herramienta de carga rápida que normaliza precios en diferentes monedas y tasas, permitiendo decidir dónde comprar cada producto para maximizar el ahorro en una **"Ronda de Compra"**.

## 3. Usuarios
- **Dueños de kioscos/bodegas**: Necesitan optimizar cada bolívar/dólar invertido.
- **Compradores minoristas**: Buscan los mejores precios en zonas mayoristas de alta densidad.

## 4. Requerimientos Funcionales (MVP)

### Módulo 1: Gestión de Sesión (Ronda de Compra)
- **Crear Ronda**: Definir una fecha y un nombre (ej: "Reposición Golosinas - Centro").
- **Lista de Objetivos**: Seleccionar o crear productos que se planean comprar (ej: "Doritos 45g", "Coca-Cola 1.5L").

### Módulo 2: Relevamiento de Campo (Visita a Locales)
- **Registrar Local**: Nombre del establecimiento (ej: "Mayorista El Sol").
- **Carga de Precios (Manual)**:
  - Seleccionar producto de la lista de objetivos.
  - Ingresar monto numérico.
  - Seleccionar moneda (USD, Bs, EUR).
  - Seleccionar tipo de tasa (BCV, Paralelo, USDT, Manual).

### Módulo 3: Motor Cambiario
- **Configuración de Tasas**: Definir el valor de las tasas del día para la sesión.
- **Conversión Automática**: Todo se debe poder previsualizar en una "moneda base" elegida por el usuario.

### Módulo 4: Dashboard de Decisión
- **Comparador por Producto**: Ver lista de locales con sus respectivos precios normalizados.
- **Resaltado de Ganador**: Mostrar claramente cuál local tiene el mejor precio por ítem.
- **Cálculo de Ahorro**: Total estimado de la compra si se compra todo en el lugar más barato vs. el promedio.

## 5. Requerimientos NO Funcionales
- **Mobile First**: Debe ser usable con una mano mientras se camina por un pasillo.
- **Offline First (Deseable)**: Capacidad de cargar datos sin señal y sincronizar después (los galpones suelen ser "jaulas de Faraday").
- **Simplicidad**: Carga de datos en menos de 10 segundos por producto.

## 6. Scope (Lo que NO va)
- ❌ OCR / IA de fotos (para v2).
- ❌ Red Social / Compartir precios (para v2).
- ❌ Gestión de inventario o stock.
- ❌ Integración con bancos.

## 7. Métricas de Éxito (KPIs)
- **Ahorro Real**: $\ge 8\%$ en la factura final comparado con el método anterior.
- **Eficiencia**: Reducción del $25\%$ en el tiempo de análisis post-ronda.
- **Retención**: 3 rondas completas realizadas por el usuario en el primer mes.


