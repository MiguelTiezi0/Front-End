import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { linkCompra } from "./linkCompra";
import { Link_Itens_Compra } from "../Itens_Compra/link_Itens_Compra";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import "./Compra.css";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function DetalhesCompra() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const [compra, setCompra] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca compra
    fetch(`${linkCompra}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCompra(data);
        // Busca funcionário
        fetch(`${linkFun}/${data.funcionarioId}`)
          .then((r) => r.json())
          .then(setFuncionario);
      });

    // Busca itens da compra
    fetch(`${Link_Itens_Compra}`)
      .then((r) => r.json())
      .then((data) => {
        // Filtra só os itens da compra atual
        setItens(data.filter((item) => item.compraId === Number(id)));
      });

    // Busca produtos
    fetch(linkPro)
      .then((r) => r.json())
      .then(setProdutos);
  }, [id]);

  if (!compra) return <div>Carregando...</div>;

  return (
    <div className="detalhesCompraContainer">
      <h1 className="detalhesCompraTitulo">Detalhes da Compra</h1>
      <div className="detalhescontainer">
     
      <div className="detalhesCompraInfo">
        <input
          disabled
          value={`ID: ${compra.id}`}
          className="inputDetalhes"
        />
        <input
          disabled
          value={`Funcionário: ${
            funcionario?.nome || compra.funcionarioId
          }`}
          className="inputDetalhes"
        />
        <input
          disabled
          value={`Descrição: ${compra.descricao}`}
          className="inputDetalhes"
        />
        <input
          disabled
          value={`Data: ${new Date(compra.dataCompra).toLocaleString("pt-BR")}`}
          className="inputDetalhes"
        />
        <input
          disabled
          value={`Valor Total: R$ ${Number(compra.valorDaCompra).toFixed(2)}`}
          className="inputDetalhes"
        />
        <input
          disabled
          value={`Qtd Produtos: ${compra.quantidadeDeProduto}`}
          className="inputDetalhes"
        />
      </div>
      <div className="detalhesCompraTabelaWrapper">
        <table className="detalhesCompraTabela">
          <thead>
            <tr>
              <th>ID</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Valor uni</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(itens) && itens.length > 0 ? (
              itens.map((item) => {
                const produto = produtos.find((p) => p.id === item.produtoId);
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{produto ? produto.descricao : item.produtoId}</td>
                    <td>{item.quantidade}</td>
                    <td>R$ {Number(item.valorUnitario).toFixed(2)}</td>
                    <td>R$ {Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Nenhum item
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>   
      <div className="btnGroupDetalhesCompra">
        <button className="detalhesCompraBtnVoltar" onClick={() => navigate(-1)}>
          Voltar
        </button>
        <button
          className="detalhesCompraBtnEditar"
          onClick={() => navigate(`/Compra/EditarCompra/${compra.id}`)}
        >
          Editar
        </button>
      
      </div>
      </div>
  );
}