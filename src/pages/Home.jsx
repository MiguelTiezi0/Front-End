import React from "react";
import { Link } from "react-router-dom";

import "./Pages.css";

import { HeaderGeral } from "../components/Geral/HeaderGeral/HeaderGeral.jsx";
import { useRequireAuth } from "../hooks/RequireAuth/useRequireAuth.jsx";

export function Home() {
  document.title = "Home";

  useRequireAuth("Funcionario");

  const menuItems = [
    {
      title: "Gerenciamento",
      icon: "⚙️",
      description: "Produtos, categorias, fornecedores",
      to: "/Gerenciamento",
    },
    {
      title: "Caixa",
      icon: "💵",
      description: "Abrir/fechar caixa, entradas/saídas",
      to: "/Caixa",
    },
    {
      title: "Vendas",
      icon: "🧾",
      description: "Registrar vendas e gerenciar clientes",
      to: "/Venda/ListagemVenda",
    },
    {
      title: "Compras",
      icon: "📦",
      description: "Registrar compras e controlar fornecedores",
      to: "/Compra/ListagemCompra",
    },
    {
      title: "Pagamentos",
      icon: "💳",
      description: "Registrar pagamentos e contas a pagar",
      to: "/Pagamento/ListagemPagamento",
    },
    {
      title: "Relatórios",
      icon: "📊",
      description: "Relatórios rápidos do sistema",
      to: "/Relatorios",
    },
  ];

  return (
    <div className="homeContainer home-geral">
      <HeaderGeral />
      <main className="home-main">
        <section className="hero">
          <div>
            <h1>Bem-vindo ao Sistema de Gestão</h1>
            <p className="lead">
              Acesse rapidamente as áreas principais usando os atalhos abaixo.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/Venda/CadastroVenda" className="btn primary">
              Nova Venda
            </Link>
            <Link to="/Produto/CadastroProduto" className="btn outline">
              Novo Produto
            </Link>
          </div>
        </section>

        <section className="cards-grid home-cards">
          {menuItems.map((item) => (
            <Link key={item.title} to={item.to} className="home-card">
              <div className="card-top">
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
              </div>
              <p className="card-desc">{item.description}</p>
              <div className="card-footer">Abrir →</div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
