import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { linkCompra } from "./linkCompra";
import { Link_Itens_Compra } from "../Itens_Compra/link_Itens_Compra";
import { apiFetch } from "../../../utils/apiFetch";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function formatDateToInput(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}
function currency(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CadastroCompra() {
  useRequireAuth("Funcionario");
  document.title = "Nova Compra";
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [compra, setCompra] = useState({
    funcionarioId: "",
    descricao: "",
    dataCompra: formatDateToInput(new Date()),
  });
  const [item, setItem] = useState({ produtoId: "", quantidade: "", valorUnitario: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(linkFun).then((r) => r.json()).then((d) => setFuncionarios(Array.isArray(d) ? d : [])).catch(console.error);
    fetch(linkPro).then((r) => r.json()).then((d) => setProdutos(Array.isArray(d) ? d : [])).catch(console.error);
  }, []);

  const totais = useMemo(() => ({
    quantidade: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
    valor: itens.reduce((acc, i) => acc + Number(i.valorUnitario) * Number(i.quantidade), 0),
  }), [itens]);

  const produtoSelecionado = useMemo(() => {
    const id = Number(item.produtoId);
    return produtos.find((p) => p.id === id) ?? null;
  }, [item.produtoId, produtos]);

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value) || "";
    const produto = produtos.find((p) => p.id === produtoId);
    setItem({
      produtoId: produtoId || "",
      valorUnitario: produto?.precoCusto != null ? Number(produto.precoCusto) : "",
      quantidade: "",
    });
  };

  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    const quantidadeNum = Number(item.quantidade);
    const valorUnitarioNum = Number(item.valorUnitario);

    if (!produtoId || quantidadeNum <= 0 || valorUnitarioNum <= 0) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }

    setItens((prev) => [
      ...prev,
      {
        produtoId,
        quantidade: quantidadeNum,
        valorUnitario: valorUnitarioNum,
        subtotal: quantidadeNum * valorUnitarioNum,
        tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      },
    ]);
    setItem({ produtoId: "", quantidade: "", valorUnitario: "" });
  };

  const handleRemoveItem = (tempId) => setItens((prev) => prev.filter((i) => i.tempId !== tempId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!compra.funcionarioId || !compra.descricao || itens.length === 0) {
      alert("Preencha funcionário, descrição e adicione pelo menos um item.");
      return;
    }

    setSaving(true);
    try {
      const compraBody = {
        funcionarioId: Number(compra.funcionarioId),
        descricao: compra.descricao,
        quantidadeDeProduto: totais.quantidade,
        valorDaCompra: totais.valor,
        dataCompra: compra.dataCompra,
      };

      const resCompra = await fetch(linkCompra, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compraBody),
      });
      if (!resCompra.ok) throw new Error("Erro ao salvar a compra.");
      const compraSalva = await resCompra.json();

      for (const it of itens) {
        await fetch(Link_Itens_Compra, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            compraId: compraSalva.id,
            produtoId: Number(it.produtoId),
            quantidade: Number(it.quantidade),
            valorUnitario: Number(it.valorUnitario),
            subtotal: Number(it.subtotal),
          }),
        });
      }

      if (totais.valor > 0) {
        const caixaRes = await apiFetch("/api/caixa/entrada", {
          method: "POST",
          body: JSON.stringify({
            valor: totais.valor,
            descricao: `Compra ${compraSalva.id} - ${compraBody.descricao}`,
            tipo: "Saída",
          }),
        });
        if (!caixaRes.ok) {
          console.warn("Compra salva, mas não foi possível registrar a saída no caixa (nenhum caixa aberto?).");
        }
      }

      navigate("/Compra/ListagemCompra");
    } catch (error) {
      console.error(error);
      alert(error.message || "Falha ao salvar a compra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Nova compra</h1>
          <p className="pdv-subtitle">Registre uma compra de produtos junto a um fornecedor.</p>
        </div>
      </div>

      <form className="pdv-form-card" style={{ maxWidth: "100%" }} onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div>
            <label className="hp-lb">Funcionário responsável *</label>
            <select
              className="hp-inp"
              required
              value={compra.funcionarioId}
              onChange={(e) => setCompra((c) => ({ ...c, funcionarioId: e.target.value }))}
            >
              <option value="">Selecione…</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="hp-lb">Data da compra *</label>
            <input
              type="datetime-local"
              className="hp-inp"
              required
              value={compra.dataCompra}
              onChange={(e) => setCompra((c) => ({ ...c, dataCompra: e.target.value }))}
            />
          </div>
          <div className="pdv-form-col-full">
            <label className="hp-lb">Descrição *</label>
            <input
              type="text"
              className="hp-inp"
              required
              placeholder="Ex: Reposição de estoque - inverno"
              value={compra.descricao}
              onChange={(e) => setCompra((c) => ({ ...c, descricao: e.target.value }))}
            />
          </div>
        </div>

        <h2 className="pdv-section-title" style={{ marginTop: 22 }}>Itens da compra</h2>
        <div className="pdv-form-grid">
          <div>
            <label className="hp-lb">Produto</label>
            <select className="hp-inp" value={item.produtoId} onChange={handleProdutoChange}>
              <option value="">Selecione…</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{p.descricao} (estoque: {p.quantidade})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="hp-lb">Quantidade</label>
            <input
              type="number"
              min={1}
              className="hp-inp"
              placeholder="0"
              value={item.quantidade}
              onChange={(e) => setItem((i) => ({ ...i, quantidade: e.target.value }))}
            />
          </div>
          <div className="pdv-form-col-full" style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            {produtoSelecionado && (
              <p className="pdv-hint" style={{ margin: 0 }}>
                Preço de custo do produto: {currency(item.valorUnitario || produtoSelecionado.precoCusto)}
              </p>
            )}
            <button type="button" className="pdv-btn pdv-btn--ghost" style={{ marginLeft: "auto" }} onClick={handleAddItem}>
              Adicionar item
            </button>
          </div>
        </div>

        <div className="pdv-card" style={{ marginTop: 16 }}>
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço de custo</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((i) => (
                  <tr key={i.tempId}>
                    <td>{produtos.find((p) => p.id === Number(i.produtoId))?.descricao || "—"}</td>
                    <td>{i.quantidade}</td>
                    <td>{currency(i.valorUnitario)}</td>
                    <td>{currency(i.subtotal)}</td>
                    <td>
                      <button type="button" className="pdv-icon-btn pdv-icon-btn--danger" title="Remover item" onClick={() => handleRemoveItem(i.tempId)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {itens.length === 0 && <p className="pdv-empty">Nenhum item adicionado ainda.</p>}
          </div>
        </div>

        <div className="pdv-stat-row" style={{ marginTop: 16 }}>
          <dl className="pdv-stat"><dt>Qtd. de produtos</dt><dd>{totais.quantidade}</dd></dl>
          <dl className="pdv-stat"><dt>Valor total</dt><dd>{currency(totais.valor)}</dd></dl>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Compra/ListagemCompra" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={itens.length === 0 || !compra.funcionarioId || !compra.descricao || saving}>
            {saving ? "Salvando…" : "Finalizar compra"}
          </button>
        </div>
      </form>
    </div>
  );
}
