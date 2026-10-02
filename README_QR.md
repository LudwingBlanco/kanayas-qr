# Kanayas v3 — pedidos por QR

## Flujo
1. El cliente entra a `index.html`.
2. Agrega comidas y puede quitar ingredientes, añadir extras y escribir notas.
3. En "Mi pedido" pulsa "Generar QR para el mesero".
4. Se genera un QR con el pedido.
5. El mesero entra a `mesero.html`, activa la cámara y escanea el QR.
6. La página del mesero muestra cliente, productos, ingredientes quitados, extras, notas y total.
7. "Enviar a cocina / imprimir" abre la impresión del pedido.

## Importante
- El sistema actual es frontend y no necesita base de datos para el flujo QR.
- El pedido viaja dentro del QR.
- Para usar la cámara, el sitio publicado debe usar HTTPS (GitHub Pages, Vercel, Netlify, hosting con SSL, etc.).
- Si después quieren una cola de pedidos compartida entre varios meseros, estados en tiempo real y cocina viendo todos los pedidos automáticamente, hace falta agregar un backend/base de datos.

## Archivos nuevos/modificados
- `index.html`: botón y modal QR + acceso a área de meseros.
- `script.js`: generación del QR a partir del carrito actual.
- `styles.css`: diseño del QR.
- `mesero.html`: página de escaneo y recepción de pedidos.
