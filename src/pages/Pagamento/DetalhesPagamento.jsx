import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";

export function DetalhesPagamento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pagamento, setPagamento] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [venda, setVenda] = useState(null);

  useEffect(() => {
    fetch(`${linkPag}/${id}`)
      .then(r => r.json())
      .then(data => {
        setPagamento(data);
        fetch(`${linkFun}/${data.funcionarioId ?? data.FuncionarioId}`)
          .then(r => r.json())
          .then(setFuncionario);
        fetch(`${linkCli}/${data.clienteId ?? data.ClienteId}`)
          .then(r => r.json())
          .then(setCliente);
        fetch(`${linkVen}/${data.vendaId ?? data.VendaId}`)
          .then(r => r.json())
          .then(setVenda);
      });
  }, [id]);

  if (!pagamento || !funcionario || !cliente || !venda) {
    return <div>Carregando detalhes do pagamento...</div>;
  }

  return (
    <div className="detalhesPagamento">
      <h1>Detalhes do Pagamento</h1>
      <div>
        <strong>ID:</strong> {pagamento.id}
      </div>
      <div>
        <strong>Funcionário:</strong> {funcionario.nome}
      </div>
      <div>
        <strong>Cliente:</strong> {cliente.nome}
      </div>
      <div>
        <strong>Venda:</strong> {venda.id} - Total: R$ {Number(venda.valorTotal ?? venda.ValorTotal).toFixed(2)}
      </div>
      <div>
        <strong>Forma de Pagamento:</strong> {pagamento.formaDePagamento ?? pagamento.FormaDePagamento}
      </div>
      <div>
        <strong>Total Pago:</strong> R$ {Number(pagamento.totalPago ?? pagamento.TotalPago).toFixed(2)}
      </div>
      <div>
        <strong>Total de Vezes:</strong> {pagamento.toTalDeVezes ?? pagamento.ToTalDeVezes}
      </div>
      <div>
        <strong>Data do Pagamento:</strong> {(pagamento.dataPagamento ?? pagamento.DataPagamento)?.slice(0, 10)}
      </div>
      <button onClick={() => navigate(-1)}>Voltar</button>
    </div>
  );
}