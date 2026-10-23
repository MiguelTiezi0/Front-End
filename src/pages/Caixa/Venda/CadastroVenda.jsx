import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { linkVen } from "./linkVen";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPag } from "../Pagamento/linkPag";
import { apiFetch } from "../../../utils/apiFetch";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function CadastroVenda() {
  useRequireAuth("Funcionario");
  document.title = "Nova Venda";
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [qtdParcelas, setQtdParcelas] = useState(1);
  const [formaDePagamento, setFormaDePagamento] = useState("");
  const [descontoTipo, setDescontoTipo] = useState("");
  const [descontoValor, setDescontoValor] = useState("");
  const [totalPago, setTotalPago] = useState("");
  const [item, setItem] = useState({
    produtoId: "",
    valorDoItem: "",
    quantidade: "",
  });

  const [venda, setVenda] = useState({
    funcionarioId: "",
    clienteId: "",
    totalDeItens: 0,
    valorTotal: 0,
    totalPago: 0,
    formaDePagamento: [],
    totalDeVezes: 1,
    dataVenda: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetch(linkFun).then((r) => r.json()).then((d) => setFuncionarios(Array.isArray(d) ? d : []));
    fetch(linkCli).then((r) => r.json()).then((d) => setClientes(Array.isArray(d) ? d : []));
    fetch(linkPro).then((r) => r.json()).then((d) => setProdutos(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    setVenda((v) => ({
      ...v,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
    }));
  }, [itens]);

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value);
    const produtoSelecionado = produtos.find((p) => p.id === produtoId);
    setItem({
      produtoId: e.target.value,
      valorDoItem: produtoSelecionado?.precoVenda || "",
      quantidade: "",
    });
  };

  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    const quantidadeNum = Number(item.quantidade);
    if (!produtoId || !item.valorDoItem || !quantidadeNum) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return alert("Produto inválido.");
    if (quantidadeNum > produto.quantidade) {
      alert("Quantidade maior que o estoque!");
      return;
    }
    setItens([
      ...itens,
      {
        ...item,
        produtoId,
        quantidade: quantidadeNum,
        tempId: Date.now() + Math.random(),
      },
    ]);
    setItem({ produtoId: "", valorDoItem: "", quantidade: "" });
  };

  const handleRemoveItem = (tempId) => {
    setItens(itens.filter((i) => i.tempId !== tempId));
  };

  const handleCancelOne = (tempId) => {
    setItens((prev) =>
      prev
        .map((i) =>
          i.tempId === tempId
            ? { ...i, quantidade: i.quantidade > 1 ? i.quantidade - 1 : 1 }
            : i
        )
        .filter((i) => i.quantidade > 0)
    );
  };

  const handleFormaPagamento = (e) => {
    const value = e.target.value;
    setFormaDePagamento(value);
    setDescontoTipo("");
    setDescontoValor("");
    setVenda((v) => ({ ...v, formaDePagamento: [value] }));
    if (!(value === "Crédito" || value === "Débito" || value === "Crediário")) {
      setQtdParcelas(1);
    }
  };

  const mostrarParcelas = formaDePagamento === "Crédito" || formaDePagamento === "Débito" || formaDePagamento === "Crediário";

  useEffect(() => {
    const valorProdutos = itens.reduce(
      (acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade),
      0
    );
    let desconto = 0;
    const valor = Number(descontoValor);
    if (descontoTipo === "porcentagem" && !isNaN(valor)) {
      desconto = valorProdutos * (valor / 100);
    } else if (descontoTipo === "decimal" && !isNaN(valor)) {
      desconto = valor;
    }
    const final = Math.max(0, valorProdutos - desconto);
    setVenda((v) => ({
      ...v,
      valorTotal: final,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
    }));
  }, [itens, descontoTipo, descontoValor]);

  useEffect(() => {
    if (venda.clienteId === "0" || venda.clienteId === 0) {
      setTotalPago(venda.valorTotal);
    }
  }, [venda.clienteId, venda.valorTotal]);

  const formasPagamento = ["Dinheiro", "Débito", "Pix", "Crédito", "Crediário", "Consignação"];

  const clienteSelecionado = clientes.find((c) => String(c.id) === String(venda.clienteId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venda.funcionarioId || !venda.clienteId || itens.length === 0) {
      alert("Preencha todos os campos obrigatórios e adicione pelo menos um item.");
      return;
    }
    const valorRestante = Number(venda.valorTotal) - Number(totalPago || 0);
    if (
      clienteSelecionado &&
      clienteSelecionado.limiteDeCredito !== undefined &&
      valorRestante > Number(clienteSelecionado.limiteDeCredito)
    ) {
      alert(
        `O valor restante da venda (R$ ${valorRestante.toFixed(2)}) excede o limite de crédito do cliente (R$ ${Number(
          clienteSelecionado.limiteDeCredito
        ).toFixed(2)}).`
      );
      return;
    }
    const isCartao = venda.formaDePagamento.includes("Crédito") || venda.formaDePagamento.includes("Débito");
    const totalDeVezes = isCartao ? qtdParcelas : 1;
    const totalPagoNumber = Number(totalPago);
    if ((venda.clienteId === "0" || venda.clienteId === 0) && totalPagoNumber < venda.valorTotal) {
      alert("Cliente anônimo deve pagar o valor total da venda!");
      return;
    }
    const valorProdutos = itens.reduce((acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade), 0);
    const valor = Number(descontoValor);
    let desconto = 0;
    if (descontoTipo === "porcentagem" && !isNaN(valor)) {
      desconto = valorProdutos * (valor / 100);
    } else if (descontoTipo === "decimal" && !isNaN(valor)) {
      desconto = valor;
    }
    const vendaBody = {
      funcionarioId: Number(venda.funcionarioId),
      clienteId: Number(venda.clienteId),
      totalDeItens: venda.totalDeItens,
      valorTotal: venda.valorTotal,
      totalPago: totalPagoNumber,
      formaDePagamento: venda.formaDePagamento,
      totalDeVezes: totalDeVezes,
      dataVenda: new Date(venda.dataVenda).toISOString(),
      desconto: desconto,
      formaDeDesconto: descontoTipo ? [descontoTipo] : [],
    };
    const resVenda = await fetch(linkVen, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendaBody),
    });
    if (!resVenda.ok) {
      alert("Erro ao salvar venda");
      return;
    }
    const vendaSalva = await resVenda.json();
    if (totalPagoNumber > 0) {
      const pagamentoBody = {
        funcionarioId: Number(venda.funcionarioId),
        clienteId: Number(venda.clienteId),
        vendaId: vendaSalva.id,
        totalPago: totalPagoNumber,
        desconto: desconto,
        formaDePagamento: Array.isArray(venda.formaDePagamento) ? venda.formaDePagamento : [venda.formaDePagamento],
        totalDeVezes: totalDeVezes,
        dataPagamento: new Date().toISOString(),
      };
      await fetch(linkPag, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });
    }
    for (const i of itens) {
      await fetch(linkVenItens, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendaId: vendaSalva.id,
          produtoId: Number(i.produtoId),
          valorDoItem: Number(i.valorDoItem),
          quantidade: Number(i.quantidade),
        }),
      });
      const produto = produtos.find((p) => p.id === Number(i.produtoId));
      if (produto) {
        await fetch(`${linkPro}/${produto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...produto, quantidade: produto.quantidade - i.quantidade }),
        });
      }
    }
    if (Number(venda.clienteId) > 0) {
      await apiFetch(`/api/cliente/${venda.clienteId}/recalcular-totais`, { method: "PATCH" });
    }
    if (totalPagoNumber > 0 && (venda.formaDePagamento.includes("Dinheiro") || formaDePagamento === "Dinheiro")) {
      await apiFetch("/api/caixa/entrada", {
        method: "POST",
        body: JSON.stringify({
          valor: Number(totalPagoNumber),
          descricao: `Venda ${vendaSalva.id} - Cliente ${venda.clienteId}`,
          tipo: "Entrada",
        }),
      });
    }
    alert("Venda cadastrada com sucesso!");
    navigate("../Venda/ListagemVenda");
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Nova venda</h1>
          <p className="pdv-subtitle">Adicione os produtos e finalize a venda.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <form className="pdv-form-card" onSubmit={handleSubmit}>
          <div className="pdv-form-grid">
            <div>
              <label className="hp-lb">Cliente *</label>
              <select
                className="hp-inp"
                required
                value={venda.clienteId}
                onChange={(e) => setVenda((v) => ({ ...v, clienteId: e.target.value }))}
              >
                <option value="">Selecione um cliente</option>
                <option value="0">Cliente anônimo</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="hp-lb">CPF do cliente</label>
              <input
                className="hp-inp"
                type="text"
                value={
                  venda.clienteId === "0" || venda.clienteId === 0
                    ? "Não informado"
                    : clientes.find((c) => c.id === Number(venda.clienteId))?.cpf || ""
                }
                disabled
              />
            </div>

            <div>
              <label className="hp-lb">Funcionário *</label>
              <select
                className="hp-inp"
                required
                value={venda.funcionarioId}
                onChange={(e) => setVenda((v) => ({ ...v, funcionarioId: e.target.value }))}
              >
                <option value="">Selecione um funcionário</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="hp-lb">Forma de pagamento *</label>
              <select className="hp-inp" required value={formaDePagamento} onChange={handleFormaPagamento}>
                <option value="">Selecione</option>
                {formasPagamento.map((fp) => (
                  <option key={fp} value={fp}>{fp}</option>
                ))}
              </select>
            </div>

            {mostrarParcelas && (
              <div>
                <label className="hp-lb">Parcelas</label>
                <select className="hp-inp" value={qtdParcelas} onChange={(e) => setQtdParcelas(Number(e.target.value))}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}x</option>
                  ))}
                </select>
              </div>
            )}

            {(formaDePagamento === "Pix" || formaDePagamento === "Dinheiro") && (
              <div className="pdv-form-col-full">
                <label className="hp-lb">Desconto</label>
                {!descontoTipo && (
                  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                      <input type="checkbox" onChange={() => setDescontoTipo("porcentagem")} checked={descontoTipo === "porcentagem"} />
                      Porcentagem
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                      <input type="checkbox" onChange={() => setDescontoTipo("decimal")} checked={descontoTipo === "decimal"} />
                      Reais
                    </label>
                  </div>
                )}
                {descontoTipo && (
                  <input
                    className="hp-inp"
                    type="number"
                    min={0}
                    max={descontoTipo === "porcentagem" ? 100 : venda.valorTotal || 0}
                    value={descontoValor}
                    onChange={(e) => setDescontoValor(e.target.value)}
                    placeholder={descontoTipo === "porcentagem" ? "Desconto em %" : "Desconto em reais"}
                  />
                )}
              </div>
            )}

            <div>
              <label className="hp-lb">Total pago</label>
              <input
                type="number"
                className="hp-inp"
                placeholder={`R$ ${venda.valorTotal.toFixed(2)}`}
                value={totalPago}
                min={0}
                step="0.01"
                max={venda.valorTotal.toFixed(2)}
                onChange={(e) => setTotalPago(e.target.value)}
              />
            </div>

            <div className="pdv-form-col-full" style={{ borderTop: "1px solid var(--border-default)", paddingTop: 16, marginTop: 4 }}>
              <label className="hp-lb">Adicionar produto</label>
              <div style={{ display: "flex", gap: 10 }}>
                <select className="hp-inp" value={item.produtoId} onChange={handleProdutoChange}>
                  <option value="">Produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>{p.descricao} (Estoque: {p.quantidade})</option>
                  ))}
                </select>
                <input
                  className="hp-inp"
                  type="number"
                  min={1}
                  placeholder={item.produtoId ? `Qtd (máx ${produtos.find((p) => p.id === Number(item.produtoId))?.quantidade || 1})` : "Quantidade"}
                  value={item.quantidade}
                  max={item.produtoId ? produtos.find((p) => p.id === Number(item.produtoId))?.quantidade || 1 : 1}
                  onChange={(e) => setItem((i) => ({ ...i, quantidade: e.target.value }))}
                  style={{ maxWidth: 160 }}
                />
                <button type="button" className="pdv-btn pdv-btn--ghost" onClick={handleAddItem} style={{ flexShrink: 0 }}>
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <div className="pdv-form-actions" style={{ justifyContent: "flex-start", marginTop: 22 }}>
            <button className="pdv-btn pdv-btn--primary" type="submit" disabled={itens.length === 0 || !venda.clienteId}>
              Finalizar venda
            </button>
          </div>
        </form>

        <div className="pdv-card">
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Valor uni.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 ? (
                  <tr><td colSpan={4}><p className="pdv-empty">Nenhum item adicionado ainda.</p></td></tr>
                ) : (
                  itens.map((i) => (
                    <tr key={i.tempId}>
                      <td>{produtos.find((p) => p.id === Number(i.produtoId))?.descricao || ""}</td>
                      <td>{i.quantidade}</td>
                      <td>R$ {Number(i.valorDoItem).toFixed(2)}</td>
                      <td>
                        <div className="pdv-table-actions">
                          <button
                            type="button"
                            className="pdv-icon-btn pdv-btn--sm"
                            onClick={() => handleCancelOne(i.tempId)}
                            disabled={i.quantidade <= 1}
                            title="Cancelar 1 unidade"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            className="pdv-icon-btn pdv-icon-btn--danger"
                            onClick={() => handleRemoveItem(i.tempId)}
                            title="Remover produto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-default)", fontSize: 14 }}>
            Valor total: <strong>R$ {venda.valorTotal.toFixed(2)}</strong>
            {descontoTipo && descontoValor && (
              <span style={{ marginLeft: 16, color: "var(--success-fg)" }}>
                (Desconto: {descontoTipo === "porcentagem" ? `${descontoValor}%` : `R$ ${Number(descontoValor).toFixed(2)}`})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
