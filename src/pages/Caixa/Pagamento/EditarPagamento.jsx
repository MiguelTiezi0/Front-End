import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function EditarPagamento() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [pagamento, setPagamento] = useState({
    FuncionarioId: "",
    ClienteId: "",
    FormaDePagamento: "",
    TotalPago: 0,
    TotalDeVezes: 1,
    DataPagamento: new Date().toISOString().slice(0, 16),
  });

  const [valorPagoAntes, setValorPagoAntes] = useState(0);
  const [valorRestanteFixo, setValorRestanteFixo] = useState(0);

  // Carrega dados do pagamento, cliente, vendas e funcionários
  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [funcs, clis, vens, pagamentoData] = await Promise.all([
          fetch(linkFun).then((r) => r.json()),
          fetch(linkCli).then((r) => r.json()),
          fetch(linkVen).then((r) => r.json()),
          fetch(`${linkPag}/${id}`).then((r) => r.json()),
        ]);

        setFuncionarios(funcs);
        setClientes(clis);
        setVendas(vens);

        const valorAntes = Number(pagamentoData.TotalPago ?? pagamentoData.totalPago ?? 0);
        setValorPagoAntes(valorAntes);

        const clienteAtual = await fetch(`${linkCli}/${pagamentoData.ClienteId ?? pagamentoData.clienteId}`)
          .then((r) => r.json());

        const totalDevidoCliente = clienteAtual.totalDevido ?? clienteAtual.TotalDevido ?? 0;

        setValorRestanteFixo(totalDevidoCliente - valorAntes);

        setPagamento({
          FuncionarioId: pagamentoData.FuncionarioId ?? pagamentoData.funcionarioId ?? "",
          ClienteId: pagamentoData.ClienteId ?? pagamentoData.clienteId ?? "",
          FormaDePagamento: String(pagamentoData.FormaDePagamento ?? pagamentoData.formaDePagamento ?? ""),
          TotalPago: valorAntes,
          TotalDeVezes: pagamentoData.TotalDeVezes ?? pagamentoData.toTalDeVezes ?? 1,
          DataPagamento:
            (pagamentoData.DataPagamento ?? pagamentoData.dataPagamento
              ? (pagamentoData.DataPagamento ?? pagamentoData.dataPagamento).slice(0, 16)
              : new Date().toISOString().slice(0, 16)),
        });
      } catch (error) {
        console.error("Erro ao carregar dados do pagamento:", error);
        alert("Erro ao carregar dados do pagamento!");
      }
    };

    fetchDados();
  }, [id]);

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
      // Buscar pagamento anterior
      const pagamentoAnterior = await fetch(`${linkPag}/${id}`).then((r) => r.json());
      const valorPagoAntesEdicao = Number(pagamentoAnterior.TotalPago ?? pagamentoAnterior.totalPago ?? 0);
      const formaDePagamentoAntes = String(pagamentoAnterior.FormaDePagamento ?? pagamentoAnterior.formaDePagamento ?? "");

      const novoTotalPago = Number(pagamento.TotalPago ?? 0);
      const novaForma = String(pagamento.FormaDePagamento ?? "");

      const delta = novoTotalPago - valorPagoAntesEdicao; // positivo = adicionar, negativo = estornar

      // Ajuste do caixa (somente dinheiro)
      if (formaDePagamentoAntes === "Dinheiro" && novaForma === "Dinheiro") {
        if (delta > 0) {
          await fetch("http://localhost:7172/api/Caixa/entrada", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor: delta, descricao: `Ajuste entrada pagamento ${id}`, tipo: "Entrada" }),
          });
        } else if (delta < 0) {
          await fetch("http://localhost:7172/api/Caixa/saida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor: -delta, descricao: `Ajuste saída pagamento ${id}`, tipo: "Saída" }),
          });
        }
      } else if (formaDePagamentoAntes === "Dinheiro" && novaForma !== "Dinheiro") {
        if (valorPagoAntesEdicao > 0) {
          await fetch("http://localhost:7172/api/Caixa/saida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor: valorPagoAntesEdicao, descricao: `Estorno caixa mudança forma ${id}`, tipo: "Saída" }),
          });
        }
      } else if (formaDePagamentoAntes !== "Dinheiro" && novaForma === "Dinheiro") {
        if (novoTotalPago > 0) {
          await fetch("http://localhost:7172/api/Caixa/entrada", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor: novoTotalPago, descricao: `Entrada caixa mudança forma ${id}`, tipo: "Entrada" }),
          });
        }
      }

      // Distribuição do delta nas vendas do cliente
      if (delta !== 0) {
        let vendasAtual = await fetch(linkVen).then((r) => r.json());
        let vendasCliente = vendasAtual.filter(
          (v) => Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId)
        );

        if (delta < 0) {
          // ESTORNAR do mais recente para o mais antigo
          let toEstornar = -delta;
          const vendasDesc = vendasCliente.sort(
            (a, b) => new Date(b.DataVenda ?? b.dataVenda ?? 0) - new Date(a.DataVenda ?? a.dataVenda ?? 0)
          );

          for (const venda of vendasDesc) {
            if (toEstornar <= 0) break;
            const pago = Number(venda.TotalPago ?? venda.totalPago ?? 0);
            const valorEstornar = Math.min(pago, toEstornar);
            const novoPago = pago - valorEstornar;

            await fetch(`${linkVen}/${venda.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...venda, TotalPago: novoPago, totalPago: novoPago }),
            });
            toEstornar -= valorEstornar;
          }
        } else {
          // PAGAMENTO adicional, distribui nas vendas em aberto mais antigas
          let restante = delta;
          const vendasEmAberto = vendasCliente
            .filter((v) => Number(v.TotalPago ?? v.totalPago ?? 0) < Number(v.ValorTotal ?? v.valorTotal ?? 0))
            .sort((a, b) => new Date(a.DataVenda ?? a.dataVenda ?? 0) - new Date(b.DataVenda ?? b.dataVenda ?? 0));

          for (const venda of vendasEmAberto) {
            if (restante <= 0) break;
            const totalVenda = Number(venda.ValorTotal ?? venda.valorTotal ?? 0);
            const pagoVenda = Number(venda.TotalPago ?? venda.totalPago ?? 0);
            const devidoVenda = totalVenda - pagoVenda;

            const valorParaPagar = Math.min(restante, devidoVenda);
            const novoTotalPagoVenda = pagoVenda + valorParaPagar;

            await fetch(`${linkVen}/${venda.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...venda, TotalPago: novoTotalPagoVenda, totalPago: novoTotalPagoVenda }),
            });

            restante -= valorParaPagar;
          }
        }
      }

      // Atualizar pagamento
      const pagamentoBody = {
        id: Number(id),
        FuncionarioId: Number(pagamento.FuncionarioId),
        ClienteId: Number(pagamento.ClienteId),
        VendaId: pagamentoAnterior.VendaId ?? pagamentoAnterior.vendaId ?? null,
        TotalPago: Number(pagamento.TotalPago),
        Desconto: 0,
        FormaDePagamento: [String(pagamento.FormaDePagamento)],
        ToTalDeVezes: Number(pagamento.TotalDeVezes),
        DataPagamento: new Date(pagamento.DataPagamento).toISOString(),
      };

      const resPagamento = await fetch(`${linkPag}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });

      if (!resPagamento.ok) throw new Error("Erro ao atualizar pagamento");

      // Atualizar cliente com totais recalculados
      const vendasAtualizadas = await fetch(linkVen).then((r) => r.json());
      const vendasClienteAtualizadas = vendasAtualizadas.filter(
        (v) => Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId)
      );

      const totalPagoCliente = vendasClienteAtualizadas.reduce(
        (acc, v) => acc + Number(v.TotalPago ?? v.totalPago ?? 0),
        0
      );
      const totalDevidoCliente = vendasClienteAtualizadas.reduce(
        (acc, v) => acc + (Number(v.ValorTotal ?? v.valorTotal ?? 0) - Number(v.TotalPago ?? v.totalPago ?? 0)),
        0
      );
      const totalGastoCliente = vendasClienteAtualizadas.reduce(
        (acc, v) => acc + Number(v.ValorTotal ?? v.valorTotal ?? 0),
        0
      );

      const clienteAtual = await fetch(`${linkCli}/${pagamento.ClienteId}`).then((r) => r.json());
      const clienteAtualizado = {
        ...clienteAtual,
        TotalPago: totalPagoCliente,
        TotalDevido: totalDevidoCliente,
        TotalGasto: totalGastoCliente,
        totalPago: totalPagoCliente,
        totalDevido: totalDevidoCliente,
        totalGasto: totalGastoCliente,
      };

      const clienteRes = await fetch(`${linkCli}/${pagamento.ClienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteAtualizado),
      });

      if (!clienteRes.ok) throw new Error("Erro ao atualizar cliente");

      alert("Pagamento atualizado e distribuído com sucesso!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao editar pagamento!");
    }
  };

  return (
    <div className="centroEditarPagamento">
      <div className="EditarPagamento">
        <h1 className="editarPagamentoTitulo">Editar Pagamento</h1>

        <form className="editarPagamentoForm" onSubmit={handleSubmit}>
          <div>
            <select
              className="inputEditarPagamento"
              name="FuncionarioId"
              required
              value={pagamento.FuncionarioId}
              onChange={handleChange}
            >
              <option value="">Funcionário</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="inputEditarPagamento"
              name="ClienteId"
              required
              value={pagamento.ClienteId}
              onChange={handleChange}
            >
              <option value="">Cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              className="inputEditarPagamento"
              type="text"
              disabled
              placeholder="Total Devido"
              style={{ fontWeight: "bold" }}
              value={`Total devido: R$ ${(valorRestanteFixo + valorPagoAntes).toFixed(2)}`}
            />
          </div>

          <div>
            <input
              className="inputEditarPagamento"
              type="text"
              disabled
              placeholder="Valor Restante"
              style={{ fontWeight: "bold" }}
              value={`Valor restante: R$ ${valorRestanteFixo.toFixed(2)}`}
            />
          </div>

          <div>
            <select
              className="inputEditarPagamento"
              name="FormaDePagamento"
              required
              value={pagamento.FormaDePagamento}
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
              className="inputEditarPagamento"
              type="number"
              name="TotalDeVezes"
              required
              placeholder="Total de Vezes"
              value={pagamento.TotalDeVezes}
              onChange={handleChange}
              min={1}
            />
          </div>

          <div>
            <input
              className="inputEditarPagamento"
              type="number"
              name="TotalPago"
              required
              placeholder="Valor Pago"
              value={pagamento.TotalPago}
              onChange={handleChange}
              min={0}
              step="0.01"
            />
          </div>

          <div>
            <input
              className="inputEditarPagamento"
              type="datetime-local"
              name="DataPagamento"
              required
              value={pagamento.DataPagamento}
              onChange={handleChange}
            />
          </div>

          <div className="botoesEditarPagamento">
            <button type="button" className="btnPagamentoVoltar" onClick={() => navigate(-1)}>Voltar</button>
            <button className="btnPagamentoSalvar" type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
