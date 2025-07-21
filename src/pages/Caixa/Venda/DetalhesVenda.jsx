import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import "./Venda.css";
import { linkVen } from "./linkVen";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";

export function DetalhesVenda() {
  const { id } = useParams();
  const [venda, setVenda] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca venda
    fetch(`${linkVen}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVenda(data);
        fetch(`${linkFun}/${data.funcionarioId}`)
          .then((r) => r.json())
          .then(setFuncionario);
        fetch(`${linkCli}/${data.clienteId}`)
          .then((r) => r.json())
          .then(setCliente);
      });
    // Busca itens da venda
    fetch(linkVenItens)
      .then((r) => r.json())
      .then((data) => {
        setItens(
          data.filter((i) => Number(i.vendaId ?? i.VendaId) === Number(id))
        );
      });
    // Busca produtos
    fetch(linkPro)
      .then((r) => r.json())
      .then(setProdutos);
  }, [id]);

  if (!venda || !funcionario || !cliente) return <div>Carregando...</div>;

  return (
    <div className="detalhesVendaContainer">
      <h2 className="detalhesVendaTitulo">Detalhes de Vendas</h2>
      <div className="detalhesVendaContent">
        <div className="detalhesVendaInfo">
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Funcionário: ${funcionario.nome}`}
            />
          </div>
          {venda.clienteId === 0 ||
          venda.clienteId === "0" ||
          venda.clienteId === null ? (
            <div>
              <input
                type="text"
                className="inputDetalhes"
                disabled
                value={`Nome Cliente: Anônimo`}
              />
            </div>
          ) : (
            <div>
               <input
                type="text"
                className="inputDetalhes"
                disabled
                value={`Nome Cliente: ${cliente.nome}`}
              />
            </div>
          )}
          {venda.clienteId === 0 ||
          venda.clienteId === "0" ||
          venda.clienteId === null ? (
             <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Cpf cliente: Não informado`}
            />
          </div>
          ) : (
             <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Cpf cliente: ${cliente.cpf || ""}`}
            />
          </div>
          )}
       
        
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Data: ${new Date(venda.dataVenda).toLocaleString(
                "pt-BR"
              )}`}
            />
          </div>
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Valor total: R$ ${Number(venda.valorTotal).toFixed(2)}`}
            />
          </div>
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Forma de Pagamento: ${
                Array.isArray(venda.formaDePagamento)
                  ? venda.formaDePagamento.join(", ")
                  : venda.formaDePagamento
              }`}
            />
          </div>
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Quantidade de Parcelas: ${Number(venda.totalDeVezes)}`}
            />
          </div>
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Desconto: R$ ${Number(venda.desconto ?? 0).toFixed(2)}`}
            />
          </div>
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Total Pago: R$ ${Number(venda.totalPago).toFixed(2)}`}
            />
          </div>
          <div>
            <input
              type="text"
              className="inputDetalhes"
              disabled
              value={`Total Restante: R$ ${(
                Number(venda.valorTotal) - Number(venda.totalPago)
              ).toFixed(2)}`}
            />
          </div>
        </div>
        <div className="detalhesVendaTabelaWrapper">
          <table className="detalhesVendaTabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Quantidade</th>
                <th>Produto</th>
                <th>Valor uni</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    Nenhum item encontrado para esta venda.
                  </td>
                </tr>
              ) : (
                itens.map((item) => {
                  const produto = produtos.find(
                    (p) => p.id === Number(item.produtoId ?? item.ProdutoId)
                  );
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.quantidade}</td>
                      <td>
                        {produto
                          ? produto.descricao
                          : item.produtoId ?? item.ProdutoId}
                      </td>
                      <td>
                        R${" "}
                        {Number(item.valorDoItem ?? item.ValorDoItem).toFixed(
                          2
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <button
        className="btnVoltarVenda btnDetalhesVoltar"
        onClick={() => navigate("/Venda/ListagemVenda")}
      >
        Voltar
      </button>
      <Link to={`/Venda/EditarVenda/${id}`}>
        <button className="btnVoltarVenda btnDetalhesEditar" type="button">
          Editar
        </button>
      </Link>
    </div>
  );
}
