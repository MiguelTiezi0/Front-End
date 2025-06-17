import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import { linkPag } from "./linkPag"; // Crie esse arquivo com o endpoint do pagamento

export function CadastroPagamento() {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);

  const [pagamento, setPagamento] = useState({
    funcionarioId: "",
    clienteId: "",
    vendaId: "",
    formaDePagamento: "",
    totalPago: "",
    toTalDeVezes: 1,
    dataPagamento: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetch(linkFun).then(r => r.json()).then(setFuncionarios);
    fetch(linkCli).then(r => r.json()).then(setClientes);
    fetch(linkVen).then(r => r.json()).then(setVendas);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPagamento(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pagamentoBody = {
      FuncionarioId: Number(pagamento.funcionarioId),
      ClienteId: Number(pagamento.clienteId),
      VendaId: Number(pagamento.vendaId),
      FormaDePagamento: pagamento.formaDePagamento,
      TotalPago: Number(pagamento.totalPago),
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

    // Atualize o TotalPago da Venda relacionada
    const vendaRes = await fetch(`${linkVen}/${pagamento.vendaId}`);
    if (vendaRes.ok) {
      const venda = await vendaRes.json();
      // Busque todos os pagamentos dessa venda
      const pagamentosRes = await fetch(linkPag);
      if (pagamentosRes.ok) {
        const pagamentos = await pagamentosRes.json();
        const pagamentosDaVenda = pagamentos.filter(
          p => Number(p.vendaId ?? p.VendaId) === Number(pagamento.vendaId)
        );
        const totalPagoVenda = pagamentosDaVenda.reduce(
          (acc, p) => acc + Number(p.totalPago ?? p.TotalPago ?? 0),
          0
        );
        await fetch(`${linkVen}/${pagamento.vendaId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...venda,
            TotalPago: totalPagoVenda,
          }),
        });
      }
    }

    // Atualize o totalPago e totalDevido do Cliente relacionado
    const clienteRes = await fetch(`${linkCli}/${pagamento.clienteId}`);
    if (clienteRes.ok) {
      const cliente = await clienteRes.json();
      // Busque todas as vendas do cliente
      const vendasRes = await fetch(linkVen);
      if (vendasRes.ok) {
        const vendas = await vendasRes.json();
        const vendasDoCliente = vendas.filter(
          v => Number(v.clienteId ?? v.ClienteId) === Number(pagamento.clienteId)
        );
        const totalPagoCliente = vendasDoCliente.reduce(
          (acc, v) => acc + Number(v.TotalPago ?? v.totalPago ?? 0),
          0
        );
        const totalDevidoCliente = vendasDoCliente.reduce(
          (acc, v) =>
            acc +
            (Number(v.ValorTotal ?? v.valorTotal ?? 0) -
              Number(v.TotalPago ?? v.totalPago ?? 0)),
          0
        );
        await fetch(`${linkCli}/${pagamento.clienteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cliente,
            totalPago: totalPagoCliente,
            totalDevido: totalDevidoCliente,
          }),
        });
      }
    }

    alert("Pagamento registrado com sucesso!");
    navigate(-1);
  };

  return (
    <div className="centroCadastroPagamento">
      <form className="cadastroPagamentoForm" onSubmit={handleSubmit}>
        <h1>Registrar Pagamento</h1>
        <div>
          <select
            name="funcionarioId"
            required
            value={pagamento.funcionarioId}
            onChange={handleChange}
          >
            <option value="">Funcionário</option>
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            name="clienteId"
            required
            value={pagamento.clienteId}
            onChange={handleChange}
          >
            <option value="">Cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            name="vendaId"
            required
            value={pagamento.vendaId}
            onChange={handleChange}
          >
            <option value="">Venda</option>
            {vendas
              .filter(v => {
                const total = Number(v.valorTotal ?? v.ValorTotal ?? 0);
                const pago = Number(v.totalPago ?? v.TotalPago ?? 0);
                return (
                  Number(v.clienteId ?? v.ClienteId) === Number(pagamento.clienteId) &&
                  pago < total
                );
              })
              .map(v => (
                <option key={v.id} value={v.id}>
                  {`ID: ${v.id} - Total: R$ ${Number(v.valorTotal ?? v.ValorTotal).toFixed(2)}`}
                </option>
              ))}
          </select>
        </div>
        <div>
          <select
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
          <input
            type="number"
            name="totalPago"
            required
            placeholder="Total Pago"
            value={pagamento.totalPago}
            onChange={handleChange}
            min={0}
            step="0.01"
          />
        </div>
        <div>
          <input
            type="number"
            name="toTalDeVezes"
            required
            placeholder="Total de Vezes"
            value={pagamento.toTalDeVezes}
            onChange={handleChange}
            min={1}
            max={10}
          />
        </div>
        <div>
          <input
            type="datetime-local"
            name="dataPagamento"
            required
            value={pagamento.dataPagamento}
            onChange={handleChange}
          />
        </div>
        <div>
          <button type="submit">Registrar Pagamento</button>
        </div>
      </form>
    </div>
  );
}