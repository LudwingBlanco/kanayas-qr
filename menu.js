/* =====================================================================
   KANAYAS · MENÚ Y DATOS DEL NEGOCIO (edita solo este archivo)
   • Precio: cambia el número de "precio" (sin puntos).
   • Producto nuevo: copia un bloque { nombre: ... } dentro de "productos".
   • Sección nueva: copia un bloque { categoria, productos } completo.
   • Foto: guárdala en /img y escribe su ruta en "foto".
   • Ingredientes: lista de textos "emoji Nombre". El cliente puede quitar
     cualquiera de ellos y eso aparece en el pedido de WhatsApp.
   • Extras (opcional): { n: "Nombre", p: precio } se suman al precio.
   ⚠ Precios, ingredientes y extras son EJEMPLOS: cámbialos por los reales.
   ===================================================================== */
const WHATSAPP = "573000000000";            // código de país + número, sin + ni espacios
const MAPS = "https://www.google.com/maps/place/kanayas/data=!4m2!3m1!1s0x8e683fd61e6c30d7:0x9cc27cacb090efc5";
const INSTAGRAM = "https://www.instagram.com/kanayas_ofc_/";

const MENU = [
  { categoria: "Para compartir", productos: [
    { nombre: "Papas Locas Porcinas", descripcion: "Papas con carne, chorizo, aguacate, salsa de queso y cremas de la casa.", precio: 28000, foto: "img/papas.jpg", etiqueta: "Favorito",
      ingredientes: ["🍟 Papa a la francesa", "🥩 Carne", "🌭 Chorizo", "🥑 Aguacate", "🧀 Salsa de queso", "🥣 Crema de la casa"],
      extras: [{ n: "Aguacate extra", p: 3000 }, { n: "Chorizo extra", p: 4000 }] },
    { nombre: "Chorizos Caramelizados", descripcion: "Entrada de chorizos caramelizados con arepa santandereana, queso y limón.", precio: 22000, foto: "img/chorizos.jpg", etiqueta: "Entrada",
      ingredientes: ["🌭 Chorizos caramelizados", "🫓 Arepa santandereana", "🧀 Queso", "🍋 Limón", "🥬 Lechuga"],
      extras: [{ n: "Arepa extra", p: 3000 }] },
  ]},
  { categoria: "Platos fuertes", productos: [
    { nombre: "Costillas Ahumadas", descripcion: "Costillas ahumadas con arepa, ensalada, ají y papa en casco.", precio: 38000, foto: "img/costillas.jpg", etiqueta: "Ahumado",
      ingredientes: ["🍖 Costillas ahumadas", "🫓 Arepa", "🥗 Ensalada", "🌶️ Ají", "🥔 Papa en casco"],
      extras: [{ n: "Porción de papa en casco", p: 5000 }] },
    { nombre: "Parrillada de Lomo y Chatas", descripcion: "Lomo de cerdo, chatas y chorizo caramelizado con papa en casco, ensalada con aguacate y ají.", precio: 42000, foto: "img/parrillada.jpg", etiqueta: "A la parrilla",
      ingredientes: ["🥩 Lomo de cerdo", "🍖 Chatas", "🌭 Chorizo caramelizado", "🥔 Papa en casco", "🥑 Ensalada con aguacate", "🌶️ Ají"] },
  ]},
  { categoria: "Sándwiches", productos: [
    { nombre: "Titanic", descripcion: "Pan con carne desmechada, lonjas ahumadas, topping crocante y salsas. Con papas a la francesa.", precio: 24000, foto: "img/titanic.jpg", etiqueta: "Nuevo",
      ingredientes: ["🥖 Pan", "🥩 Carne desmechada", "🥓 Lonjas ahumadas", "🧀 Topping crocante", "🥣 Salsas", "🍟 Papas a la francesa"],
      extras: [{ n: "Carne extra", p: 5000 }] },
  ]},
];
