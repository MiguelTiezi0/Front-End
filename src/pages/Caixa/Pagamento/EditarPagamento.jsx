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

      setValorPagoAntes(Number(data.TotalPago ?? data.totalPago ?? 0));
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

      // Calcula o valorRestanteFixo apenas uma vez, após carregar os dados
      const vendasDoCliente = vens.filter(
        v => Number(v.ClienteId ?? v.clienteId) === Number(data.ClienteId ?? data.clienteId)
      );
      const totalDevidoSemEstePagamento = vendasDoCliente.reduce(
        (acc, v) =>
          acc +
          (Number(v.ValorTotal ?? v.valorTotal ?? 0) - Number(v.TotalPago ?? v.totalPago ?? 0)),
        0
      );
      // Corrigido: não soma o valor já pago
      setValorRestanteFixo(totalDevidoSemEstePagamento);
    });
  }, [id]);

  // Vendas em aberto do cliente, ordenadas da mais antiga para a mais recente
  const vendasEmAberto = vendas
    .filter(
      (v) =>
        Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId) &&
        Number(v.TotalPago ?? v.totalPago ?? 0) < Number(v.ValorTotal ?? v.valorTotal ?? 0)
    )
    .sort((a, b) => new Date(a.DataVenda ?? a.dataVenda) - new Date(b.DataVenda ?? b.dataVenda));

  // Todas as vendas do cliente
  const vendasDoCliente = vendas.filter(
    v => Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId)
  );

  // Total devido pelo cliente (SEM considerar o pagamento atual em edição)
  const totalDevidoSemEstePagamento = vendasDoCliente.reduce(
    (acc, v) =>
      acc +
      (Number(v.ValorTotal ?? v.valorTotal ?? 0) - Number(v.TotalPago ?? v.totalPago ?? 0)),
    0
  );

  // Novo total devido exibido ao usuário (restante + valor pago antes da edição)
  const totalDevidoExibido = totalDevidoSemEstePagamento + valorPagoAntes;

  // Valor restante após edição (quanto ainda falta pagar após editar)
  const valorRestante = totalDevidoSemEstePagamento + Number(pagamento.TotalPago) - valorPagoAntes;

  // Valor restante deve ser calculado apenas com base no valor origina
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
      // 1. Busque o pagamento anterior para saber o valor antigo
      const pagamentoAnteriorRes = await fetch(`${linkPag}/${id}`);
      let valorPagoAntesEdicao = 0;
      let formaDePagamentoAntes = "";
      if (pagamentoAnteriorRes.ok) {
        const pagamentoAnterior = await pagamentoAnteriorRes.json();
        valorPagoAntesEdicao = Number(pagamentoAnterior.TotalPago ?? pagamentoAnterior.totalPago ?? 0);
        formaDePagamentoAntes = String(pagamentoAnterior.FormaDePagamento ?? pagamentoAnterior.formaDePagamento ?? "");
      }

      // 2. Se o pagamento anterior era em dinheiro, subtrai do caixa
      if (
        formaDePagamentoAntes === "Dinheiro" &&
        valorPagoAntesEdicao > 0
      ) {
        const caixaRes = await fetch("http://localhost:7172/api/Caixa/saida", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valor: valorPagoAntesEdicao,
            descricao: `Estorno edição pagamento ${id}`,
            tipo: "Saída",
          }),
        });
        if (!caixaRes.ok) {
          alert("Erro ao estornar valor do caixa!");
          console.error("Erro ao estornar valor do caixa", await caixaRes.text());
          return;
        }
      }

      // 3. Estorna o valor antigo das vendas do cliente
      let valorRestanteEstorno = valorPagoAntesEdicao;
      const vendasDoClienteOrdenadas = vendas
        .filter(
          (v) =>
            Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId)
        )
        .sort((a, b) =>
          new Date(a.DataVenda ?? a.dataVenda) - new Date(b.DataVenda ?? b.dataVenda)
        );

      for (const venda of vendasDoClienteOrdenadas) {
        if (valorRestanteEstorno <= 0) break;
        const pago = Number(venda.TotalPago ?? venda.totalPago ?? 0);
        const valorParaEstornar = Math.min(pago, valorRestanteEstorno);

        const vendaRes = await fetch(`${linkVen}/${venda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...venda,
            TotalPago: pago - valorParaEstornar,
          }),
        });
        if (!vendaRes.ok) {
          alert("Erro ao estornar valor das vendas!");
          console.error("Erro ao estornar venda", await vendaRes.text());
          return;
        }

        valorRestanteEstorno -= valorParaEstornar;
      }

      // 4. Distribui o novo valor pago nas vendas em aberto (mais antigas primeiro)
      let restante = Number(pagamento.TotalPago);

      for (const venda of vendasEmAberto) {
        const total = Number(venda.ValorTotal ?? venda.valorTotal ?? 0);
        const pago = Number(venda.TotalPago ?? venda.totalPago ?? 0);
        const devido = total - pago;

        if (restante <= 0) break;

        let valorParaPagar = Math.min(restante, devido);

        const vendaRes = await fetch(`${linkVen}/${venda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...venda,
            TotalPago: pago + valorParaPagar,
          }),
        });
        if (!vendaRes.ok) {
          alert("Erro ao distribuir valor nas vendas!");
          console.error("Erro ao distribuir venda", await vendaRes.text());
          return;
        }

        restante -= valorParaPagar;
      }

      // 5. Atualiza o pagamento (PUT)
      const pagamentoBody = {
        id: Number(id),
        funcionarioId: Number(pagamento.FuncionarioId),
        clienteId: Number(pagamento.ClienteId),
        vendaId: vendasEmAberto.length > 0 ? Number(vendasEmAberto[0].id) : 0,
        totalPago: Number(pagamento.TotalPago),
        desconto: 0,
        formaDePagamento: [String(pagamento.FormaDePagamento)],
        toTalDeVezes: Number(pagamento.TotalDeVezes),
        dataPagamento: new Date(pagamento.DataPagamento).toISOString(),
      };

      console.log("Enviando para PUT:", JSON.stringify({ pagamento: pagamentoBody }));

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

      // 6. Atualiza o cliente após pagamento
      const vendasDoClienteAtualizadas = await fetch(linkVen)
        .then(r => r.json())
        .then(vs => vs.filter(
          v => Number(v.ClienteId ?? v.clienteId) === Number(pagamento.ClienteId)
        ));
      const totalPagoCliente = vendasDoClienteAtualizadas.reduce(
        (acc, v) => acc + Number(v.TotalPago ?? v.totalPago ?? 0), 0
      );
      const totalDevidoCliente = vendasDoClienteAtualizadas.reduce(
        (acc, v) => acc + (Number(v.ValorTotal ?? v.valorTotal ?? 0) - Number(v.TotalPago ?? v.totalPago ?? 0)), 0
      );
      const totalGastoCliente = vendasDoClienteAtualizadas.reduce(
        (acc, v) => acc + Number(v.ValorTotal ?? v.valorTotal ?? 0), 0
      );

      const clienteRes = await fetch(`${linkCli}/${pagamento.ClienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clientes.find(c => Number(c.id) === Number(pagamento.ClienteId)),
          TotalPago: totalPagoCliente,
          TotalDevido: totalDevidoCliente,
          TotalGasto: totalGastoCliente,
        }),
      });
      if (!clienteRes.ok) {
        alert("Erro ao atualizar cliente!");
        console.error("Erro ao atualizar cliente", await clienteRes.text());
        return;
      }

      // 7. Se a nova forma de pagamento for dinheiro, adiciona ao caixa
      if (
        pagamento.FormaDePagamento === "Dinheiro" &&
        Number(pagamento.TotalPago) > 0
      ) {
        const caixaRes = await fetch("http://localhost:7172/api/Caixa/entrada", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valor: Number(pagamento.TotalPago),
            descricao: `Novo valor edição pagamento ${id}`,
            tipo: "Entrada",
          }),
        });
        if (!caixaRes.ok) {
          alert("Erro ao adicionar valor ao caixa!");
          console.error("Erro ao adicionar valor ao caixa", await caixaRes.text());
          return;
        }
      }

      alert("Pagamento atualizado e distribuído com sucesso!");
      navigate(-1);
    } catch (error) {
      alert("Erro inesperado ao editar pagamento!");
      console.error(error);
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
              value={`Total devido: R$ ${totalDevidoExibido.toFixed(2)}`}
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
              min={1}
              max={totalDevidoExibido}
              step="0.01"
              disabled={!pagamento.ClienteId || totalDevidoExibido === 0}
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


