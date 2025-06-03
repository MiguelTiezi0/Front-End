import React, { useState, useEffect } from "react";
import "./Produto.css";
import { Link } from "react-router-dom";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";

export function DeletarProduto() {
  document.title = "Deletar Produtos";
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch(linkPro, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar produtos");
        }

        const data = await response.json();
        setProdutos(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os produtos");
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await fetch(linkCat, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar categorias");
        }

        const categoriasData = await response.json();
        setCategorias(categoriasData);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as categorias");
      }
    };

    fetchProdutos();
    fetchCategorias();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar este produto?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkPro}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o produto");
      }

      alert("Produto deletado com sucesso!");
      setProdutos(produtos.filter((produto) => produto.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o produto");
    }
  };

  return (
    <div className="DeletarProduto">
      <h1>Deletar Produtos</h1>
      <div className="scroll">
        <table className="tableProduto">
          <thead>
            <tr>
              <th>Id</th>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Categoria</th>
              <th>Data Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>{produto.descricao}</td>
                <td>{produto.quantidade}</td>
                <td>{produto.preçoVenda ? produto.preçoVenda.toFixed(2) : "N/A"}</td>
                <td>
                  {
                    categorias.find((cat) => cat.id === produto.categoriaId)
                      ?.descricao || "N/A"
                  }
                </td>
                <td>{produto.dataCadastro ? new Date(produto.dataCadastro).toLocaleString("pt-br") : "N/A"}</td>
                <td>
                  <button
                    className="btn btnVoltar"
                    onClick={() => handleDelete(produto.id)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="buttonsGroup">
        <button className="btn btnVoltar">
          <Link to="/" className="linkCadastro">
            Voltar
          </Link>
        </button>
      </div>
    </div>
  );
}