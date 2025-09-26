import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";

export function EditarPagamento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [pagamento, setPagamento] = useState({
    FuncionarioId: "",
    ClienteId: "",
    FormaDePagamento: "",
    TotalPago: "",
    TotalDeVezes: 1,
    DataPagamento: new Date().toISOString().slice(0, 16),
  });

  const [valorPagoAntes, setValorPagoAntes] = useState(0);
  const [valorRestanteFixo, setValorRestanteFixo] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(linkFun).then((r) => r.json()),
      fetch(linkCli).then((r) => r.json()),
      fetch(linkVen).then((r) => r.json()),
      fetch(`${linkPag}/${id}`).then((r) => r.json()),
    ]).then(([funcs, clis, vens, data]) => {
      setFuncionarios(funcs);
      setClientes(clis);
      setVendas(vens);

      const valorAntes = Number(data.TotalPago ?? data.totalPago ?? 0);
      setValorPagoAntes(valorAntes);
      setPagamento({
        FuncionarioId: data.FuncionarioId ?? data.funcionarioId ?? "",
        ClienteId: data.ClienteId ?? data.clienteId ?? "",
        FormaDePagamento: String(data.FormaDePagamento ?? data.formaDePagamento ?? ""),
        TotalPago: data.TotalPago ?? data.totalPago ?? "",
        TotalDeVezes: data.TotalDeVezes ?? data.toTalDeVezes ?? 1,
        DataPagamento:
          (data.DataPagamento ?? data.dataPagamento)
            ? (data.DataPagamento ?? data.dataPagamento).slice(0, 16)
            : new Date().toISOString().slice(0, 16),
      });

      // calcula total devido sem considerar o pagamento atual
      const vendasDoCliente = vens.filter(
        (v) => Number(v.ClienteId ?? v.clienteId) === Number(data.ClienteId ?? data.clienteId)
      );
      const totalDevidoSemEstePagamento = vendasDoCliente.reduce(
        (acc, v) =>
          acc +
          (Number(v.ValorTotal ?? v.valorTotal ?? 0) - Number(v.TotalPago ?? v.totalPago ?? 0)),
        0
      );
      setValorRestanteFixo(totalDevidoSemEstePagamento);
    });
  }, [id]);

  // Vendas (não muta vendas state aqui — usaremos fetchs quando precisar)
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
      // busca o pagamento anterior
      const pagamentoAnteriorRes = await fetch(`${linkPag}/${id}`);
      if (!pagamentoAnteriorRes.ok) {
        alert("Erro ao buscar pagamento anterior");
        return;
      }
      const pagamentoAnterior = await pagamentoAnteriorRes.json();
      const valorPagoAntesEdicao = Number(pagamentoAnterior.TotalPago ?? pagamentoAnterior.totalPago ?? 0);
      const formaDePagamentoAntes = String(pagamentoAnterior.FormaDePagamento ?? pagamentoAnterior.formaDePagamento ?? "");

      const novoTotalPago = Number(pagamento.TotalPago ?? 0);
      const novaForma = String(pagamento.FormaDePagamento ?? "");

      const delta = novoTotalPago - valorPagoAntesEdicao; // positivo => adicionar, negativo => estornar

      // CAIXA: tratar apenas o delta / mudança de forma
      // caso 1: ambos em dinheiro -> ajustar por delta
      if (formaDePagamentoAntes === "Dinheiro" && novaForma === "Dinheiro") {
        if (delta > 0) {
          await fetch("http://localhost:7172/api/Caixa/entrada", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valor: delta,
              descricao: `Ajuste entrada edição pagamento ${id}`,
              tipo: "Entrada",
            }),
          });
        } else if (delta < 0) {
          await fetch("http://localhost:7172/api/Caixa/saida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valor: -delta,
              descricao: `Ajuste saída edição pagamento ${id}`,
              tipo: "Saída",
            }),
          });
        }
      } else if (formaDePagamentoAntes === "Dinheiro" && novaForma !== "Dinheiro") {
        // removed the old cash (estornar original total)
        if (valorPagoAntesEdicao > 0) {
          await fetch("http://localhost:7172/api/Caixa/saida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valor: valorPagoAntesEdicao,
              descricao: `Estorno caixa - mudança de forma edição pagamento ${id}`,
              tipo: "Saída",
            }),
          });
        }
      } else if (formaDePagamentoAntes !== "Dinheiro" && novaForma === "Dinheiro") {
        // adiciona ao caixa o novo total
        if (novoTotalPago > 0) {
          await fetch("http://localhost:7172/api/Caixa/entrada", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valor: novoTotalPago,
              descricao: `Entrada caixa - mudança de forma edição pagamento ${id}`,
              tipo: "Entrada",
            }),
          });
        }
      }

      // SE delta === 0 e forma não mudou: não mexer nas vendas (evita efeito colateral)
      if (delta !== 0) {
        // Recarregar vendas atualizadas do servidor (garante dados corretos)
        let vendasAtual = await fetch(linkVen).then((r) => r.json());
        // somente vendas do cliente
        let vendasDoCliente = vendasAtual.filter(
          (v) => Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId)
        );

        // ESTORNO quando delta < 0 -> precisamos tirar (-delta)
        if (delta < 0) {
          let toEstornar = -delta;
          // estornar do mais recente para o mais antigo (reverse)
          const vendasDesc = vendasDoCliente.sort(
            (a, b) =>
              new Date(b.DataVenda ?? b.dataVenda ?? b.data ?? 0) -
              new Date(a.DataVenda ?? a.dataVenda ?? a.data ?? 0)
          );

          for (const venda of vendasDesc) {
            if (toEstornar <= 0) break;
            const pago = Number(venda.TotalPago ?? venda.totalPago ?? 0);
            const valorParaEstornar = Math.min(pago, toEstornar);
            const novoPago = pago - valorParaEstornar;

            await fetch(`${linkVen}/${venda.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...venda,
                // enviar ambos para garantir compatibilidade com o backend
                TotalPago: novoPago,
                totalPago: novoPago,
              }),
            }).catch((err) =>
              console.error("Erro ao estornar venda", venda.id, err)
            );

            toEstornar -= valorParaEstornar;
          }
        } else {
          // DISTRIBUIR delta > 0 nas vendas em aberto (mais antigas primeiro)
          let restante = delta;

          // Recarrega vendas do cliente (pois estorno pode ter alterado valores)
          vendasAtual = await fetch(linkVen).then((r) => r.json());
          const vendasEmAberto = vendasAtual
            .filter(
              (v) =>
                Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId) &&
                Number(v.TotalPago ?? v.totalPago ?? 0) < Number(v.ValorTotal ?? v.valorTotal ?? 0)
            )
            .sort(
              (a, b) =>
                new Date(a.DataVenda ?? a.dataVenda ?? a.data ?? 0) -
                new Date(b.DataVenda ?? b.dataVenda ?? b.data ?? 0)
            );

          for (const venda of vendasEmAberto) {
            if (restante <= 0) break;

            const totalVenda = Number(venda.ValorTotal ?? venda.valorTotal ?? 0);
            const pagoVenda = Number(venda.TotalPago ?? venda.totalPago ?? 0);
            const devidoVenda = totalVenda - pagoVenda;

            const valorParaPagarNestaVenda = Math.min(restante, devidoVenda);
            const novoTotalPagoVenda = pagoVenda + valorParaPagarNestaVenda;

            await fetch(`${linkVen}/${venda.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...venda,
                TotalPago: novoTotalPagoVenda,
                totalPago: novoTotalPagoVenda,
              }),
            }).catch((err) =>
              console.error("Erro ao atualizar venda", venda.id, err)
            );

            restante -= valorParaPagarNestaVenda;
          }
        }
      }

// 1) Preferir o VendaId que já está no pagamento anterior (se existir)
const vendaIdAnterior =
  pagamentoAnterior?.VendaId ?? pagamentoAnterior?.vendaId ?? null;

// 2) Se não houver, tentar encontrar uma venda do mesmo cliente (mais antiga)
let vendaIdFallback = vendaIdAnterior;
if (!vendaIdFallback) {
  const vendasDoMesmoCliente = Array.isArray(vendas)
    ? vendas.filter(
        (v) =>
          String(v.ClienteId ?? v.clienteId) ===
          String(pagamento.ClienteId ?? pagamento.ClienteId ?? pagamento.ClienteId)
      )
    : [];

  if (vendasDoMesmoCliente.length) {
    vendasDoMesmoCliente.sort(
      (a, b) =>
        new Date(a.DataVenda ?? a.dataVenda ?? 0) -
        new Date(b.DataVenda ?? b.dataVenda ?? 0)
    );
    vendaIdFallback = vendasDoMesmoCliente[0].id;
  } else {
    vendaIdFallback = null; // ou 0 se sua API exigir número
  }
}


      const pagamentoBody = {
        id: Number(id),
        FuncionarioId: Number(pagamento.FuncionarioId),
        ClienteId: Number(pagamento.ClienteId),
        VendaId: vendaIdFallback,
        TotalPago: Number(pagamento.TotalPago),
        Desconto: 0,
        FormaDePagamento: [String(pagamento.FormaDePagamento)],
        ToTalDeVezes: Number(pagamento.TotalDeVezes),
        DataPagamento: new Date(pagamento.DataPagamento).toISOString(),
      };

      const res = await fetch(`${linkPag}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });

      if (!res.ok) {
        alert("Erro ao atualizar pagamento!");
        console.error("Erro ao atualizar pagamento", await res.text());
        return;
      }

      // Recalcula totais do cliente a partir das vendas atuais
      const vendasDoClienteAtualizadas = await fetch(linkVen)
        .then((r) => r.json())
        .then((vs) => vs.filter((v) => Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId)));

      const totalPagoCliente = vendasDoClienteAtualizadas.reduce(
        (acc, v) => acc + Number(v.TotalPago ?? v.totalPago ?? 0),
        0
      );
      const totalDevidoCliente = vendasDoClienteAtualizadas.reduce(
        (acc, v) => acc + (Number(v.ValorTotal ?? v.valorTotal ?? 0) - Number(v.TotalPago ?? v.totalPago ?? 0)),
        0
      );
      const totalGastoCliente = vendasDoClienteAtualizadas.reduce(
        (acc, v) => acc + Number(v.ValorTotal ?? v.valorTotal ?? 0),
        0
      );

      // Busca cliente atual e atualiza de forma segura (spread)
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
      if (!clienteRes.ok) {
        alert("Erro ao atualizar cliente!");
        console.error("Erro ao atualizar cliente", await clienteRes.text());
        return;
      }

      alert("Pagamento atualizado e distribuído com sucesso!");
      navigate(-1);
    } catch (error) {
      alert("Erro inesperado ao editar pagamento!");
      console.error(error);
    }
  };

  // Render (mantive sua UI original)
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
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
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
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              className="inputEditarPagamento"
              type="text"
              name="totalDevido"
              disabled
              placeholder="Total Devido"
              style={{ fontWeight: "bold" }}
              value={`Total devido: R$ ${ (valorRestanteFixo + valorPagoAntes).toFixed(2) }`}
            />
          </div>

          <div>
            <input
              className="inputEditarPagamento"
              type="text"
              name="valorRestante"
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

          <div>
            <button className="btnEditarPagamentoSalvar" type="submit">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
