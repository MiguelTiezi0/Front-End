import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";

export function CadastroPagamento() {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [vendasEmAberto, setVendasEmAberto] = useState([]);
  const [pagamento, setPagamento] = useState({
    funcionarioId: "",
    clienteId: "",
    formaDePagamento: "",
    totalPago: "",
    toTalDeVezes: 1,
    dataPagamento: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const fetchData = async () => {
      const [funcs, clis, vens] = await Promise.all([
        fetch(linkFun).then((r) => r.json()),
        fetch(linkCli).then((r) => r.json()),
        fetch(linkVen).then((r) => r.json()),
      ]);
      setFuncionarios(funcs);
      setClientes(clis);
      setVendas(vens);
    };
    fetchData();
  }, []);

  // sempre que selecionar cliente, calcula vendas em aberto
  useEffect(() => {
    if (!pagamento.clienteId) {
      setVendasEmAberto([]);
      return;
    }

    const vendasDoCliente = vendas.filter(
      (v) => String(v.clienteId ?? v.ClienteId) === String(pagamento.clienteId)
    );

    const emAberto = vendasDoCliente.filter(
      (v) =>
        Number(v.totalPago ?? v.TotalPago ?? 0) <
        Number(v.valorTotal ?? v.ValorTotal ?? 0)
    );

    setVendasEmAberto(emAberto);
  }, [pagamento.clienteId, vendas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPagamento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Cadastrar pagamento
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

      // 2. Distribuir pagamento nas vendas em aberto
      let restante = Number(pagamento.totalPago);

      for (const venda of vendasEmAberto.sort(
        (a, b) =>
          new Date(a.dataVenda ?? a.DataVenda ?? 0) -
          new Date(b.dataVenda ?? b.DataVenda ?? 0)
      )) {
        if (restante <= 0) break;

        const total = Number(venda.valorTotal ?? venda.ValorTotal ?? 0);
        const pago = Number(venda.totalPago ?? venda.TotalPago ?? 0);
        const devido = total - pago;

        const valorParaPagar = Math.min(restante, devido);
        const novoTotalPago = pago + valorParaPagar;

        await fetch(`${linkVen}/${venda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...venda,
            totalPago: novoTotalPago,
            TotalPago: novoTotalPago,
          }),
        });

        restante -= valorParaPagar;
      }

      // 3. Atualizar totais do cliente
      const vendasDoCliente = await fetch(linkVen)
        .then((r) => r.json())
        .then((vs) =>
          vs.filter(
            (v) =>
              String(v.clienteId ?? v.ClienteId) ===
              String(pagamento.clienteId)
          )
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

      const clienteAtual = await fetch(
        `${linkCli}/${pagamento.clienteId}`
      ).then((r) => r.json());

      await fetch(`${linkCli}/${pagamento.clienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clienteAtual,
          totalPago: totalPagoCliente,
          totalDevido: totalDevidoCliente,
          totalGasto: totalGastoCliente,
          TotalPago: totalPagoCliente,
          TotalDevido: totalDevidoCliente,
          TotalGasto: totalGastoCliente,
        }),
      });

      // 4. Caixa
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
    } catch (err) {
      console.error("Erro ao cadastrar pagamento:", err);
      alert("Erro inesperado ao cadastrar pagamento.");
    }
  };

 return (
  <div className="centroCadastroPagamento">
    <div className="CadastroPagamento">
      <h1 className="cadastroPagamentoTitulo">Cadastro de Pagamento</h1>

      <form className="cadastroPagamentoForm" onSubmit={handleSubmit}>
          <select
            className="inputCadastroPagamento"
            name="funcionarioId"
            required
            value={pagamento.funcionarioId}
            onChange={handleChange}
          >
            <option value="">Funcionário</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>

          <select
            className="inputCadastroPagamento"
            name="clienteId"
            required
            value={pagamento.clienteId}
            onChange={handleChange}
          >
            <option value="">Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
       

          <select
            className="inputCadastroPagamento"
            name="formaDePagamento"
            required
            value={pagamento.formaDePagamento}
            onChange={handleChange}
          >
            <option value="">Formas de pagamento</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Débito">Débito</option>
            <option value="Pix">Pix</option>
            <option value="Crédito">Crédito</option>
            <option value="Crediário">Crediário</option>
            <option value="Consignação">Consignação</option>
          </select>

          <input
            className="inputCadastroPagamento"
            type="number"
            name="toTalDeVezes"
            required
            min={1}
            value={pagamento.toTalDeVezes}
            onChange={handleChange}
            placeholder="Total de vezes"
          />
  

          <input
            className="inputCadastroPagamento"
            type="number"
            name="totalPago"
            required
            min={0}
            step="0.01"
            value={pagamento.totalPago}
            onChange={handleChange}
            placeholder="Valor pago"
          />

          <input
            className="inputCadastroPagamento"
            type="datetime-local"
            name="dataPagamento"
            required
            value={pagamento.dataPagamento}
            onChange={handleChange}
            placeholder="Data"
          />
      

        <div className="botoesCadastroPagamento">
          <button
            type="button"
            className="btnPagamentoVoltar"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
          <button className="btnPagamentoSalvar" type="submit">
            Salvar
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
