import { HeaderCaixa } from '../../components/Caixa/HeaderCaixa/HeaderCaixa.jsx';
import { Outlet } from "react-router-dom";

export function CaixaLayout() {
  return (
    <div>
      <HeaderCaixa />
      <main>
        <Outlet />
      </main>
    </div>
  );
}