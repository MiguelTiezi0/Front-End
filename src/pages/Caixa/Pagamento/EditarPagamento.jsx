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
    funcionarioId: "",
    clienteId: "",
    formaDePagamento: "",
    totalPago: "",
    toTalDeVezes: 1,
    dataPagamento: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetch(linkFun).then((r) => r.json()).then(setFuncionarios);
    fetch(linkCli).then((r) => r.json()).then(setClientes);
    fetch(linkVen).then((r) => r.json()).then(setVendas);

    fetch(`${linkPag}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPagamento({
          funcionarioId: data.funcionarioId ?? data.FuncionarioId ?? "",
          clienteId: data.clienteId ?? data.ClienteId ?? "",
          formaDePagamento: Array.isArray(data.formaDePagamento ?? data.FormaDePagamento)
            ? (data.formaDePagamento ?? data.FormaDePagamento)[0]
            : (data.formaDePagamento ?? data.FormaDePagamento ?? ""),
          totalPago: data.totalPago ?? data.TotalPago ?? "",
          toTalDeVezes: data.toTalDeVezes ?? data.ToTalDeVezes ?? 1,
          dataPagamento:
            (data.dataPagamento ?? data.DataPagamento)
              ? (data.dataPagamento ?? data.DataPagamento).slice(0, 16)
              : new Date().toISOString().slice(0, 16),
        });
      });
  }, [id]);

  // Vendas em aberto do cliente, ordenadas da mais antiga para a mais recente
  const vendasEmAberto = vendas
    .filter(
      (v) =>
        Number(v.clienteId ?? v.ClienteId) === Number(pagamento.clienteId) &&
        Number(v.totalPago ?? v.TotalPago ?? 0) < Number(v.valorTotal ?? v.ValorTotal ?? 0)
    )
    .sort((a, b) => new Date(a.dataVenda ?? a.DataVenda) - new Date(b.dataVenda ?? b.DataVenda));

  // Total devido pelo cliente (SEM considerar o pagamento atual em edição)
  const vendasDoCliente = vendas.filter(
    v => Number(v.clienteId ?? v.ClienteId) === Number(pagamento.clienteId)
  );
  const totalDevidoSemEstePagamento = vendasDoCliente.reduce(
    (acc, v) =>
      acc +
      (Number(v.valorTotal ?? v.ValorTotal ?? 0) - Number(v.totalPago ?? v.TotalPago ?? 0)),
    0
  ) + Number(pagamento.totalPago || 0); // soma de volta o valor do pagamento atual

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPagamento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Atualiza o pagamento
    const pagamentoBody = {
      Id: Number(id),
      FuncionarioId: Number(pagamento.funcionarioId),
      ClienteId: Number(pagamento.clienteId),
      VendaId: vendasEmAberto.length > 0 ? vendasEmAberto[0].id : null,
      FormaDePagamento: [pagamento.formaDePagamento],
      TotalPago: Number(pagamento.totalPago),
      ToTalDeVezes: Number(pagamento.toTalDeVezes),
      DataPagamento: new Date(pagamento.dataPagamento).toISOString(),
      Desconto: 0,
    };

    const res = await fetch(`${linkPag}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagamentoBody),
    });

    if (!res.ok) {
      alert("Erro ao atualizar pagamento!");
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

      await fetch(`${linkVen}/${venda.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...venda,
          TotalPago: pago + valorParaPagar,
        }),
      });

      restante -= valorParaPagar;
    }

    // ATUALIZA O CLIENTE APÓS PAGAMENTO
    const vendasDoCliente = await fetch(linkVen)
      .then(r => r.json())
      .then(vs => vs.filter(
        v => Number(v.clienteId ?? v.ClienteId) === Number(pagamento.clienteId)
      ));
    const totalPagoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + Number(v.totalPago ?? v.TotalPago ?? 0), 0
    );
    const totalDevidoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + (Number(v.valorTotal ?? v.ValorTotal ?? 0) - Number(v.totalPago ?? v.TotalPago ?? 0)), 0
    );
    const totalGastoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0), 0
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

    alert("Pagamento atualizado e distribuído com sucesso!");
    navigate(-1);
  };

  return (
    <div className="centroEditarPagamento">
      <div className="EditarPagamento">
        <h1 className="editarPagamentoTitulo">Editar Pagamento</h1>
        <form className="editarPagamentoForm" onSubmit={handleSubmit}>
          <div>
            <select
              className="inputEditarPagamento"
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
              className="inputEditarPagamento"
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
            <input
              className="inputEditarPagamento"
              type="text"
              name="totalDevido"
              disabled
              placeholder="Total Devido"
              style={{ fontWeight: "bold" }}
              value={`Total devido: R$ ${totalDevidoSemEstePagamento.toFixed(2)}`}
            />
          </div>
          <div>
            <select
              className="inputEditarPagamento"
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
              className="inputEditarPagamento"
              type="number"
              name="toTalDeVezes"
              required
              placeholder="Total de Vezes"
              value={pagamento.toTalDeVezes}
              onChange={handleChange}
              min={1}
              max={1}
            />
          </div>
          <div>
            <input
              className="inputEditarPagamento"
              type="number"
              name="totalPago"
              required
              placeholder="Valor Pago"
              value={pagamento.totalPago}
              onChange={handleChange}
              min={1}
              max={totalDevidoSemEstePagamento} // <-- aqui!
              step="0.01"
              disabled={!pagamento.clienteId || totalDevidoSemEstePagamento === 0}
            />
          </div>
          <div>
            <input
              className="inputEditarPagamento"
              type="datetime-local"
              name="dataPagamento"
              required
              value={pagamento.dataPagamento}
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
