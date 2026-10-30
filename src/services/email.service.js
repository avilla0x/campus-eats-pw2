// src/services/email.service.js — correos de la aplicación
import nodemailer from 'nodemailer';

// El transporte se configura por variables de entorno:
// en desarrollo apunta a Ethereal, en producción a un SMTP real (semana 15)
const transporte = nodemailer.createTransport({
  host: process.env.SMTP_HOST,            // smtp.ethereal.email
  port: Number(process.env.SMTP_PORT),    // 587 (del .env todo llega como texto)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarConfirmacionPedido(destinatario, pedido) {
  const filas = pedido.items
    .map((i) => `<tr><td>${i.producto.nombre}</td><td>${i.cantidad}</td><td>$${i.precioUnitario.toLocaleString('es-CO')}</td></tr>`)
    .join('');

  const info = await transporte.sendMail({
    from: '"CampusEats" <pedidos@campuseats.co>',
    to: destinatario,
    subject: `Pedido #${pedido.id} recibido ✔`,
    html: `
      <h2>¡Recibimos tu pedido #${pedido.id}!</h2>
      <table border="1" cellpadding="6">
        <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
        ${filas}
      </table>
      <p><strong>Total: $${pedido.total.toLocaleString('es-CO')}</strong></p>
      <p>Te avisaremos cuando esté listo.</p>
    `,
  });

  // En Ethereal, esta URL abre el correo en el navegador
  console.log('Vista previa:', nodemailer.getTestMessageUrl(info));
  return info;
}