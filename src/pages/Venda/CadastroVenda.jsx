import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkPro } from "../Produto/linkPro";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPag } from "../Pagamento/linkPag";

import "./Venda.css";

export function CadastroVenda() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [qtdParcelas, setQtdParcelas] = useState(1);
  const [formaDePagamento, setFormaDePagamento] = useState("");
  const [descontoTipo, setDescontoTipo] = useState("");
  const [descontoValor, setDescontoValor] = useState("");
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

  const [item, setItem] = useState({
    produtoId: "",
    valorDoItem: "",
    quantidade: 1,
  });

  useEffect(() => {
    fetch(linkFun)
      .then((r) => r.json())
      .then(setFuncionarios);
    fetch(linkCli)
      .then((r) => r.json())
      .then(setClientes);
    fetch(linkPro)
      .then((r) => r.json())
      .then(setProdutos);
  }, []);

  useEffect(() => {
    setVenda((v) => ({
      ...v,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
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
      });
  }, [id]);

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
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }

    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return alert("Produto inválido.");

    if (item.quantidade > produto.quantidade) {
      alert("Quantidade maior que o estoque!");
      return;
    }

    setItens([
      ...itens,
      { ...item, produtoId, tempId: Date.now() + Math.random() },
    ]);
    setItem({ produtoId: "", valorDoItem: "", quantidade: 1 });
  };

  const handleRemoveItem = (tempId) => {
    setItens(itens.filter((i) => i.tempId !== tempId));
  };

  const handleFormaPagamento = (e) => {
    const value = e.target.value;
    setFormaDePagamento(value);
    setDescontoTipo("");
    setDescontoValor("");
    setVenda((v) => ({ ...v, formaDePagamento: [value] }));

    const parcelasDiv = document.getElementById("QtdParcelas");
    if (value === "Crédito" || value === "Débito") {
      parcelasDiv.style.display = "block";
    } else {
      parcelasDiv.style.display = "none";
      setQtdParcelas(1);
    }
  };

  // Cálculo do valor com desconto aplicado
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venda.funcionarioId || !venda.clienteId || itens.length === 0) {
      alert(
        "Preencha todos os campos obrigatórios e adicione pelo menos um item."
      );
      return;
    }

    const isCartao =
      venda.formaDePagamento.includes("Crédito") ||
      venda.formaDePagamento.includes("Débito");
    const totalDeVezes = isCartao ? qtdParcelas : 1;
    const totalPagoNumber = Number(totalPago);

    const valorProdutos = itens.reduce(
      (acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade),
      0
    );

    const valor = Number(descontoValor);
    let desconto = 0;

    if (descontoTipo === "porcentagem" && !isNaN(valor)) {
      desconto = valorProdutos * (valor / 100);
    } else if (descontoTipo === "decimal" && !isNaN(valor)) {
      desconto = valor;
    }

    const valorFinal = valorProdutos - desconto;

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

    // Cria o pagamento automaticamente se totalPago > 0
    if (totalPagoNumber > 0) {
      const pagamentoBody = {
        FuncionarioId: Number(venda.funcionarioId),
        ClienteId: Number(venda.clienteId),
        VendaId: vendaSalva.id,
        TotalPago: totalPagoNumber,
        Desconto: desconto,
        FormaDePagamento: Array.isArray(venda.formaDePagamento)
          ? venda.formaDePagamento
          : [venda.formaDePagamento],
        ToTalDeVezes: totalDeVezes,
        DataPagamento: new Date().toISOString(),
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
          body: JSON.stringify({
            ...produto,
            quantidade: produto.quantidade - i.quantidade,
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
    setTotalPago(0);
    fetch(linkPro)
      .then((r) => r.json())
      .then(setProdutos);
  };

  const formasPagamento = [
    "Dinheiro",
    "Débito",
    "Pix",
    "Crédito",
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
                value={venda.clienteId}
                onChange={(e) =>
                  setVenda((v) => ({ ...v, clienteId: e.target.value }))
                }
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
                value={
                  clientes.find((c) => c.id === Number(venda.clienteId))?.cpf ||
                  ""
                }
                disabled
              />
            </div>

            <div className="dividirInputVenda">
              <select
                className="cadastroVendaInput"
                required
                value={venda.funcionarioId}
                onChange={(e) =>
                  setVenda((v) => ({ ...v, funcionarioId: e.target.value }))
                }
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
                value={formaDePagamento}
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
              id="QtdParcelas"
              style={{ display: "none" }}
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

            {(formaDePagamento === "Pix" ||
              formaDePagamento === "Dinheiro") && (
              <>
                {!descontoTipo && (
                  <div className="dividirInputVenda">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setDescontoTipo("porcentagem")}
                      />{" "}
                      Porcentagem
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setDescontoTipo("decimal")}
                      />{" "}
                      Reais
                    </label>
                  </div>
                )}
                {descontoTipo && (
                  <div className="dividirInputVenda">
                    <input
                      className="cadastroVendaInput"
                      type="number"
                      min={0}
                      max={
                        descontoTipo === "porcentagem"
                          ? 100
                          : venda.valorTotal || 0
                      }
                      value={descontoValor}
                      onChange={(e) => setDescontoValor(e.target.value)}
                      placeholder={
                        descontoTipo === "porcentagem"
                          ? "Desconto em %"
                          : "Desconto em reais"
                      }
                    />
                  </div>
                )}
              </>
            )}
            <div className="dividirInputVenda">
              <input
                type="number"
                className="cadastroVendaInput"
                value={totalPago}
                min={0}
                max={venda.valorTotal}
                onChange={(e) => setTotalPago(e.target.value)}
                placeholder="Total Pago"
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
                    ? produtos.find((p) => p.id === Number(item.produtoId))
                        ?.quantidade || 1
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
                        {produtos.find((p) => p.id === Number(i.produtoId))
                          ?.descricao || ""}
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
              {descontoTipo && descontoValor && (
                <span style={{ marginLeft: 16, color: "#2d7a2d" }}>
                  (Desconto:{" "}
                  {descontoTipo === "porcentagem"
                    ? `${descontoValor}%`
                    : `R$ ${Number(descontoValor).toFixed(2)}`}
                  )
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
