import React, { useState, useEffect } from "react";

import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkPro } from "../Produto/linkPro";
import { linkVenItens } from "../ItensVenda/linkVenItens";

import "./Venda.css";

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
    quantidade: 1,
  });

  // Carregar funcionários, clientes e produtos
  useEffect(() => {
    fetch(linkFun).then(r => r.json()).then(setFuncionarios);
    fetch(linkCli).then(r => r.json()).then(setClientes);
    fetch(linkPro).then(r => r.json()).then(setProdutos);
  }, []);

  // Atualiza total de itens e valor total
  useEffect(() => {
    setVenda(v => ({
      ...v,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
      valorTotal: itens.reduce((acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade), 0),
    }));
  }, [itens]);

  // Quando seleciona um produto, preenche o valor automaticamente
  const handleProdutoChange = (e) => {
    const produtoIdStr = e.target.value;
    const produtoId = Number(produtoIdStr);
    const produtoSelecionado = produtos.find(p => p.id === produtoId);
    setItem({
      produtoId: produtoIdStr,
      valorDoItem: produtoSelecionado
        ? produtoSelecionado["preçoVenda"]
        : "",
      quantidade: 1,
    });
  };

  // Atualiza quantidade do item
  const handleQuantidadeChange = (e) => {
    setItem(i => ({
      ...i,
      quantidade: Number(e.target.value)
    }));
  };

  // Adiciona item à venda (usa tempId só para o React)
  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    if (!produtoId || !item.valorDoItem || !item.quantidade) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }

    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) {
      alert("Selecione um produto válido.");
      return;
    }
    if (item.quantidade > produto.quantidade) {
      alert("Quantidade solicitada maior que o estoque disponível!");
      return;
    }

    setItens([...itens, { ...item, produtoId, tempId: Date.now() + Math.random() }]);
    setItem({ produtoId: "", valorDoItem: "", quantidade: 1 });
  };

  // Remove item pelo tempId
  const handleRemoveItem = (tempId) => {
    setItens(itens.filter(i => i.tempId !== tempId));
  };

  // Salva venda e itens, e atualiza estoque dos produtos
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venda.funcionarioId || !venda.clienteId || itens.length === 0) {
      alert("Preencha todos os campos obrigatórios e adicione pelo menos um item.");
      return;
    }
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

    // Salva itens e atualiza estoque
    for (const i of itens) {
      await fetch(linkVenItens, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          VendaId: vendaSalva.id,
          ProdutoId: Number(i.produtoId),
          ValorDoItem: Number(i.valorDoItem),
          quantidade: Number(i.quantidade),
        }),
      });
      // Atualiza estoque do produto
      const produto = produtos.find(p => p.id === Number(i.produtoId));
      if (produto) {
        await fetch(`${linkPro}/${produto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...produto,
            quantidade: produto.quantidade - i.quantidade,
          }),
        });
      }
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
    fetch(linkPro).then(r => r.json()).then(setProdutos);
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
    <div className="CadastroVenda">
      <h1>Cadastro de Venda</h1>
      <form className="formCadastroVenda" onSubmit={handleSubmit}>
        <label>
          Funcionário:
          <select
            className="inputCadastroVenda"
            required
            value={venda.funcionarioId}
            onChange={e =>
              setVenda(v => ({ ...v, funcionarioId: e.target.value }))
            }
          >
            <option value="">Selecione</option>
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cliente:
          <select
            className="inputCadastroVenda"
            required
            value={venda.clienteId}
            onChange={e =>
              setVenda(v => ({ ...v, clienteId: e.target.value }))
            }
          >
            <option value="">Selecione</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data da Venda:
          <input
            className="inputCadastroVenda"
            type="datetime-local"
            required
            value={venda.dataVenda}
            onChange={e =>
              setVenda(v => ({ ...v, dataVenda: e.target.value }))
            }
          />
        </label>
        <label>
          Forma de Pagamento:
          <select
            className="inputCadastroVenda"
            multiple
            value={venda.formaDePagamento}
            onChange={e =>
              setVenda(v => ({
                ...v,
                formaDePagamento: Array.from(
                  e.target.selectedOptions,
                  o => o.value
                ),
              }))
            }
          >
            {formasPagamento.map(fp => (
              <option key={fp} value={fp}>
                {fp}
              </option>
            ))}
          </select>
        </label>
        <hr />
        <h3>Itens da Venda</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="inputCadastroVenda"
            value={item.produtoId}
            onChange={handleProdutoChange}
          >
            <option value="">Produto</option>
            {produtos.map(p => (
              <option key={p.id} value={p.id}>
                {p.descricao} (Estoque: {p.quantidade})
              </option>
            ))}
          </select>
          <input
            className="inputCadastroVenda"
            type="number"
            min={1}
            max={
              item.produtoId
                ? produtos.find(p => p.id === Number(item.produtoId))?.quantidade || 1
                : 1
            }
            value={item.quantidade}
            onChange={handleQuantidadeChange}
            placeholder="Qtd"
            style={{ width: 70 }}
          />
          <span style={{ minWidth: 110, textAlign: "center" }}>
            {item.valorDoItem
              ? `R$ ${Number(item.valorDoItem).toFixed(2)}`
              : ""}
          </span>
          <button type="button" className="btnAddItem" onClick={handleAddItem}>
            Adicionar Item
          </button>
        </div>
        <ul>
          {itens.map(i => (
            <li key={i.tempId} className="itemVendaLi">
              Produto:{" "}
              {produtos.find(p => p.id === Number(i.produtoId))?.descricao || i.produtoId}{" "}
              | Valor: R$ {Number(i.valorDoItem).toFixed(2)}
              {" | Qtd: "}{i.quantidade}
              <button type="button" className="btnRemoveItem" onClick={() => handleRemoveItem(i.tempId)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
        <div>
          <strong>Total de Itens:</strong> {venda.totalDeItens}
        </div>
        <div>
          <strong>Valor Total:</strong> R$ {venda.valorTotal.toFixed(2)}
        </div>
        <button type="submit" className="btnSalvarVenda">Salvar Venda</button>
      </form>
    </div>
  );
}