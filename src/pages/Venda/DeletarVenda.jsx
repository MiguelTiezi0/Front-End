import React, { useState, useEffect } from "react";
import "./Venda.css";
import { Link } from "react-router-dom";
import { linkVen } from "./linkVen";
import { linkCat } from "../Categoria/linkCat";

export function DeletarVenda() {
  document.title = "Deletar Vendas";
  const [Vendas, setVendas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const response = await fetch(linkVen, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar Vendas");
        }

        const data = await response.json();
        setVendas(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os Vendas");
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

    fetchVendas();
    fetchCategorias();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar este Venda?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkVen}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o Venda");
      }

      alert("Venda deletado com sucesso!");
      setVendas(Vendas.filter((Venda) => Venda.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o Venda");
    }
  };

  return (
    <div className="DeletarVenda">
      <h1>Deletar Vendas</h1>
      <div className="scroll">
        <table className="tableVenda">
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
            {Vendas.map((Venda) => (
              <tr key={Venda.id}>
                <td>{Venda.id}</td>
                <td>{Venda.descricao}</td>
                <td>{Venda.quantidade}</td>
                <td>{Venda.preçoVenda ? Venda.preçoVenda.toFixed(2) : "N/A"}</td>
                <td>
                  {
                    categorias.find((cat) => cat.id === Venda.categoriaId)
                      ?.descricao || "N/A"
                  }
                </td>
                <td>{Venda.dataCadastro ? new Date(Venda.dataCadastro).toLocaleString("pt-br") : "N/A"}</td>
                <td>
                  <button
                    className="btn btnVoltar"
                    onClick={() => handleDelete(Venda.id)}
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