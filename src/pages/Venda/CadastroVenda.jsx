import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkPro } from "../Produto/linkPro";
import { linkVenItens } from "../ItensVenda/linkVenItens";

import "./Venda.css";


export function CadastroVenda() {
  const navigate = useNavigate();



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
    navigate('../Venda/ListagemVenda')
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
    "Crediário",
    "Consignação",
  ];

  return (
    <div className="centroCadastroVendas">
        <div className="cadastroVendaTela">
      <h1 className="cadastroVendaTitulo">Vender</h1>
      <div className="cadastroVendaGrid">
        <form className="cadastroVendaForm" onSubmit={handleSubmit}>
          
        <div className="dividirInputVenda">
     
            <select
              className="cadastroVendaInput"
              required
              placeholder="Cliente"
              value={venda.clienteId}
              onChange={e => setVenda(v => ({ ...v, clienteId: e.target.value }))}
            >
              <option value="1">Cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            </div>
          <div className="dividirInputVenda">
        
            <input
              className="cadastroVendaInput"
              type="text"
              placeholder="CPF do Cliente
"
              value={clientes.find(c => c.id === Number(venda.clienteId))?.cpf || ""}
              disabled
            />
            </div>
          <div className="dividirInputVenda">
          <select
              className="cadastroVendaInput"
              required
              placeholder="Funcionário"
              value={venda.funcionarioId}
              onChange={e => setVenda(v => ({ ...v, funcionarioId: e.target.value }))}
            >
              <option value="">Funcionário</option>
              {funcionarios.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
            </div>
     
          <div className="dividirInputVenda">
         
            <select
              className="cadastroVendaInput"
              required
              value={venda.formaDePagamento}
              placeholder="Forma de pagamento"
              onChange={e =>
                setVenda(v => ({
                  ...v,
                  formaDePagamento: Array.from(e.target.selectedOptions, o => o.value),
                }))
              }
            >
                <option value="">Forma de pagamento</option>
            
              {formasPagamento.map(fp => (
                <option key={fp} value={fp}>{fp}</option>
              ))}
            </select>
            </div>
          <div className="dividirInputVenda">
    
            <select
              className="cadastroVendaInput"
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
            </div>
          <div className="dividirInputVenda">
        
            <input
              className="cadastroVendaInput"
              type="number"
              placeholder="Quantidade"
              min={1}
              max={
                item.produtoId
                  ? produtos.find(p => p.id === Number(item.produtoId))?.quantidade || 1
                  : 1
              }
              value={item.quantidade}
              onChange={handleQuantidadeChange}
              
            />
            </div>
       
              <div className="cadastroVendaBtnDiv">
              <button
            type="button"
            className="cadastroVendaBtn"
            onClick={handleAddItem}
          >
            Adicionar Produto
          </button>
              </div>
       
        
            
            <div className="cadastroVendaDivFinalizar dividirInputVenda">

            <button
              className="cadastroVendaBtnFinalizar"
              type="submit"
              form="formCadastroVenda"
              onClick={handleSubmit}
              disabled={itens.length === 0}
            >
              Finalizar Venda
            </button>
          </div>
        </form>
        <div className="cadastroVendaTabelaWrapper">
          <table className="cadastroVendaTabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor uni</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>Nenhum item</td>
                </tr>
              ) : (
                itens.map(i => (
                  <tr key={i.tempId}>
                    <td>{produtos.find(p => p.id === Number(i.produtoId))?.id || i.produtoId}</td>
                    <td>{produtos.find(p => p.id === Number(i.produtoId))?.descricao || i.produtoId}</td>
                    <td>{i.quantidade}</td>
                    <td>R$ {Number(i.valorDoItem).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
           <div className="cadastroVendaValorTotalTabela">
            Valor total: <strong>R$ {venda.valorTotal.toFixed(2)}</strong>
          </div>
        
   

        </div>
      </div>
    </div>
    </div>
  
  );
}