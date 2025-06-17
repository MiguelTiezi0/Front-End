import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";

export function ListagemPagamento() {
  const navigate = useNavigate();
  const [pagamentos, setPagamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    fetch(linkPag).then(r => r.json()).then(setPagamentos);
    fetch(linkFun).then(r => r.json()).then(setFuncionarios);
    fetch(linkCli).then(r => r.json()).then(setClientes);
    fetch(linkVen).then(r => r.json()).then(setVendas);
  }, []);

  const getFuncionarioNome = (id) =>
    funcionarios.find(f => f.id === Number(id))?.nome || "";

  const getClienteNome = (id) =>
    clientes.find(c => c.id === Number(id))?.nome || "";

  const getVendaInfo = (id) => {
    const v = vendas.find(v => v.id === Number(id));
    if (!v) return "";
    return `ID: ${v.id} - Total: R$ ${Number(v.valorTotal ?? v.ValorTotal).toFixed(2)}`;
  };

  return (
    <div className="listagemPagamento">
      <h1>Pagamentos Registrados</h1>
      <button onClick={() => navigate("/Pagamento/CadastroPagamento")}>
        Novo Pagamento
      </button>
      <table className="tabelaPagamento">
        <thead>
          <tr>
            <th>ID</th>
            <th>Funcionário</th>
            <th>Cliente</th>
            <th>Venda</th>
            <th>Forma de Pagamento</th>
            <th>Total Pago</th>
            <th>Total de Vezes</th>
            <th>Data Pagamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pagamentos.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>Nenhum pagamento registrado.</td>
            </tr>
          ) : (
            pagamentos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{getFuncionarioNome(p.funcionarioId ?? p.FuncionarioId)}</td>
                <td>{getClienteNome(p.clienteId ?? p.ClienteId)}</td>
                <td>{getVendaInfo(p.vendaId ?? p.VendaId)}</td>
                <td>{p.formaDePagamento ?? p.FormaDePagamento}</td>
                <td>R$ {Number(p.totalPago ?? p.TotalPago).toFixed(2)}</td>
                <td>{p.toTalDeVezes ?? p.ToTalDeVezes}</td>
                <td>{(p.dataPagamento ?? p.DataPagamento)?.slice(0, 10)}</td>
                <td>
                  <button onClick={() => navigate(`/Pagamento/DetalhesPagamento/${p.id}`)}>
                    Detalhes
                  </button>
                  <button onClick={() => navigate(`/Pagamento/EditarPagamento/${p.id}`)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}