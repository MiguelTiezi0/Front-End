import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HeaderCaixa } from "../../components/Caixa/HeaderCaixa/HeaderCaixa";
import "./HomeCaixa.css";
import { useRequireAuth } from "../../hooks/RequireAuth/useRequireAuth.jsx";
export function HomeCaixa() {
  useRequireAuth("Funcionario");
  document.title = "Caixa - Home";
  const [mensagemCaixa, setMensagemCaixa] = useState("");
  const [caixa, setCaixa] = useState({
    aberto: false,
    valorAtual: 0,
    valorAbertura: 0,
    totalMovimentacoes: 0,
  });
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(false);
  const baseUrl = "http://localhost:7172/api/Caixa";

  const formatMoney = (v) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(v) || 0);

  const consultarCaixa = async () => {
    try {
      const res = await fetch(`${baseUrl}/aberto`);
      if (res.status === 404) {
        setCaixa({
          aberto: false,
          valorAtual: 0,
          valorAbertura: 0,
          totalMovimentacoes: 0,
        });
        setMensagemCaixa("Nenhum caixa aberto.");
        return;
      }
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setCaixa({
        aberto: true,
        id: data.id ?? data.Id,
        dataAbertura: data.dataAbertura ?? data.DataAbertura,
        valorAbertura: Number(data.valorAbertura ?? data.ValorAbertura ?? 0),
        totalMovimentacoes: Number(
          data.totalMovimentacoes ?? data.TotalMovimentacoes ?? 0
        ),
        valorAtual: Number(data.valorAtual ?? data.ValorAtual ?? 0),
      });
      setMensagemCaixa("");
    } catch (err) {
      console.error("Erro ao consultar caixa:", err);
      setCaixa({
        aberto: false,
        valorAtual: 0,
        valorAbertura: 0,
        totalMovimentacoes: 0,
      });
      setMensagemCaixa("Erro ao verificar o caixa.");
    }
  };

  useEffect(() => {
    consultarCaixa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAbrirCaixa = async () => {
    const valorStr = prompt("Valor de abertura:");
    const valor = parseFloat(valorStr);
    if (isNaN(valor)) {
      setMensagemCaixa("Valor inválido.");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/abrir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorAbertura: valor }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        setMensagemCaixa(`Erro: ${txt || res.status}`);
        return;
      }
      await consultarCaixa();
      setMensagemCaixa("Caixa aberto.");
    } catch (err) {
      console.error(err);
      setMensagemCaixa("Falha ao abrir caixa.");
    }
  };

  const handleFecharCaixa = async () => {
    try {
      const valorFechamento = caixa.valorAtual ?? 0;
      const res = await fetch(`${baseUrl}/fechar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorFechamento }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        setMensagemCaixa(`Erro: ${txt || res.status}`);
        return;
      }
      await consultarCaixa();
      setMensagemCaixa("Caixa fechado.");
    } catch (err) {
      console.error(err);
      setMensagemCaixa("Falha ao fechar caixa.");
    }
  };

  const handleEntrada = async () => {
    const valorStr = prompt("Valor da entrada:");
    const descricao = prompt("Descrição:");
    const valor = parseFloat(valorStr);
    if (isNaN(valor) || !descricao) {
      setMensagemCaixa("Entrada inválida.");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, descricao, tipo: "Entrada" }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        setMensagemCaixa(`Erro: ${txt || res.status}`);
        return;
      }
      await consultarCaixa();
      setMensagemCaixa("Entrada registrada.");
    } catch (err) {
      console.error(err);
      setMensagemCaixa("Falha ao registrar entrada.");
    }
  };

  const handleSaida = async () => {
    const valorStr = prompt("Valor da saída:");
    const descricao = prompt("Descrição:");
    const valor = parseFloat(valorStr);
    if (isNaN(valor) || !descricao) {
      setMensagemCaixa("Saída inválida.");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/saida`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, descricao, tipo: "Saída" }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        setMensagemCaixa(`Erro: ${txt || res.status}`);
        return;
      }
      await consultarCaixa();
      setMensagemCaixa("Saída registrada.");
    } catch (err) {
      console.error(err);
      setMensagemCaixa("Falha ao registrar saída.");
    }
  };

  const menuItems = [
    {
      title: "Vendas",
      icon: "💰",
      description: "Gerenciar vendas e pagamentos",
      links: [
        { to: "/Venda/CadastroVenda", text: "Nova Venda" },
        { to: "/Venda/ListagemVenda", text: "Ver Vendas" },
      ],
      highlight: true,
    },
    {
      title: "Pagamentos",
      icon: "💳",
      description: "Controle de pagamentos e parcelas",
      links: [
        { to: "/Pagamento/CadastroPagamento", text: "Novo Pagamento" },
        { to: "/Pagamento/ListagemPagamento", text: "Ver Pagamentos" },
        { to: "/Pagamento/ListagemPagamentoDevedor", text: "Devedores" },
      ],
    },
    {
      title: "Compras",
      icon: "🛍️",
      description: "Registro de compras e fornecedores",
      links: [
        { to: "/Compra/CadastroCompra", text: "Nova Compra" },
        { to: "/Compra/ListagemCompra", text: "Ver Compras" },
      ],
    },
  ];

  return (
    <div className="home-caixa-clean">
      <HeaderCaixa />
    
      <div className="center-wrapper">
        <div/>
        <div className={`card-main ${caixa.aberto ? "open" : "closed"}`}>
          <div className="top-row">
            <div className="status-dot" aria-hidden />
            <div className="status-info">
              <div className="status-label">
                {caixa.aberto ? "Caixa Aberto" : "Caixa Fechado"}
              </div>
              <div className="status-sub">
                {caixa.aberto && caixa.dataAbertura
                  ? new Date(caixa.dataAbertura).toLocaleString()
                  : "—"}
              </div>
            </div>
            <div className="actions-small">
              {caixa.aberto ? (
                <>
                  <button className="btn small" onClick={handleEntrada}>
                    + Entrada
                  </button>
                  <button className="btn small outline" onClick={handleSaida}>
                    - Saída
                  </button>
                </>
              ) : (
                <button className="btn small" onClick={handleAbrirCaixa}>
                  Abrir Caixa
                </button>
              )}
            </div>
          </div>

          <div className="main-value">
            <div className="value-label">Valor Atual</div>
            <div className="value-amount">{formatMoney(caixa.valorAtual)}</div>
          </div>

          <div className="footer-row">
            <div className="footer-left">
              <button
                className="btn ghost"
                onClick={() => setDetalhesVisiveis((v) => !v)}
              >
                {detalhesVisiveis ? "Ocultar detalhes" : "Ver detalhes"}
              </button>
            </div>
            <div className="footer-right">
              {caixa.aberto ? (
                <button className="btn danger" onClick={handleFecharCaixa}>
                  Fechar Caixa
                </button>
              ) : (
                <Link to="/Venda/CadastroVenda" className="btn primary">
                  Registrar Venda
                </Link>
              )}
            </div>
          </div>

          {detalhesVisiveis && (
            <div className="details-panel">
              <div className="detail-item">
                <div className="d-title">Abertura</div>
                <div className="d-value">
                  {formatMoney(caixa.valorAbertura)}
                </div>
              </div>
              <div className="detail-item">
                <div className="d-title">Movimentações</div>
                <div className="d-value">
                  {formatMoney(caixa.totalMovimentacoes)}
                </div>
              </div>
              <div className="detail-item muted">
                <div className="d-title">ID do Caixa</div>
                <div className="d-value">{caixa.id ?? "—"}</div>
              </div>
            </div>
          )}

          {mensagemCaixa && <div className="toast">{mensagemCaixa}</div>}
        </div>
         <div/>
      </div>

      <div
        className="cards-grid"
        style={{ maxWidth: 980, margin: "1.25rem auto", padding: "0 1rem" }}
      >
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`card ${item.highlight ? "highlight" : ""}`}
          >
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
  );
}
