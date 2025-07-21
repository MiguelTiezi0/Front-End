import React, { useState, useEffect } from "react";
import "./Categoria.css";
import { Link } from "react-router-dom";


import {linkCat} from "./linkCat";

export function DeletarCategoria() {
  document.title = "Deletar Categorias";
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
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

        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as categorias");
      }
    };

    fetchCategorias();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar esta categoria?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCat}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar a categoria");
      }

      alert("Categoria deletada com sucesso!");
      setCategorias(categorias.filter((categoria) => categoria.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar a categoria");
    }
  };

  return (
    <div className="DeletarCategoria">
      <h1>Deletar Categorias</h1>
      <div className="scroll">
        <table className="tableProduto">
          <thead>
            <tr>
              <th>Id</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.id}</td>
                <td>{categoria.descricao}</td>
                <td>
                  <button
                    className="btn btnVoltar"
                    onClick={() => handleDelete(categoria.id)}
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