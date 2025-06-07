import React, { useState, useEffect } from "react";
import "./Categoria.css";
import lupa from "../../assets/icons/lupa.svg";
import lixo from "../../assets/icons/lixo.svg";
import edit from "../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";

import { linkCat } from "./linkCat";
import { linkPro } from "../Produto/linkPro"; 

export function ListagemCategoria() {
  document.title = "Listagem de Categorias";
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const navigate = useNavigate();

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
        setCategoriasFiltradas(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as categorias");
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    const filtradas = categorias.filter((categoria) =>
      categoria.descricao.toLowerCase().includes(pesquisa.toLowerCase())
    );
    setCategoriasFiltradas(filtradas);
  }, [pesquisa, categorias]);

  function handleClickPesquisa() {
    setInputVisivel(!inputVisivel);
    setbtnVisivel(!btnVisivel);
    setPesquisa("");
    setTimeout(() => {
      const input = document.querySelector(".inputPesquisar");
      if (input) input.focus();
    }, 0);
  }

  const handleRowClick = (id) => {
    setCategoriaSelecionada(id);
  };

  const handleDelete = async () => {
    if (!categoriaSelecionada) {
      alert("Selecione uma categoria para deletar.");
      return;
    }

    // Verifica se existe produto com essa categoria
    try {
      const responseProdutos = await fetch(linkPro, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!responseProdutos.ok) {
        throw new Error("Erro ao buscar produtos");
      }

      const produtos = await responseProdutos.json();
      const existeProduto = produtos.some(
        (produto) => produto.categoriaId === categoriaSelecionada
      );

      if (existeProduto) {
        alert(
          "Não é possível deletar esta categoria pois existe um produto cadastrado nela."
        );
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao verificar produtos da categoria");
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar a categoria com ID ${categoriaSelecionada}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${linkCat}/${categoriaSelecionada}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao deletar a categoria");
      }

      alert("Categoria deletada com sucesso!");
      setCategorias((prev) =>
        prev.filter((categoria) => categoria.id !== categoriaSelecionada)
      );
      setCategoriasFiltradas((prev) =>
        prev.filter((categoria) => categoria.id !== categoriaSelecionada)
      );
      setCategoriaSelecionada(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar a categoria");
    }
  };

  const handleEditar = () => {
    if (!categoriaSelecionada) {
      alert("Selecione uma categoria para editar.");
      return;
    }
    navigate(`/Categoria/EditarCategoria/${categoriaSelecionada}`);
  };

  return (
    <div className="centro">
      <div className="top-nav">

        <div className="top-nav-buttons">
          {btnVisivel && (
            <button
              type="button"
              className="top-nav-button lupa"
              onClick={handleClickPesquisa}
            >
              <img src={lupa} className="top-nav-img" alt="Lupa" />
            </button>
          )}

          <input
            type="text"
            className={`inputPesquisar ${inputVisivel ? "visivel" : ""}`}
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

          <button
            type="button"
            className="top-nav-button lixo"
            onClick={handleDelete}
          >
            <img src={lixo} className="top-nav-img" alt="Lixo" />
          </button>

          <button
            type="button"
            className="top-nav-button editar"
            onClick={handleEditar}
          >
            <img src={edit} className="top-nav-img" alt="Editar" />
          </button>
        </div>
      </div>
    <div className="ListagemCategoria">

        <h1>Listagem de Categorias</h1>
      <div className="scrollCategoria">
        <table className="tableCategoria">
          <thead>
            <tr>
              <th>Id</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.map((categoria) => (
              <tr
                key={categoria.id}
                onClick={() => handleRowClick(categoria.id)}
                style={{
                  backgroundColor:
                    categoriaSelecionada === categoria.id ? "blue" : "transparent",
                  color:
                    categoriaSelecionada === categoria.id ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                <td>{categoria.id}</td>
                <td>{categoria.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}