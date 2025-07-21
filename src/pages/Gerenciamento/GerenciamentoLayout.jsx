import { HeaderGerenciamento } from "../../components/Gerenciamento/HeaderGerenciamento/HeaderGerenciamento.jsx";
import { Outlet } from "react-router-dom";

export function GerenciamentoLayout({ children }) {
  return (
    <div>
      <HeaderGerenciamento />
       <main>
              <Outlet />
            </main>
    </div>
  );
}