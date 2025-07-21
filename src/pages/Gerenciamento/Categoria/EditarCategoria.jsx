import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Categoria.css";

import {linkCat} from "./linkCat";

export function EditarCategoria() {
  document.title = "Editar Categoria";
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState({
    descricao: "",
  });

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const response = await fetch(`${linkCat}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados da categoria");
        }

        const data = await response.json();
        setCategoria(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados da categoria");
      }
    };

    fetchCategoria();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoria((prevCategoria) => ({
      ...prevCategoria,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${linkCat}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoria),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar a categoria");
      }

      alert("Categoria atualizada com sucesso!");
      navigate("/Categoria/ListagemCategoria");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar a categoria");
    }
  };

  return (
    <div className="EditarCategoria">
      <h1>Editar Categoria</h1>
      <form className="divEditarCategoria" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={categoria.id || ""}
          placeholder="Id"
          className="inputEditarCategoria"
        />
        <input
          type="text"
          name="descricao"
          required
          placeholder="Descrição"
          className="inputEditarCategoria"
          value={categoria.descricao}
          onChange={handleChange}
        />
        <div className="buttonsGroupEditarCategoria">
          <button type="button" className="btnCategoria btnVoltarCategoria">
            <Link to="/Categoria/ListagemCategoria" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnCategoria btnSalvarCategoria">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}