import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavCaixa.css";

export const NavCaixa = () => {
  const detailsRefs = useRef([]);
  const location = useLocation();

  useEffect(() => {
    detailsRefs.current.forEach((details) => {
      if (details) details.removeAttribute("open");
    });
  }, [location]);

  return (
    <nav className="nav">
      <ul className="nav-ul">
        <li className="nav-li">
          <Link className="nav-a" to="/">
            Home
          </Link>
        </li>
        <li className="nav-li">
          <Link className="nav-a" to="/Caixa/HomeCaixa">
            Caixa
          </Link>
        </li>
   
        <li className="nav-li">
          <details
            className="nav-details"
            ref={(el) => (detailsRefs.current[2] = el)}
          >
            <summary className="nav-summary">Relatórios</summary>
            <ul className="nav-ul">
              <li className="nav-li">
                <Link className="nav-a" to="/Venda/ListagemVenda">
                  Venda
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Pagamento/ListagemPagamento">
                  Pagamento
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Pagamento/ListagemPagamentoDevedor">
                  Devedores
                </Link>
              </li>
            </ul>
          </details>
        </li>
        <li className="nav-li">
          <Link className="nav-a" to="/Venda/CadastroVenda">
            Vender
          </Link>
        </li>
        <li className="nav-li">
          <Link className="nav-a" to="/Pagamento/CadastroPagamento">
            Pagar
          </Link>
        </li>
      </ul>
    </nav>
  );
};