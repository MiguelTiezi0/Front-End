import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Categoria.css";


import {linkCat} from "./linkCat";

export function CadastroCategoria() {
  document.title = "Cadastro de Categorias";
  const location = useLocation();
  const categoriaClonada = location.state?.categoria || null;

  const [id, setId] = useState("");
  const [descricao, setDescricao] = useState(categoriaClonada?.descricao || "");

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

        const categorias = await response.json();
        const maiorId = categorias.reduce((max, categoria) => Math.max(max, categoria.id), 0);
        setId(maiorId + 1);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as categorias");
      }
    };

    fetchCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoria = {
      descricao,
    };

    try {
      const response = await fetch(linkCat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoria),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar a categoria");
      }

      alert("Categoria cadastrada com sucesso!");

      // Atualiza o próximo ID
      const responseCategorias = await fetch(linkCat, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!responseCategorias.ok) {
        throw new Error("Erro ao buscar categorias para calcular o próximo ID");
      }

      const categorias = await responseCategorias.json();
      const maiorId = categorias.reduce((max, categoria) => Math.max(max, categoria.id), 0);
      setId(maiorId + 1);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar a categoria");
    }
  };

  return (
    <div className="CadastroCategoria">
      <h1>Cadastro de Categorias</h1>
      <form className="formCadastro" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={id}
          placeholder="Id"
          className="inputCadastro inputId"
        />
        <input
          type="text"
          required
          placeholder="Descrição"
          className="inputCadastro"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <div className="buttonsGroup">
          <button type="button" className="btn btnVoltar">
            <Link to="/" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btn btnSalvar">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}