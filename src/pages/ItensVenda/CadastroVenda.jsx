import React, { useState, useEffect } from "react";

import { linkVen } from "./linkItensVenda";
import { linkFunc } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkProd } from "../Produto/linkProd";
import { linkItensVenda } from "../linkItensVenda";

import "./CadastroVenda.css";
export function CadastroVenda() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [venda, setVenda] = useState({
    funcionarioId: "",
    clienteId: "",
    totalDeItens: 0,
    valorTotal: 0,
    formaDePagamento: [],
    dataVenda: new Date().toISOString().slice(0, 16),
  });
  const [item, setItem] = useState({
    produtoId: "",
    valorDoItem: "",
  });

  // Carregar funcionários, clientes e produtos
  useEffect(() => {
    fetch(linkFunc).then(r => r.json()).then(setFuncionarios);
    fetch(linkCli).then(r => r.json()).then(setClientes);
    fetch(linkProd).then(r => r.json()).then(setProdutos);
  }, []);

  // Atualiza total de itens e valor total
  useEffect(() => {
    setVenda(v => ({
      ...v,
      totalDeItens: itens.length,
      valorTotal: itens.reduce((acc, i) => acc + Number(i.valorDoItem), 0),
    }));
  }, [itens]);

  // Quando seleciona um produto, preenche o valor automaticamente
  const handleProdutoChange = (e) => {
    const produtoId = e.target.value;
    const produtoSelecionado = produtos.find(p => String(p.id) === produtoId);
    setItem({
      produtoId,
      valorDoItem: produtoSelecionado ? produtoSelecionado.precoVenda || produtoSelecionado.valor || "" : "",
    });
  };

  // Adiciona item à venda
  const handleAddItem = () => {
    if (!item.produtoId || !item.valorDoItem) return;
    setItens([...itens, { ...item, id: Date.now(), vendaId: 0 }]);
    setItem({ produtoId: "", valorDoItem: "" });
  };

  // Remove item
  const handleRemoveItem = (id) => {
    setItens(itens.filter(i => i.id !== id));
  };

  // Salva venda e itens
  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendaBody = {
      funcionarioId: Number(venda.funcionarioId),
      clienteId: Number(venda.clienteId),
      totalDeItens: venda.totalDeItens,
      valorTotal: venda.valorTotal,
      formaDePagamento: venda.formaDePagamento,
      dataVenda: new Date(venda.dataVenda).toISOString(),
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

    // Salva itens
    for (const i of itens) {
      await fetch(linkItensVenda, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendaId: vendaSalva.id,
          produtoId: Number(i.produtoId),
          valorDoItem: Number(i.valorDoItem),
        }),
      });
    }
    alert("Venda cadastrada com sucesso!");
    setItens([]);
    setVenda({
      funcionarioId: "",
      clienteId: "",
      totalDeItens: 0,
      valorTotal: 0,
      formaDePagamento: [],
      dataVenda: new Date().toISOString().slice(0, 16),
    });
  };

  const formasPagamento = ["Dinheiro", "Cartão", "Pix", "Boleto", "Crediário", "Consignação"];

  return (
    <div className="CadastroVenda">
      <h1>Cadastro de Venda</h1>
      <form className="formCadastroVenda" onSubmit={handleSubmit}>
        <label>
          Funcionário:
          <select
            required
            value={venda.funcionarioId}
            onChange={e => setVenda(v => ({ ...v, funcionarioId: e.target.value }))}
          >
            <option value="">Selecione</option>
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </label>
        <label>
          Cliente:
          <select
            required
            value={venda.clienteId}
            onChange={e => setVenda(v => ({ ...v, clienteId: e.target.value }))}
          >
            <option value="">Selecione</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </label>
        <label>
          Data da Venda:
          <input
            type="datetime-local"
            required
            value={venda.dataVenda}
            onChange={e => setVenda(v => ({ ...v, dataVenda: e.target.value }))}
          />
        </label>
        <label>
          Forma de Pagamento:
          <select
            multiple
            value={venda.formaDePagamento}
            onChange={e =>
              setVenda(v => ({
                ...v,
                formaDePagamento: Array.from(e.target.selectedOptions, o => o.value),
              }))
            }
          >
            {formasPagamento.map(fp => (
              <option key={fp} value={fp}>{fp}</option>
            ))}
          </select>
        </label>
        <hr />
        <h3>Itens da Venda</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={item.produtoId}
            onChange={handleProdutoChange}
          >
            <option value="">Produto</option>
            {produtos.map(p => (
              <option key={p.id} value={p.id}>{p.descricao}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Valor do Item"
            value={item.valorDoItem}
            onChange={e => setItem(i => ({ ...i, valorDoItem: e.target.value }))}
            min={0}
            step="0.01"
          />
          <button type="button" onClick={handleAddItem}>Adicionar Item</button>
        </div>
        <ul>
          {itens.map(i => (
            <li key={i.id}>
              Produto: {produtos.find(p => String(p.id) === String(i.produtoId))?.descricao || i.produtoId} | Valor: R$ {Number(i.valorDoItem).toFixed(2)}
              <button type="button" onClick={() => handleRemoveItem(i.id)}>Remover</button>
            </li>
          ))}
        </ul>
        <div>
          <strong>Total de Itens:</strong> {venda.totalDeItens}
        </div>
        <div>
          <strong>Valor Total:</strong> R$ {venda.valorTotal.toFixed(2)}
        </div>
        <button type="submit">Salvar Venda</button>
      </form>
    </div>
  );
}