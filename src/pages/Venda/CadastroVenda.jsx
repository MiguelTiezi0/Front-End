import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkPro } from "../Produto/linkPro";
import { linkVenItens } from "../ItensVenda/linkVenItens";

import "./Venda.css";

export function CadastroVenda() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [qtdParcelas, setQtdParcelas] = useState(1);
  const [totalPago, setTotalPago] = useState(0);

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
    fetch(linkFun).then((r) => r.json()).then(setFuncionarios);
    fetch(linkCli).then((r) => r.json()).then(setClientes);
    fetch(linkPro).then((r) => r.json()).then(setProdutos);
  }, []);

  useEffect(() => {
    setVenda((v) => ({
      ...v,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
      valorTotal: itens.reduce((acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade), 0),
    }));
  }, [itens]);

  useEffect(() => {
    if (!id) return;

    fetch(`${linkVen}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVenda(data);
        setItens(data.itens || []);
        setQtdParcelas(data.totalDeVezes || 1);
        setTotalPago(data.totalPago || 0);
      });
  }, [id]);

  const [item, setItem] = useState({
    produtoId: "",
    valorDoItem: "",
    quantidade: 1,
  });

  // Atualize o handleProdutoChange:

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value);
    const produtoSelecionado = produtos.find((p) => p.id === produtoId);
    setItem({
      produtoId: e.target.value,
      valorDoItem: produtoSelecionado?.["preçoVenda"] || "",
      quantidade: 1,
    });
  };


  const handleQuantidadeChange = (e) => {
    setItem((i) => ({ ...i, quantidade: Number(e.target.value) }));
  };

  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    if (!produtoId || !item.valorDoItem || !item.quantidade) {
      console.log(produtoId, item.valorDoItem, item.quantidade)
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }

    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return alert("Produto inválido.");

    if (item.quantidade > produto.quantidade) {
      alert("Quantidade maior que o estoque!");
      return;
    }

    setItens([...itens, { ...item, produtoId, tempId: Date.now() + Math.random() }]);
    setItem({ produtoId: "", valorDoItem: "", quantidade: 1 });
  };

  const handleRemoveItem = (tempId) => {
    setItens(itens.filter((i) => i.tempId !== tempId));
  };

  const handleFormaPagamento = (e) => {
    const valor = e.target.value;
    setVenda((v) => ({ ...v, formaDePagamento: [valor] }));

    const parcelasDiv = document.getElementById("QtdParcelas");
    if (valor === "Crédito" || valor === "Débito") {
      parcelasDiv.style.display = "block";
    } else {
      parcelasDiv.style.display = "none";
      setQtdParcelas(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venda.funcionarioId || !venda.clienteId || itens.length === 0) {
      alert("Preencha todos os campos obrigatórios e adicione pelo menos um item.");
      return;
    }

    const isCartao = venda.formaDePagamento.includes("Crédito") || venda.formaDePagamento.includes("Débito");
    const totalDeVezes = isCartao ? qtdParcelas : 1;
    const totalPago = isCartao ? parseFloat((venda.valorTotal / qtdParcelas).toFixed(2)) : venda.valorTotal;

    const vendaBody = {
      funcionarioId: Number(venda.funcionarioId),
      clienteId: Number(venda.clienteId),
      totalDeItens: venda.totalDeItens,
      valorTotal: venda.valorTotal,
      totalPago: Number(totalPago),
      formaDePagamento: venda.formaDePagamento,
      totalDeVezes: totalDeVezes,
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
          body: JSON.stringify({
            ...produto,
            quantidade: produto.quantidade - i.quantidade,
          }),
        });
      }
    }

    const clienteRes = await fetch(`${linkCli}/${venda.clienteId}`);
    if (clienteRes.ok) {
      const cliente = await clienteRes.json();
      const vendasRes = await fetch(linkVen);
      if (vendasRes.ok) {
        const vendas = await vendasRes.json();
        const vendasDoCliente = vendas.filter(
          v => Number(v.clienteId ?? v.ClienteId) === Number(venda.clienteId)
        );
        const totalPagoCliente = vendasDoCliente.reduce(
          (acc, v) => acc + Number(v.TotalPago ?? 0),
          0
        );
        const totalGastoCliente = vendasDoCliente.reduce(
          (acc, v) => acc + Number(v.ValorTotal ?? 0),
          0
        );
        const totalDevidoCliente = totalGastoCliente - totalPagoCliente;

        await fetch(`${linkCli}/${venda.clienteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cliente,
            totalPago: totalPagoCliente,
            totalDevido: totalDevidoCliente,
            totalGasto: totalGastoCliente,
          }),
        });
      }
    }

    alert("Venda cadastrada com sucesso!");
    navigate("../Venda/ListagemVenda");
    setItens([]);
    setQtdParcelas(1);
    setVenda({
      funcionarioId: "",
      clienteId: "",
      totalDeItens: 0,
      valorTotal: 0,
      totalPago: 0,
      formaDePagamento: [],
      totalDeVezes: 1,
      dataVenda: new Date().toISOString().slice(0, 16),
    });
    fetch(linkPro).then((r) => r.json()).then(setProdutos);
  };

  const formasPagamento = ["Dinheiro", "Débito", "Pix", "Crédito", "Crediário", "Consignação"];

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
                value={venda.clienteId}
                onChange={(e) => setVenda((v) => ({ ...v, clienteId: e.target.value }))}
              >
                <option value="">Cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="dividirInputVenda">
              <input
                className="cadastroVendaInput"
                type="text"
                placeholder="CPF do Cliente"
                value={clientes.find((c) => c.id === Number(venda.clienteId))?.cpf || ""}
                disabled
              />
            </div>
            <div className="dividirInputVenda">
              <select
                className="cadastroVendaInput"
                required
                value={venda.funcionarioId}
                onChange={(e) => setVenda((v) => ({ ...v, funcionarioId: e.target.value }))}
              >
                <option value="">Funcionário</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="dividirInputVenda">
              <select
                className="cadastroVendaInput"
                required
                id="formaDePagamento"
                value={venda.formaDePagamento}
                onChange={handleFormaPagamento}
              >
                <option value="">Forma de pagamento</option>
                {formasPagamento.map((fp) => (
                  <option key={fp} value={fp}>
                    {fp}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="dividirInputVenda"
              style={{ display: "none" }}
              id="QtdParcelas"
            >
              <select
                className="cadastroVendaInput"
                value={qtdParcelas}
                onChange={(e) => setQtdParcelas(Number(e.target.value))}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}x
                  </option>
                ))}
              </select>
            </div>

            <div className="dividirInputVenda">
              <input
                type="text"
                className="cadastroVendaInput"
                value={totalPago}
                onChange={(e) => setTotalPago(e.target.value)}
                placeholder="Total Pago"
                min={0}
              />
            </div>

            <div className="dividirInputVenda">
              <select
                className="cadastroVendaInput"
                value={item.produtoId}
                onChange={handleProdutoChange}
              >
                <option value="">Produto</option>
                {produtos.map((p) => (
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
                min={1}
                value={item.quantidade}
                max={
                  item.produtoId
                    ? produtos.find((p) => p.id === Number(item.produtoId))?.quantidade || 1
                    : 1
                }
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
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Nenhum item
                    </td>
                  </tr>
                ) : (
                  itens.map((i) => (
                    <tr key={i.tempId}>
                      <td>{i.produtoId}</td>
                      <td>
                        {produtos.find((p) => p.id === Number(i.produtoId))?.descricao || ""}
                      </td>
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