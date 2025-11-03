import React from "react";
import { HeaderGerenciamento } from "../../components/Gerenciamento/HeaderGerenciamento/HeaderGerenciamento.jsx";
import { Link } from "react-router-dom";
import "./HomeGerenciamento.css";
import { useRequireAuth } from "../../hooks/RequireAuth/useRequireAuth.jsx";
export function HomeGerenciamento() {
  useRequireAuth("Funcionario");
  document.title = "Gerenciamento - Home";

  const menuItems = [
    {
      title: "Produtos",
      icon: "📦",
      description: "Gerenciar cadastro de produtos, preços e estoque",
      links: [
        { to: "/Produto/CadastroProduto", text: "Novo Produto" },
        { to: "/Produto/ListagemProduto", text: "Ver Produtos" },
      ],
    },
    {
      title: "Fornecedores",
      icon: "🚛",
      description: "Gerenciar fornecedores e compras",
      links: [
        { to: "/Fornecedor/CadastroFornecedor", text: "Novo Fornecedor" },
        { to: "/Fornecedor/ListagemFornecedor", text: "Ver Fornecedores" },
      ],
    },
    {
      title: "Clientes",
      icon: "👥",
      description: "Gerenciar cadastro de clientes",
      links: [
        { to: "/Cliente/CadastroCliente", text: "Novo Cliente" },
        { to: "/Cliente/ListagemCliente", text: "Ver Clientes" },
      ],
    },
    {
      title: "Funcionários",
      icon: "👤",
      description: "Gerenciar equipe",
      links: [
        { to: "/Funcionario/CadastroFuncionario", text: "Novo Funcionário" },
        { to: "/Funcionario/ListagemFuncionario", text: "Ver Funcionários" },
      ],
    },
    {
      title: "Categorias",
      icon: "🏷️",
      description: "Gerenciar categorias de produtos",
      links: [
        { to: "/Categoria/CadastroCategoria", text: "Nova Categoria" },
        { to: "/Categoria/ListagemCategoria", text: "Ver Categorias" },
      ],
    },
  ];

  return (
    <div className="home-gerenciamento">
      <HeaderGerenciamento />

      <div className="content">
        <h1>Sistema de Gestão da Hello People</h1>
        <p className="welcome-text">Selecione uma área para gerenciar:</p>

        <div className="cards-grid">
          {menuItems.map((item, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <span className="card-icon">{item.icon}</span>
                <h2>{item.title}</h2>
              </div>
              <p>{item.description}</p>
              <div className="card-actions">
                {item.links.map((link, linkIndex) => (
                  <Link key={linkIndex} to={link.to} className="action-button">
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
