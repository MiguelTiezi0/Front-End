import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavGerenciamento.css";

export const NavGerenciamento = () => {
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
          <Link className="nav-a" to="/Gerenciamento/HomeGerenciamento">
            Gerenciamento
          </Link>
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
                  Funcionário
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Cliente/CadastroCliente">
                  Cliente
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Fornecedor/CadastroFornecedor">
                  Fornecedor
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
                <Link className="nav-a" to="/Produto/ListagemProduto">
                  Produto
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Categoria/ListagemCategoria">
                  Categoria
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Funcionario/ListagemFuncionario">
                  Funcionário
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Cliente/ListagemCliente">
                  Cliente
                </Link>
              </li>
              <li className="nav-li">
                <Link className="nav-a" to="/Fornecedor/ListagemFornecedor">
                  Fornecedor
                </Link>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </nav>
  );
};