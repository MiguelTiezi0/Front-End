import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import "./Venda.css";
import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../Produto/linkPro";

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
      .then(r => r.json())
      .then(data => {
        setVenda(data);
        fetch(`${linkFun}/${data.funcionarioId}`).then(r => r.json()).then(setFuncionario);
        fetch(`${linkCli}/${data.clienteId}`).then(r => r.json()).then(setCliente);
      });
    // Busca itens da venda
    fetch(linkVenItens)
      .then(r => r.json())
      .then(data => {
        // Aceita tanto vendaId quanto VendaId
        setItens(
          data.filter(i =>
            Number(i.vendaId ?? i.VendaId) === Number(id)
          )
        );
      });
    // Busca produtos
    fetch(linkPro).then(r => r.json()).then(setProdutos);
  }, [id]);

  if (!venda || !funcionario || !cliente) return <div>Carregando...</div>;

  return (
    <div className="detalhesVendaContainer">
      <h2 className="detalhesVendaTitulo">Detalhes</h2>
      <div className="detalhesVendaContent">
        <div className="detalhesVendaInfo">
          <div>
            <label>Funcionário</label>
            <input type="text" disabled value={funcionario.nome} />
          </div>
          <div>
            <label>CPF</label>
            <input type="text" disabled value={funcionario.cpf || ""} />
          </div>
          <div>
            <label>Cliente</label>
            <input type="text" disabled value={cliente.nome} />
          </div>
          <div>
            <label>Data da venda</label>
            <input type="text" disabled value={new Date(venda.dataVenda).toLocaleString("pt-BR")} />
          </div>
          <div>
            <label>Valor total</label>
            <input type="text" disabled value={`R$ ${Number(venda.valorTotal).toFixed(2)}`} />
          </div>
          <div>
            <label>Forma de pagamento</label>
            <input type="text" disabled value={Array.isArray(venda.formaDePagamento) ? venda.formaDePagamento.join(", ") : venda.formaDePagamento} />
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
                  <td colSpan={4} style={{ textAlign: "center" }}>Nenhum item encontrado para esta venda.</td>
                </tr>
              ) : (
                itens.map(item => {
                  const produto = produtos.find(p => p.id === Number(item.produtoId ?? item.ProdutoId));
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.quantidade}</td>
                      <td>{produto ? produto.descricao : (item.produtoId ?? item.ProdutoId)}</td>
                      <td>R$ {Number(item.valorDoItem ?? item.ValorDoItem).toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
       <button className="btnVoltarVenda" onClick={() => navigate("/Venda/ListagemVenda")}>Voltar</button>
      <Link to={`/Venda/EditarVenda/${id}`}>
        <button className="btnVoltarVenda" type="button">
          Editar
        </button>
      </Link>
    </div>
  );
}