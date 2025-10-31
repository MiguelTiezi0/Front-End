import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Categoria.css";


import {linkCat} from "./linkCat";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function CadastroCategoria() {
  useRequireAuth("Funcionario");
  document.title = "Cadastro de Categorias";
  const location = useLocation();
  const categoriaClonada = location.state?.categoria || null;

  const navigate = useNavigate();


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
            navigate("/Categoria/ListagemCategoria");

    } catch (error) {
      console.error(error);
  
    }
  };

  return (
    <div className="centroCategoria">
      <h1>Cadastro de Categorias</h1>
    <div className="CadastroCategoria">
      <form className="formCadastroCategoria" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={id}
          placeholder="Id"
          className="inputCadastroCategoria"
        />
        <input
          type="text"
          required
          placeholder="Descrição"
          className="inputCadastroCategoria"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
       
          <button type="button" className="btnCategoria btnVoltarCategoria">
            <Link to="/Categoria/ListagemCategoria" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnCategoria btnSalvarCategoria">
            Salvar
          </button>
    
      </form>
    </div>
    </div>
  );
}