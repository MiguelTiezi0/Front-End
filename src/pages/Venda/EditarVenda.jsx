import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Venda.css";

import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../Produto/linkPro";
import { linkPag } from "../Pagamento/linkPag"; // IMPORTANTE

export function EditarVenda() {
  const { id } = useParams();
  const navigate = useNavigate();
  document.title = "Editar Venda";

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
  const [produtos, setProdutos] = useState([]);
  const [novoItem, setNovoItem] = useState({
    produtoId: "",
    valorDoItem: "",
    quantidade: 1,
  });
  const [itensOriginais, setItensOriginais] = useState([]);
  const [itensEditados, setItensEditados] = useState([]);
  const [qtdParcelas, setQtdParcelas] = useState(1);
  const [totalPago, setTotalPago] = useState(0);

  // Desconto
  const [descontoTipo, setDescontoTipo] = useState("");
  const [descontoValor, setDescontoValor] = useState("");

  useEffect(() => {
    fetch(`${linkVen}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVenda({
          funcionarioId: data.funcionarioId,
          clienteId: data.clienteId,
          totalDeItens: data.totalDeItens,
          valorTotal: data.valorTotal,
          formaDePagamento: data.formaDePagamento || [],
          dataVenda: data.dataVenda ? data.dataVenda.slice(0, 16) : "",
        });
        setQtdParcelas(data.totalDeVezes || 1);
        setTotalPago(data.totalPago || 0);

        // Se vier desconto do backend, tente deduzir tipo
        if (data.desconto) {
          setDescontoValor(data.desconto);
          // O tipo não é salvo, então deixe o usuário escolher ao editar
        }
      });
    fetch(linkFun)
      .then((r) => r.json())
      .then(setFuncionarios);
    fetch(linkCli)
      .then((r) => r.json())
      .then(setClientes);
    fetch(linkVenItens)
      .then((r) => r.json())
      .then((data) => {
        const itensDaVenda = data.filter(
          (i) => Number(i.vendaId ?? i.VendaId) === Number(id)
        );
        setItensOriginais(itensDaVenda);
        setItensEditados(itensDaVenda.map((item) => ({ ...item })));
      });
    fetch(linkPro)
      .then((r) => r.json())
      .then(setProdutos);
  }, [id]);

  // Recalcula valor total com desconto
  useEffect(() => {
    const valorProdutos = itensEditados.reduce(
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
    setVenda((v) => ({
      ...v,
      valorTotal: Math.max(0, valorProdutos - desconto),
      totalDeItens: itensEditados.reduce((acc, i) => acc + Number(i.quantidade), 0),
    }));
  }, [itensEditados, descontoTipo, descontoValor]);

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
      formaDePagamento: Array.from(e.target.selectedOptions, (o) => o.value),
    }));
  };

  const handleCancelarItem = (itemId) => {
    setItensEditados((prev) =>
      prev
        .map((item) =>
          item.id === itemId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const handleAdicionarItem = () => {
    if (!novoItem.produtoId || !novoItem.valorDoItem || !novoItem.quantidade) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }
    const tempId = Math.min(0, ...itensEditados.map((i) => i.id || 0)) - 1;
    setItensEditados([
      ...itensEditados,
      {
        id: tempId,
        vendaId: Number(id),
        produtoId: Number(novoItem.produtoId),
        valorDoItem: Number(novoItem.valorDoItem),
        quantidade: Number(novoItem.quantidade),
      },
    ]);
    setNovoItem({ produtoId: "", valorDoItem: "", quantidade: 1 });
  };

  const handleNovoItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem((i) => ({
      ...i,
      [name]: name === "quantidade" ? Number(value) : value,
      valorDoItem:
        name === "produtoId"
          ? produtos.find((p) => p.id === Number(value))?.preçoVenda || ""
          : i.valorDoItem,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calcule o desconto para enviar ao backend
    const valorProdutos = itensEditados.reduce(
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

    const vendaBody = {
      Id: Number(id),
      FuncionarioId: Number(venda.funcionarioId),
      ClienteId: Number(venda.clienteId),
      TotalDeItens: Number(venda.totalDeItens),
      ValorTotal: Number(valorProdutos - desconto),
      TotalPago: Number(totalPago),
      FormaDePagamento: Array.isArray(venda.formaDePagamento)
        ? venda.formaDePagamento
        : [venda.formaDePagamento],
      TotalDeVezes: Number(qtdParcelas),
      DataVenda: new Date(venda.dataVenda).toISOString(),
      desconto: desconto,
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

    // Atualizar itens da venda (remover, atualizar, adicionar)
    for (const item of itensOriginais) {
      if (!itensEditados.find((i) => i.id === item.id)) {
        await fetch(`${linkVenItens}/${item.id}`, { method: "DELETE" });
      }
    }
    for (const item of itensEditados) {
      if (item.id > 0 && itensOriginais.find((i) => i.id === item.id)) {
        await fetch(`${linkVenItens}/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      }
    }
    for (const item of itensEditados) {
      if (item.id < 0) {
        await fetch(linkVenItens, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            VendaId: Number(id),
            ProdutoId: Number(item.produtoId),
            ValorDoItem: Number(item.valorDoItem),
            quantidade: Number(item.quantidade),
          }),
        });
      }
    }

    // Atualizar pagamento relacionado, se existir
    const pagamentosRes = await fetch(linkPag);
    if (pagamentosRes.ok) {
      const pagamentos = await pagamentosRes.json();
      const pagamento = pagamentos.find(
        (p) => Number(p.vendaId ?? p.VendaId) === Number(id)
      );
      if (pagamento) {
        await fetch(`${linkPag}/${pagamento.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...pagamento,
            TotalPago: Number(totalPago),
            ToTalDeVezes: Number(qtdParcelas),
            FormaDePagamento: Array.isArray(venda.formaDePagamento)
              ? venda.formaDePagamento
              : [venda.formaDePagamento],
            DataPagamento: new Date().toISOString(),
          }),
        });
      }
    }

    // Atualizar cliente com TotalPago e TotalDevido
    const clienteRes = await fetch(`${linkCli}/${venda.clienteId}`);
    if (clienteRes.ok) {
      const cliente = await clienteRes.json();
      const vendasRes = await fetch(linkVen);
      if (vendasRes.ok) {
        const vendas = await vendasRes.json();
        const vendasDoCliente = vendas.filter(
          (v) => Number(v.clienteId ?? v.ClienteId) === Number(venda.clienteId)
        );
        const totalPagoCliente = vendasDoCliente.reduce(
          (acc, v) => acc + Number(v.totalPago ?? v.TotalPago ?? 0),
          0
        );
        const totalDevidoCliente = vendasDoCliente.reduce(
          (acc, v) =>
            acc +
            (Number(v.valorTotal ?? v.ValorTotal ?? 0) -
              Number(v.totalPago ?? v.TotalPago ?? 0)),
          0
        );
        const totalGastoCliente = vendasDoCliente.reduce(
          (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
          0
        );
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

    navigate("/Venda/ListagemVenda");
  };

  const formasPagamento = [
    "Dinheiro",
    "Cartão",
    "Débito",
    "Crédito",
    "Pix",
    "Crediário",
    "Consignação",
  ];

  return (
    <div className="editarVendaCentro">
      <h1 className="editarVendaTitulo">Editar Venda</h1>
      <div className="editarVendaGrid">
        <form className="editarVendaForm" onSubmit={handleSubmit}>
          <div className="editarVendaDividirInput">
            <input readOnly className="editarVendaInput" value={`Id: ${id}`} />
          </div>

          <div className="editarVendaDividirInput">
            <input
              type="datetime-local"
              name="dataVenda"
              required
              className="editarVendaInput"
              value={venda.dataVenda}
              onChange={handleChange}
            />
          </div>
          <div className="editarVendaDividirInput">
            <select
              name="clienteId"
              required
              className="editarVendaInput"
              value={venda.clienteId}
              onChange={handleChange}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="editarVendaDividirInput">
            <input
              readOnly
              className="editarVendaInput"
              value={
                clientes.find((c) => c.id === Number(venda.clienteId))?.cpf
                  ? `CPF do Cliente: ${
                      clientes.find((c) => c.id === Number(venda.clienteId)).cpf
                    }`
                  : ""
              }
            />
          </div>
          <div className="editarVendaDividirInput">
            <select
              name="funcionarioId"
              required
              className="editarVendaInput"
              value={venda.funcionarioId}
              onChange={handleChange}
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="editarVendaDividirInput">
            <select
              required
              multiple={false}
              className="editarVendaInput"
              value={venda.formaDePagamento}
              onChange={handleFormaPagamentoChange}
            >
              {formasPagamento.map((fp) => (
                <option key={fp} value={fp}>
                  {fp}
                </option>
              ))}
            </select>
          </div>

          {/* Desconto igual ao CadastroVenda */}
          {(venda.formaDePagamento.includes("Pix") ||
            venda.formaDePagamento.includes("Dinheiro")) && (
            <>
              {!descontoTipo && (
                <div className="editarVendaDividirInput">
                  <label>
                    <input
                      type="checkbox"
                      checked={descontoTipo === "porcentagem"}
                      onChange={() => setDescontoTipo("porcentagem")}
                      disabled={descontoTipo === "decimal"}
                    />{" "}
                    Porcentagem
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={descontoTipo === "decimal"}
                      onChange={() => setDescontoTipo("decimal")}
                      disabled={descontoTipo === "porcentagem"}
                    />{" "}
                    Reais
                  </label>
                </div>
              )}
              {descontoTipo && (
                <div className="editarVendaDividirInput">
                  <input
                    className="editarVendaInput"
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

          {(venda.formaDePagamento.includes("Débito") ||
            venda.formaDePagamento.includes("Crédito")) && (
            <div className="editarVendaDividirInput">
              <select
                className="editarVendaInput"
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
          )}

          <div className="editarVendaDividirInput">
            <input
              type="number"
              className="editarVendaInput"
              value={totalPago}
              onChange={(e) => setTotalPago(e.target.value)}
              placeholder="Total Pago"
              min={0}
            />
          </div>
          <div className="editarVendaDividirInput">
            <select
              name="produtoId"
              className="editarVendaInput"
              value={novoItem.produtoId}
              onChange={handleNovoItemChange}
            >
              <option value="">Produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.descricao} (Estoque: {p.quantidade})
                </option>
              ))}
            </select>
          </div>

          <div className="editarVendaDividirInput">
            <input
              name="quantidade"
              type="number"
              min={1}
              className="editarVendaInput"
              value={novoItem.quantidade}
              onChange={handleNovoItemChange}
              placeholder="Qtd"
            />
          </div>
          <div className="editarVendaDividirInput">
            <button
              type="button"
              className="editarVendaAdicionarItem"
              onClick={handleAdicionarItem}
            >
              Adicionar Item
            </button>
          </div>
          <div className="editarVendaBtnDiv">
            <Link to="/Venda/ListagemVenda">
              <button
                type="button"
                className="editarVendaBtn editarVendaBtnVoltar"
              >
                Voltar
              </button>
            </Link>
            <button
              type="submit"
              className="editarVendaBtn editarVendaBtnSalvar"
            >
              Salvar
            </button>
          </div>
        </form>

        <div className="editarVendaTabelaWrapper">
          <table className="editarVendaTabela">
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
              {itensEditados.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Nenhum item
                  </td>
                </tr>
              ) : (
                itensEditados.map((item) => {
                  const produto = produtos.find(
                    (p) => p.id === Number(item.produtoId ?? item.ProdutoId)
                  );
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        {produto ? produto.descricao : "Produto removido"}
                      </td>
                      <td>{item.quantidade}</td>
                      <td>R$ {Number(item.valorDoItem).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="editarVendaBtnCancelarItem"
                          disabled={item.quantidade < 1}
                          onClick={() => handleCancelarItem(item.id)}
                        >
                          Cancelar 1
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="editarVendaValorTotalTabela">
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
  );
}