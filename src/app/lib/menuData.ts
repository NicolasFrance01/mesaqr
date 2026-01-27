export interface Producto {
  id: number
  nombre: string
  precio: number
}

const menu: Producto[] = [
  { id: 1, nombre: "Pizza", precio: 3500 },
  { id: 2, nombre: "Hamburguesa", precio: 4000 },
]

export default menu
