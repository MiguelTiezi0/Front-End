import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, CreditCard, Truck, Plus, Minus, Lock, Unlock } from "lucide-react";
import "./HomeCaixa.css";
import { apiFetch } from "../../utils/apiFetch";
import { useRequireAuth } from "../../hooks/RequireAuth/useRequireAuth.jsx";

function somarMovimentos(movimentos) {
  return (movimentos || []).reduce((acc, m) => {
    const valor = Number(m.valor ?? 0);
    return m.tipo === "Saída" ? acc - valor : acc + valor;
  }, 0);
}

const formatMoney = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const MENU_ITEMS = [
  {
    title: "Vendas",
    icon: ShoppingCart,
    description: "Gerenciar vendas e pagamentos",
    links: [
      { to: "/Venda/CadastroVenda", text: "Nova venda" },
      { to: "/Venda/ListagemVenda", text: "Ver vendas" },
    ],
  },
  {
    title: "Pagamentos",
    icon: CreditCard,
    description: "Controle de pagamentos e parcelas",
    links: [
      { to: "/Pagamento/CadastroPagamento", text: "Novo pagamento" },
      { to: "/Pagamento/ListagemPagamento", text: "Ver pagamentos" },
      { to: "/Pagamento/ListagemPagamentoDevedor", text: "Devedores" },
    ],
  },
  {
    title: "Compras",
    icon: Truck,
    description: "Registro de compras e fornecedores",
    links: [
      { to: "/Compra/CadastroCompra", text: "Nova compra" },
      { to: "/Compra/ListagemCompra", text: "Ver compras" },
    ],
  },
];

/** Formulário compacto usado para abrir caixa e registrar entrada/saída, substituindo os antigos prompt() do navegador. */
function MovimentoForm({ titulo, pedirDescricao, onCancelar, onConfirmar }) {
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const numero = parseFloat(valor.replace(",", "."));
    if (isNaN(numero) || numero <= 0) {
      alert("Informe um valor válido.");
      return;
    }
    if (pedirDescricao && !descricao.trim()) {
      alert("Informe uma descrição.");
      return;
    }
    onConfirmar(numero, descricao.trim());
  };

  return (
    <form className="caixa-inline-form" onSubmit={handleSubmit}>
      <div className="caixa-inline-form-title">{titulo}</div>
      <div className="caixa-inline-form-row">
        <input
          type="number"
          step="0.01"
          min="0"
          className="hp-inp"
          placeholder="Valor (R$)"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        {pedirDescricao && (
          <input
            type="text"
            className="hp-inp"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        )}
      </div>
      <div className="caixa-inline-form-actions">
        <button type="button" className="pdv-btn pdv-btn--ghost pdv-btn--sm" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="pdv-btn pdv-btn--primary pdv-btn--sm">Confirmar</button>
      </div>
    </form>
  );
}

export function HomeCaixa() {
  useRequireAuth("Funcionario");
  document.title = "Caixa - Home";
  const [mensagemCaixa, setMensagemCaixa] = useState("");
  const [caixa, setCaixa] = useState({ aberto: false, valorAtual: 0, valorAbertura: 0, totalMovimentacoes: 0 });
  const [formularioAtivo, setFormularioAtivo] = useState(null); // "abrir" | "entrada" | "saida" | null

  const consultarCaixa = async () => {
    try {
      const res = await apiFetch("/api/caixa/aberto");
      if (res.status === 404) {
        setCaixa({ aberto: false, valorAtual: 0, valorAbertura: 0, totalMovimentacoes: 0 });
        return;
      }
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const valorAbertura = Number(data.valorAbertura ?? 0);
      const totalMovimentacoes = somarMovimentos(data.movimentos);
      setCaixa({
        aberto: true,
        id: data.id,
        dataAbertura: data.dataAbertura,
        valorAbertura,
        totalMovimentacoes,
        valorAtual: valorAbertura + totalMovimentacoes,
      });
    } catch (err) {
      console.error("Erro ao consultar caixa:", err);
      setMensagemCaixa("Não foi possível verificar o status do caixa.");
    }
  };

  useEffect(() => {
    consultarCaixa();
  }, []);

  const handleAbrirCaixa = async (valor) => {
    try {
      const res = await apiFetch("/api/caixa/abrir", {
        method: "POST",
        body: JSON.stringify({ valorAbertura: valor }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setMensagemCaixa(body?.message || "Erro ao abrir o caixa.");
        return;
      }
      setFormularioAtivo(null);
      setMensagemCaixa("Caixa aberto com sucesso.");
      await consultarCaixa();
    } catch (err) {
      console.error(err);
      setMensagemCaixa("Falha ao abrir o caixa.");
    }
  };

  const handleFecharCaixa = async () => {
    if (!window.confirm("Tem certeza que deseja fechar o caixa?")) return;
    try {
      const res = await apiFetch("/api/caixa/fechar", {
        method: "POST",
        body: JSON.stringify({ valorFechamento: caixa.valorAtual ?? 0 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setMensagemCaixa(body?.message || "Erro ao fechar o caixa.");
        return;
      }
      setMensagemCaixa("Caixa fechado.");
      await consultarCaixa();
    } catch (err) {
      console.error(err);
      setMensagemCaixa("Falha ao fechar o caixa.");
    }
  };

  const registrarMovimento = async (tipo, valor, descricao) => {
    try {
      const res = await apiFetch("/api/caixa/entrada", {
        method: "POST",
        body: JSON.stringify({ valor, descricao, tipo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setMensagemCaixa(body?.message || `Erro ao registrar ${tipo.toLowerCase()}.`);
        return;
      }
      setFormularioAtivo(null);
      setMensagemCaixa(tipo === "Entrada" ? "Entrada registrada." : "Saída registrada.");
      await consultarCaixa();
    } catch (err) {
      console.error(err);
      setMensagemCaixa(`Falha ao registrar ${tipo.toLowerCase()}.`);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Caixa</h1>
          <p className="pdv-subtitle">Abra o caixa, registre entradas/saídas e acompanhe o saldo do dia.</p>
        </div>
      </div>

      <div className={`caixa-status-card ${caixa.aberto ? "aberto" : "fechado"}`}>
        <div className="caixa-status-top">
          <span className="caixa-status-dot" />
          <div>
            <div className="caixa-status-label">{caixa.aberto ? "Caixa aberto" : "Caixa fechado"}</div>
            <div className="caixa-status-sub">
              {caixa.aberto && caixa.dataAbertura ? new Date(caixa.dataAbertura).toLocaleString("pt-BR") : "Nenhum caixa aberto no momento"}
            </div>
          </div>
          {caixa.aberto ? (
            <div className="caixa-status-actions">
              <button type="button" className="pdv-btn pdv-btn--ghost pdv-btn--sm" onClick={() => setFormularioAtivo("entrada")}>
                <Plus size={14} /> Entrada
              </button>
              <button type="button" className="pdv-btn pdv-btn--ghost pdv-btn--sm" onClick={() => setFormularioAtivo("saida")}>
                <Minus size={14} /> Saída
              </button>
            </div>
          ) : (
            <button type="button" className="pdv-btn pdv-btn--primary pdv-btn--sm" onClick={() => setFormularioAtivo("abrir")}>
              <Unlock size={14} /> Abrir caixa
            </button>
          )}
        </div>

        <div className="caixa-valor">
          <div className="caixa-valor-label">Valor atual</div>
          <div className="caixa-valor-amount">{formatMoney(caixa.valorAtual)}</div>
        </div>

        {formularioAtivo === "abrir" && (
          <MovimentoForm
            titulo="Abrir caixa"
            pedirDescricao={false}
            onCancelar={() => setFormularioAtivo(null)}
            onConfirmar={(valor) => handleAbrirCaixa(valor)}
          />
        )}
        {formularioAtivo === "entrada" && (
          <MovimentoForm
            titulo="Registrar entrada"
            pedirDescricao
            onCancelar={() => setFormularioAtivo(null)}
            onConfirmar={(valor, descricao) => registrarMovimento("Entrada", valor, descricao)}
          />
        )}
        {formularioAtivo === "saida" && (
          <MovimentoForm
            titulo="Registrar saída"
            pedirDescricao
            onCancelar={() => setFormularioAtivo(null)}
            onConfirmar={(valor, descricao) => registrarMovimento("Saída", valor, descricao)}
          />
        )}

        {caixa.aberto && (
          <div className="caixa-detalhes">
            <div><span>Abertura</span><strong>{formatMoney(caixa.valorAbertura)}</strong></div>
            <div><span>Movimentações</span><strong>{formatMoney(caixa.totalMovimentacoes)}</strong></div>
            <button type="button" className="pdv-btn pdv-btn--danger pdv-btn--sm" onClick={handleFecharCaixa}>
              <Lock size={14} /> Fechar caixa
            </button>
          </div>
        )}

        {mensagemCaixa && <div className="caixa-toast">{mensagemCaixa}</div>}
      </div>

      <div className="caixa-menu-grid">
        {MENU_ITEMS.map((item) => (
          <div key={item.title} className="pdv-card caixa-menu-card">
            <div className="caixa-menu-header">
              <item.icon size={20} />
              <h2>{item.title}</h2>
            </div>
            <p>{item.description}</p>
            <div className="caixa-menu-actions">
              {item.links.map((link) => (
                <Link key={link.to} to={link.to} className="pdv-btn pdv-btn--ghost pdv-btn--sm">
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
