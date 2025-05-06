import { useState } from "react";
import MapaInterativo from "../components/MapaInterativo";

export default function EditorMapa() {
  const [blocoSelecionado, setBlocoSelecionado] = useState(null);

  return (
    <div className="flex h-screen w-full">
      {/* Mapa real */}
      <div className="w-3/4">
        <MapaInterativo />
      </div>

      {/* Painel lateral */}
      <div className="w-1/4 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edição do Bloco</h2>

        <form className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Nome do Bloco</label>
            <input type="text" className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Cor</label>
            <select className="w-full border p-2 rounded">
              <option>Verde</option>
              <option>Amarelo</option>
              <option>Vermelho</option>
              <option>Laranja</option>
              <option>Roxo</option>
              <option>Branco</option>
              <option>Azul</option>
              <option>Rosa</option>
              <option>Turquesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Data Plantio</label>
            <input type="date" className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Última Aplicação</label>
            <input type="date" className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Próxima Colheita</label>
            <input type="date" className="w-full border p-2 rounded" />
          </div>

          <div className="pt-4">
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}