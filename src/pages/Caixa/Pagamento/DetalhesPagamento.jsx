import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function DetalhesPagamento() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const navigate = useNavigate();

  const [pagamento, setPagamento] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [venda, setVenda] = useState(null);

  useEffect(() => {
    fetch(`${linkPag}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPagamento(data);
        fetch(`${linkFun}/${data.funcionarioId ?? data.FuncionarioId}`)
          .then((r) => r.json())
          .then(setFuncionario);
        fetch(`${linkCli}/${data.clienteId ?? data.ClienteId}`)
          .then((r) => r.json())
          .then(setCliente);
        fetch(`${linkVen}/${data.vendaId ?? data.VendaId}`)
          .then((r) => r.json())
          .then(setVenda);
      });
  }, [id]);

  if (!pagamento || !funcionario || !cliente || !venda) {
    return (
      <div className="detalhesPagamentoCarregando">
        Carregando detalhes do pagamento...
      </div>
    );
  }
  console.log("Detalhes do Pagamento:", pagamento);

  return (
    <div className="detalhesPagamentoContainer">
      <div className="detalhesPagamentoCard">
        <h1 className="detalhesPagamentoTitulo">Detalhes do Pagamento</h1>
        <div className="detalhesPagamentoInfo">
          <div className="divDetalhesPagamentoLabel">
            <span className="detalhesPagamentoLabel">ID:</span> {pagamento.id}
          </div>
          <div className="divDetalhesPagamentoLabel">
            <span className="detalhesPagamentoLabel">Funcionário:</span>{" "}
            {funcionario.nome}
          </div>
          <div className="divDetalhesPagamentoLabel">
            <span className="detalhesPagamentoLabel">Cliente:</span>{" "}
            {cliente.nome}
          </div>
          <div className="divDetalhesPagamentoLabel">
            <span className="detalhesPagamentoLabel">Forma de Pagamento:</span>{" "}
            {pagamento.formaDePagamento ?? pagamento.FormaDePagamento}
          </div>
          <div className="divDetalhesPagamentoLabel">
            <span className="detalhesPagamentoLabel">Total Pago:</span> R${" "}
            {Number(pagamento.totalPago ?? pagamento.TotalPago).toFixed(2)}
          </div>
          <div className="divDetalhesPagamentoLabel">
            <span className="detalhesPagamentoLabel">Total de Vezes:</span>{" "}
            {pagamento.toTalDeVezes ?? pagamento.ToTalDeVezes}
          </div>
          <div className="divDetalhesPagamentoLabel">
            <span className="detalhesPagamentoLabel">Data do Pagamento:</span>{" "}
            {(pagamento.dataPagamento ?? pagamento.DataPagamento)?.slice(0, 10)}
          </div>
        </div>
        <div className="detalhesPagamentoBtns">
          <button
            className="detalhesPagamentoBtnVoltar"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
          <button
            className="detalhesPagamentoBtnEditar"
            onClick={() => navigate(`/Pagamento/EditarPagamento/${pagamento.id}`)}
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
