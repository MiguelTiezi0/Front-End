import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { linkCompra } from "./linkCompra";
import { Link_Itens_Compra } from "../Itens_Compra/link_Itens_Compra";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function formatDateToInput(date) {
  return new Date(date).toISOString().slice(0, 16);
}
function currency(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function EditarCompra() {
  useRequireAuth("Funcionario");
  document.title = "Editar Compra";
  const navigate = useNavigate();
  const { id } = useParams();

  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [itensOriginais, setItensOriginais] = useState([]);
  const [compra, setCompra] = useState(null);
  const [item, setItem] = useState({ produtoId: "", quantidade: "", valorUnitario: "" });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch(linkFun).then((r) => r.json()).then((d) => setFuncionarios(Array.isArray(d) ? d : []));
    fetch(linkPro).then((r) => r.json()).then((d) => setProdutos(Array.isArray(d) ? d : []));

    fetch(`${linkCompra}/${id}`)
      .then((r) => r.json())
      .then((dados) => setCompra({ ...dados, dataCompra: dados.dataCompra ? formatDateToInput(dados.dataCompra) : formatDateToInput(new Date()) }));

    fetch(`${Link_Itens_Compra}/compra/${id}`)
      .then((r) => r.json())
      .then((dados) => {
        const comItens = (Array.isArray(dados) ? dados : []).map((i) => ({ ...i, tempId: `${i.id}` }));
        setItens(comItens);
        setItensOriginais(comItens);
      });
  }, [id]);

  const totais = useMemo(() => ({
    quantidade: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
    valor: itens.reduce((acc, i) => acc + Number(i.valorUnitario) * Number(i.quantidade), 0),
  }), [itens]);

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value) || "";
    const produto = produtos.find((p) => p.id === produtoId);
    setItem({ produtoId: produtoId || "", valorUnitario: produto?.precoCusto != null ? Number(produto.precoCusto) : "", quantidade: "" });
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
      { produtoId, quantidade: quantidadeNum, valorUnitario: valorUnitarioNum, tempId: `novo-${Date.now()}` },
    ]);
    setItem({ produtoId: "", quantidade: "", valorUnitario: "" });
  };

  const handleRemoveItem = (tempId) => setItens((prev) => prev.filter((i) => i.tempId !== tempId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!compra.funcionarioId || !compra.descricao || itens.length === 0) {
      alert("Preencha funcionário, descrição e mantenha ao menos um item.");
      return;
    }

    setSalvando(true);
    try {
      const compraBody = {
        funcionarioId: Number(compra.funcionarioId),
        descricao: compra.descricao,
        quantidadeDeProduto: totais.quantidade,
        valorDaCompra: totais.valor,
        dataCompra: compra.dataCompra,
      };

      const resCompra = await fetch(`${linkCompra}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compraBody),
      });
      if (!resCompra.ok) throw new Error("Erro ao atualizar a compra.");

      for (const i of itens) {
        const payload = {
          compraId: Number(id),
          produtoId: Number(i.produtoId),
          quantidade: Number(i.quantidade),
          valorUnitario: Number(i.valorUnitario),
          subtotal: Number(i.valorUnitario) * Number(i.quantidade),
        };
        if (!i.id) {
          await fetch(Link_Itens_Compra, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        } else {
          const original = itensOriginais.find((o) => o.id === i.id);
          if (!original || original.quantidade !== i.quantidade || original.valorUnitario !== i.valorUnitario) {
            await fetch(`${Link_Itens_Compra}/${i.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          }
        }
      }

      for (const o of itensOriginais) {
        if (!itens.find((i) => i.id === o.id)) {
          await fetch(`${Link_Itens_Compra}/${o.id}`, { method: "DELETE" });
        }
      }

      navigate("/Compra/ListagemCompra");
    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao atualizar a compra.");
    } finally {
      setSalvando(false);
    }
  };

  if (!compra) return <p className="pdv-empty">Carregando dados da compra…</p>;

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Compra/ListagemCompra" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para compras
          </Link>
          <h1 className="pdv-title">Editar compra: {compra.descricao}</h1>
        </div>
      </div>

      <form className="pdv-form-card" style={{ maxWidth: "100%" }} onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div>
            <label className="hp-lb">Funcionário responsável *</label>
            <select className="hp-inp" required value={compra.funcionarioId} onChange={(e) => setCompra((c) => ({ ...c, funcionarioId: e.target.value }))}>
              <option value="">Selecione…</option>
              {funcionarios.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="hp-lb">Data da compra *</label>
            <input type="datetime-local" className="hp-inp" required value={compra.dataCompra} onChange={(e) => setCompra((c) => ({ ...c, dataCompra: e.target.value }))} />
          </div>
          <div className="pdv-form-col-full">
            <label className="hp-lb">Descrição *</label>
            <input type="text" className="hp-inp" required value={compra.descricao} onChange={(e) => setCompra((c) => ({ ...c, descricao: e.target.value }))} />
          </div>
        </div>

        <h2 className="pdv-section-title" style={{ marginTop: 22 }}>Itens da compra</h2>
        <div className="pdv-form-grid">
          <div>
            <label className="hp-lb">Produto</label>
            <select className="hp-inp" value={item.produtoId} onChange={handleProdutoChange}>
              <option value="">Selecione…</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.descricao}</option>)}
            </select>
          </div>
          <div>
            <label className="hp-lb">Quantidade</label>
            <input type="number" min={1} className="hp-inp" value={item.quantidade} onChange={(e) => setItem((i) => ({ ...i, quantidade: e.target.value }))} />
          </div>
          <div className="pdv-form-col-full" style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            {item.produtoId && <p className="pdv-hint" style={{ margin: 0 }}>Preço de custo: {currency(item.valorUnitario)}</p>}
            <button type="button" className="pdv-btn pdv-btn--ghost" style={{ marginLeft: "auto" }} onClick={handleAddItem}>Adicionar item</button>
          </div>
        </div>

        <div className="pdv-card" style={{ marginTop: 16 }}>
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr><th>Produto</th><th>Quantidade</th><th>Preço de custo</th><th></th></tr>
              </thead>
              <tbody>
                {itens.map((i) => (
                  <tr key={i.tempId}>
                    <td>{produtos.find((p) => p.id === Number(i.produtoId))?.descricao || "—"}</td>
                    <td>{i.quantidade}</td>
                    <td>{currency(i.valorUnitario)}</td>
                    <td>
                      <button type="button" className="pdv-icon-btn pdv-icon-btn--danger" title="Remover item" onClick={() => handleRemoveItem(i.tempId)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {itens.length === 0 && <p className="pdv-empty">Nenhum item nesta compra.</p>}
          </div>
        </div>

        <div className="pdv-stat-row" style={{ marginTop: 16 }}>
          <dl className="pdv-stat"><dt>Qtd. de produtos</dt><dd>{totais.quantidade}</dd></dl>
          <dl className="pdv-stat"><dt>Valor total</dt><dd>{currency(totais.valor)}</dd></dl>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Compra/ListagemCompra" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={itens.length === 0 || salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
