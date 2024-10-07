// renderer/models.js

export class Vale {
  constructor(descripcion, valor) {
    this.descripcion = descripcion;
    this.valor = valor;
  }
}

export class CorteDeCaja {
  constructor(nombre, total, tarjeta, dolares = 0, tipoCambio = 1) {
    this.nombre = nombre;
    this.total = total;
    this.tarjeta = tarjeta;
    this.dolares = dolares;
    this.tipoCambio = tipoCambio;
    this.vales = [];
    this.efectivo = this.calcularEfectivo();
    this.pesos = this.calcularPesos();
  }

  agregarVale(vale) {
    this.vales.push(vale);
    this.actualizarValores();
  }

  eliminarVale(index) {
    this.vales.splice(index, 1);
    this.actualizarValores();
  }

  calcularValesTotal() {
    return this.vales.reduce((acc, vale) => acc + vale.valor, 0);
  }

  calcularEfectivo() {
    return this.total - this.tarjeta - this.calcularValesTotal();
  }

  calcularPesos() {
    return this.efectivo - (this.dolares * this.tipoCambio);
  }

  actualizarValores() {
    this.efectivo = this.calcularEfectivo();
    this.pesos = this.calcularPesos();
  }

  validar() {
    if (!this.nombre) {
      throw new Error('El nombre del establecimiento es obligatorio.');
    }
    if (this.total < 0 || this.tarjeta < 0 || this.dolares < 0 || this.tipoCambio < 0) {
      throw new Error('Los valores no pueden ser negativos.');
    }
    if (this.total !== (this.efectivo + this.tarjeta + this.calcularValesTotal())) {
      throw new Error('El total no coincide con la suma de Efectivo, Tarjeta y Vales.');
    }
  }
}
