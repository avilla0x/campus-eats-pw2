// src/errores.js
// Errores con código HTTP. El service los lanza sin conocer req/res;
// el middleware de errores (src/middlewares/errores.js) los traduce a respuesta.

export class ErrorHttp extends Error {
  constructor(codigo, mensaje, detalles) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.codigo = codigo;
    this.detalles = detalles; // opcional: lista de { campo, mensaje }
  }
}

// Fábricas: se usan con `throw noEncontrado('Producto')`
export const noEncontrado = (recurso = 'Recurso') =>
  new ErrorHttp(404, `${recurso} no encontrado`);

export const conflicto = (mensaje) => new ErrorHttp(409, mensaje);

export const datosInvalidos = (detalles, mensaje = 'Datos inválidos') =>
  new ErrorHttp(400, mensaje, detalles);
