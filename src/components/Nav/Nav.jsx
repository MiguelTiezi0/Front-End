import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Nav.css";

export const Nav = () => {
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
          <a className="nav-a" href="/">
            Home
          </a>
        </li>
        <li className="nav-li">
          <details
            className="nav-details"
            ref={(el) => (detailsRefs.current[0] = el)}
          >
            <summary className="nav-summary">Cadastros</summary>
            <ul className="nav-ul">
              <li className="nav-li">
                <Link className="nav-a" to="/Produto/CadastroProduto">
                  Produto
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Categoria/CadastroCategoria">
                  Categoria
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Funcionario/CadastroFuncionario">
                  Funcionario
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Cliente/CadastroCliente">
                  Cliente
                </Link>
              </li>
            </ul>
          </details>
        </li>
        <li className="nav-li">
          <details
            className="nav-details"
            ref={(el) => (detailsRefs.current[1] = el)}
          >
            <summary className="nav-summary">Listagens</summary>
            <ul className="nav-ul">
              <li className="nav-li">
                <Link to="/Produto/ListagemProduto" className="nav-a">
                  Produto
                </Link>
              </li>
              <li className="nav-li">
                <Link to="/Categoria/ListagemCategoria" className="nav-a">
                  Categoria
                </Link>
              </li>
              <li className="nav-li">
                <Link to="/Funcionario/ListagemFuncionario" className="nav-a">
                  Funcionario
                </Link>
              </li>
              <li className="nav-li">
                <Link to="/Cliente/ListagemCliente" className="nav-a">
                  Cliente
                </Link>
              </li>
            </ul>
          </details>
        </li>
        <li className="nav-li">
          
          <details
            className="nav-details"
            ref={(el) => (detailsRefs.current[2] = el)}
          >
            <summary className="nav-summary">Relatorios</summary>
            <ul className="nav-ul">
              <li className="nav-li">
                <Link to="/Venda/ListagemVenda" className="nav-a">
                  Venda
                </Link>
              </li>
              <li className="nav-li">
                <Link to="/Pagamento/ListagemPagamento" className="nav-a">
                  Pagamento
                </Link>
              </li>
            </ul>
          </details>
        </li>
          <li className="nav-li">
               <Link to="/Venda/CadastroVenda" className="nav-a">
              Vender
            </Link>
              </li>
              
          <li className="nav-li">
               <Link to="/Pagamento/Pagamento" className="nav-a">
              Pagar
            </Link>
              </li>
              
       
      </ul>
    </nav>
  );
};
