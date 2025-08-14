import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import { linkPag } from "./linkPag";

import "./Pagamento.css";

export function CadastroPagamento() {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [pagamento, setPagamento] = useState({
    funcionarioId: "",
    clienteId: "",
    totalPago: "",
    dataPagamento: new Date().toISOString().slice(0, 16),
    formaDePagamento: "",
    toTalDeVezes: 1,
  });

  useEffect(() => {
    fetch(linkFun).then((r) => r.json()).then(setFuncionarios);
    fetch(linkCli).then((r) => r.json()).then(setClientes);
    fetch(linkVen).then((r) => r.json()).then(setVendas);
  }, []);

  // Filtrar vendas em aberto do cliente selecionado
  const vendasEmAberto = vendas
    .filter(
      (v) =>
        Number(v.clienteId ?? v.ClienteId) === Number(pagamento.clienteId) &&
        Number(v.totalPago ?? v.TotalPago ?? 0) <
          Number(v.valorTotal ?? v.ValorTotal ?? 0)
    )
    .sort(
      (a, b) =>
        new Date(a.dataVenda ?? a.DataVenda) -
        new Date(b.dataVenda ?? b.DataVenda)
    );

  // Calcular total devido
  const totalDevido = vendasEmAberto.reduce(
    (acc, v) =>
      acc +
      (Number(v.valorTotal ?? v.ValorTotal ?? 0) -
        Number(v.totalPago ?? v.TotalPago ?? 0)),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPagamento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Monta o body conforme o backend espera
    const pagamentoBody = {
      FuncionarioId: Number(pagamento.funcionarioId),
      ClienteId: Number(pagamento.clienteId),
      VendaId: vendasEmAberto.length > 0 ? vendasEmAberto[0].id : null,
      TotalPago: Number(pagamento.totalPago),
      Desconto: 0,
      FormaDePagamento: [pagamento.formaDePagamento],
      ToTalDeVezes: Number(pagamento.toTalDeVezes),
      DataPagamento: new Date(pagamento.dataPagamento).toISOString(),
    };

    const res = await fetch(linkPag, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagamentoBody),
    });

    if (!res.ok) {
      alert("Erro ao registrar pagamento!");
      return;
    }

    // Distribui o pagamento nas vendas em aberto (mais antigas primeiro)
    let restante = Number(pagamento.totalPago);

    for (const venda of vendasEmAberto) {
      const total = Number(venda.valorTotal ?? venda.ValorTotal ?? 0);
      const pago = Number(venda.totalPago ?? venda.TotalPago ?? 0);
      const devido = total - pago;

      if (restante <= 0) break;

      let valorParaPagar = Math.min(restante, devido);

      // Aguarde o PUT antes de continuar
      await fetch(`${linkVen}/${venda.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...venda,
          totalPago: pago + valorParaPagar, // Corrija para totalPago (minúsculo)
        }),
      });

      restante -= valorParaPagar;
    }

    // Só depois de todos os PUTs, busque as vendas novamente:
    const vendasDoCliente = await fetch(linkVen)
      .then((r) => r.json())
      .then((vs) =>
        vs.filter(
          (v) => Number(v.clienteId ?? v.ClienteId) === Number(pagamento.clienteId)
        )
      );
    const totalPagoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + Number(v.totalPago ?? v.TotalPago ?? 0),
      0
    );
    const totalDevidoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + (Number(v.valorTotal ?? v.ValorTotal ?? 0) - Number(v.totalPago ?? v.TotalPago ?? 0)),
      0
    );
    const totalGastoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
      0
    );

    await fetch(`${linkCli}/${pagamento.clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalPago: totalPagoCliente,
        totalDevido: totalDevidoCliente,
        totalGasto: totalGastoCliente,
      }),
    });

    // ATUALIZA O CAIXA SE FOR DINHEIRO
    if (pagamento.formaDePagamento === "Dinheiro") {
      await fetch("http://localhost:7172/api/Caixa/entrada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: Number(pagamento.totalPago),
          descricao: `Pagamento de venda - Cliente ${pagamento.clienteId}`,
          tipo: "Entrada",
        }),
      });
    }

    alert("Pagamento registrado e distribuído com sucesso!");
    navigate(-1);
  };

  return (
    <div className="centroCadastroPagamento">
      <div className="CadastroPagamento">
        <h1 className="cadastroPagamentoTitulo">Pagamento de Vendas</h1>
        <form className="cadastroPagamentoForm" onSubmit={handleSubmit}>
          <div>
            <select
              className="inputCadastroPagamento"
              name="funcionarioId"
              required
              value={pagamento.funcionarioId}
              onChange={handleChange}
            >
              <option value="">Funcionário</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="inputCadastroPagamento"
              name="clienteId"
              required
              value={pagamento.clienteId}
              onChange={handleChange}
            >
              <option value="">Cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="inputCadastroPagamento"
              name="formaDePagamento"
              required
              value={pagamento.formaDePagamento}
              onChange={handleChange}
            >
              <option value="">Forma de Pagamento</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Débito">Débito</option>
              <option value="Pix">Pix</option>
              <option value="Crédito">Crédito</option>
              <option value="Crediário">Crediário</option>
              <option value="Consignação">Consignação</option>
            </select>
          </div>

          <div>
            <select
              className="inputCadastroPagamento"
              name="toTalDeVezes"
              value={pagamento.toTalDeVezes}
              onChange={handleChange}
              disabled={!pagamento.formaDePagamento}
            >
              <option value={1}>1x</option>
            </select>
          </div>

          <div>
            <input
              className="inputCadastroPagamento"
              type="text"
              name="totalAPagar"
              disabled
              placeholder="Total a Pagar"
              style={{ fontWeight: "bold" }}
              value={`Total a pagar: R$ ${totalDevido.toFixed(2)}`}
            />
          </div>
          <div>
            <input
              className="inputCadastroPagamento"
              type="number"
              name="totalPago"
              required
              placeholder="Valor a pagar"
              value={pagamento.totalPago}
              onChange={handleChange}
              min={1}
              max={totalDevido}
              step="0.01"
              disabled={!pagamento.clienteId || totalDevido === 0}
            />
          </div>
          <div>
            <input
              className="inputCadastroPagamento"
              type="datetime-local"
              name="dataPagamento"
              required
              value={pagamento.dataPagamento}
              onChange={handleChange}
            />
          </div>
          <div>
            <button
              className="btnPagar"
              type="submit"
              disabled={!pagamento.clienteId || totalDevido === 0}
            >
              Pagar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
