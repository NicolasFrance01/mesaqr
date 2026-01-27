// lib/menuData.ts
export type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
};

export const menu: Producto[] = [
  { id: "c1", categoria: "Croquetas", nombre: "Boletus", precio: 6.5 },
  { id: "c2", categoria: "Croquetas", nombre: "Costilla Ibérica", precio: 7.9 },
  { id: "c3", categoria: "Croquetas", nombre: "Cocido", precio: 6.5 },
  { id: "t1", categoria: "Tapas calientes", nombre: "Alitas de pollo", precio: 7.1 },
  { id: "t2", categoria: "Tapas calientes", nombre: "Bravas", precio: 5.5 },
  { id: "f1", categoria: "Tapas frías", nombre: "Bandeja de ibéricos", precio: 16.5 },
  { id: "h1", categoria: "Hamburguesas", nombre: "Córdoba", descripcion: "Lechuga, tomate, rulo de cabra, bacon y huevo", precio: 9.6 },
  { id: "p1", categoria: "Postres", nombre: "Coulant de chocolate", precio: 4.8 },
  { id: "v1", categoria: "Vinos tintos", nombre: "Coto Rioja Crianza", precio: 13.5 }
];

// app/dashboard/carta/page.tsx
import { menu } from "@/lib/menuData";

export default function CartaDashboard() {
  const categorias = Array.from(new Set(menu.map(m => m.categoria)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Carta del local</h1>
      <button className="mb-6 bg-black text-white px-4 py-2 rounded-lg">➕ Agregar producto</button>

      {categorias.map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{cat}</h2>
          <div className="space-y-2">
            {menu.filter(p => p.categoria === cat).map(prod => (
              <div key={prod.id} className="flex justify-between bg-white p-4 rounded-lg shadow">
                <div>
                  <p className="font-medium">{prod.nombre}</p>
                  {prod.descripcion && <p className="text-sm text-gray-500">{prod.descripcion}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold">${prod.precio.toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-sm border px-2 rounded">Editar</button>
                    <button className="text-sm border px-2 rounded">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// app/mesa/[mesaId]/menu/page.tsx
import { menu } from "@/lib/menuData";

export default function CartaMesa() {
  const categorias = Array.from(new Set(menu.map(m => m.categoria)));

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Nuestra Carta</h1>

      {categorias.map(cat => (
        <section key={cat} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{cat}</h2>
          <div className="space-y-3">
            {menu.filter(p => p.categoria === cat).map(prod => (
              <div key={prod.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
                <div>
                  <p className="font-medium">{prod.nombre}</p>
                  {prod.descripcion && <p className="text-sm text-gray-500">{prod.descripcion}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold">${prod.precio.toFixed(2)}</p>
                  <button className="mt-2 text-sm bg-black text-white px-3 py-1 rounded">Agregar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-10 text-center text-sm text-gray-500">
        Reservas por WhatsApp
        <br />
        <a
          href="https://wa.me/543516002716"
          target="_blank"
          className="text-black font-semibold underline"
        >
          351 600 2716
        </a>
      </footer>
    </main>
  );
}
