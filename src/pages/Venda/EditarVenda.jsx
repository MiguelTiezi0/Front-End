import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Venda.css";
import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../Produto/linkPro";

export function EditarVenda() {
  document.title = "Editar Venda";
  const { id } = useParams();
  const navigate = useNavigate();
  const [venda, setVenda] = useState({
    funcionarioId: "",
    clienteId: "",
    totalDeItens: 0,
    valorTotal: 0,
    formaDePagamento: [],
    dataVenda: "",
  });
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [novoItem, setNovoItem] = useState({
    produtoId: "",
    valorDoItem: "",
    quantidade: 1,
  });

  useEffect(() => {
    fetch(`${linkVen}/${id}`)
      .then(r => r.json())
      .then(data => {
        setVenda({
          funcionarioId: data.funcionarioId,
          clienteId: data.clienteId,
          totalDeItens: data.totalDeItens,
          valorTotal: data.valorTotal,
          formaDePagamento: data.formaDePagamento || [],
          dataVenda: data.dataVenda ? data.dataVenda.slice(0, 16) : "",
        });
      });
    fetch(linkFun).then(r => r.json()).then(setFuncionarios);
    fetch(linkCli).then(r => r.json()).then(setClientes);
    fetch(linkVenItens)
      .then(r => r.json())
      .then(data => setItens(data.filter(i => Number(i.vendaId ?? i.VendaId) === Number(id))));
    fetch(linkPro).then(r => r.json()).then(setProdutos);
  }, [id]);

  useEffect(() => {
    setVenda(v => ({
      ...v,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
      valorTotal: itens.reduce((acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade), 0),
    }));
  }, [itens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenda((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormaPagamentoChange = (e) => {
    setVenda((prev) => ({
      ...prev,
      formaDePagamento: Array.from(e.target.selectedOptions, o => o.value),
    }));
  };

  const handleCancelarItem = async (itemId) => {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    if (item.quantidade > 1) {
      await fetch(`${linkVenItens}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          quantidade: item.quantidade - 1,
        }),
      });
      setItens(itens.map(i => i.id === itemId ? { ...i, quantidade: i.quantidade - 1 } : i));
    } else {
      await fetch(`${linkVenItens}/${itemId}`, { method: "DELETE" });
      setItens(itens.filter(i => i.id !== itemId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendaBody = {
      Id: Number(id),
      FuncionarioId: Number(venda.funcionarioId),
      ClienteId: Number(venda.clienteId),
      TotalDeItens: Number(venda.totalDeItens),
      ValorTotal: Number(venda.valorTotal),
      FormaDePagamento: venda.formaDePagamento,
      DataVenda: new Date(venda.dataVenda).toISOString(),
    };
    const response = await fetch(`${linkVen}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendaBody),
    });
    if (!response.ok) {
      alert("Erro ao atualizar a venda");
      return;
    }
    navigate("/Venda/ListagemVenda");
  };

  const handleNovoItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem(i => ({
      ...i,
      [name]: name === "quantidade" ? Number(value) : value,
      valorDoItem:
        name === "produtoId"
          ? produtos.find(p => p.id === Number(value))?.preçoVenda || ""
          : i.valorDoItem,
    }));
  };

  const handleAdicionarItem = async () => {
    if (!novoItem.produtoId || !novoItem.valorDoItem || !novoItem.quantidade) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }
    const res = await fetch(linkVenItens, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        VendaId: Number(id),
        ProdutoId: Number(novoItem.produtoId),
        ValorDoItem: Number(novoItem.valorDoItem),
        quantidade: Number(novoItem.quantidade),
      }),
    });
    if (res.ok) {
      const itemSalvo = await res.json();
      setItens([...itens, itemSalvo]);
      setNovoItem({ produtoId: "", valorDoItem: "", quantidade: 1 });
    } else {
      alert("Erro ao adicionar item!");
    }
  };

  const formasPagamento = [
    "Dinheiro",
    "Cartão",
    "Pix",
    "Boleto",
    "Crediário",
    "Consignação",
  ];

  return (
    <div className="centroEditarVen" style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
      <div className="EditarVenda" style={{ background: "#222", padding: 32, borderRadius: 12, minWidth: 420, maxWidth: 700, color: "#fff" }}>
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>Editar Venda</h1>
        <form className="divEditarVenda" onSubmit={handleSubmit}>
          <fieldset style={{ border: "1px solid #444", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <legend style={{ padding: "0 8px" }}>Dados da Venda</legend>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <input
                type="text"
                name="id"
                readOnly
                value={id}
                className="inputEditarVenda inputIdEditarVenda"
                style={{ flex: 1 }}
              />
              <input
                type="datetime-local"
                name="dataVenda"
                required
                className="inputEditarVenda"
                value={venda.dataVenda}
                onChange={handleChange}
                style={{ flex: 2 }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <select
                name="funcionarioId"
                className="inputEditarVenda"
                required
                value={venda.funcionarioId}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="">Funcionário</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
              <select
                name="clienteId"
                className="inputEditarVenda"
                required
                value={venda.clienteId}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="">Cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <input
                type="number"
                name="totalDeItens"
                required
                placeholder="Total de Itens"
                className="inputEditarVenda"
                value={venda.totalDeItens}
                readOnly
                style={{ flex: 1 }}
              />
              <input
                type="number"
                name="valorTotal"
                required
                placeholder="Valor Total"
                className="inputEditarVenda"
                value={venda.valorTotal}
                readOnly
                style={{ flex: 1 }}
              />
            </div>
            <select
              className="inputEditarVenda"
              multiple
              value={venda.formaDePagamento}
              onChange={handleFormaPagamentoChange}
              style={{ width: "100%", marginBottom: 0 }}
            >
              {formasPagamento.map(fp => (
                <option key={fp} value={fp}>{fp}</option>
              ))}
            </select>
          </fieldset>

          <fieldset style={{ border: "1px solid #444", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <legend style={{ padding: "0 8px" }}>Adicionar Item</legend>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                name="produtoId"
                className="inputCadastroVenda"
                value={novoItem.produtoId}
                onChange={handleNovoItemChange}
                style={{ flex: 2 }}
              >
                <option value="">Produto</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.descricao} (Estoque: {p.quantidade})
                  </option>
                ))}
              </select>
              <input
                name="quantidade"
                type="number"
                min={1}
                value={novoItem.quantidade}
                onChange={handleNovoItemChange}
                placeholder="Qtd"
                style={{ width: 70, flex: 1 }}
              />
              <span style={{ minWidth: 110, textAlign: "center", flex: 1 }}>
                {novoItem.valorDoItem
                  ? `R$ ${Number(novoItem.valorDoItem).toFixed(2)}`
                  : ""}
              </span>
              <button type="button" className="btnAddItem" onClick={handleAdicionarItem} style={{ flex: 1 }}>
                Adicionar Item
              </button>
            </div>
          </fieldset>

          <fieldset style={{ border: "1px solid #444", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <legend style={{ padding: "0 8px" }}>Itens da Venda</legend>
            <table className="detalhesVendaTabela" style={{ width: "100%", background: "#fff", color: "#222", borderRadius: 6 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Valor uni</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {itens.map(item => {
                  const produto = produtos.find(p => p.id === Number(item.produtoId ?? item.ProdutoId));
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{produto ? produto.descricao : (item.produtoId ?? item.ProdutoId)}</td>
                      <td>{item.quantidade}</td>
                      <td>R$ {Number(item.valorDoItem ?? item.ValorDoItem).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="btnCancelarItem"
                          disabled={item.quantidade < 1}
                          onClick={() => handleCancelarItem(item.id)}
                        >
                          Cancelar 1
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </fieldset>

          <div className="buttonsGroupEditarVenda" style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <Link to="/Venda/ListagemVenda" className="linkCadastro">
              <button type="button" className="btnVenda btnVoltarVenda">
                Voltar
              </button>
            </Link>
            <button type="submit" className="btnVenda btnSalvarVenda">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}