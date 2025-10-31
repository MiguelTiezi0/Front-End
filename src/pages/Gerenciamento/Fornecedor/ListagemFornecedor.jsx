import React, { useState, useEffect } from "react";
import "./Fornecedor.css";
import lupa from "../../../assets/icons/lupa.svg";
import lixo from "../../../assets/icons/lixo.svg";
import edit from "../../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";

import { linkFor } from "./linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function ListagemFornecedor() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Fornecedores";
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const response = await fetch(linkFor, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar fornecedores");
        }

        const data = await response.json();
        setFornecedores(data);
        setFornecedoresFiltrados(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os fornecedores");
      }
    };

    fetchFornecedores();
  }, []);

  useEffect(() => {
    const filtrados = fornecedores.filter((fornecedor) =>
      fornecedor.nome.toLowerCase().includes(pesquisa.toLowerCase())
    );
    setFornecedoresFiltrados(filtrados);
  }, [pesquisa, fornecedores]);

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
    setFornecedorSelecionado(id);
  };

  const handleDelete = async () => {
    if (!fornecedorSelecionado) {
      alert("Selecione um fornecedor para deletar.");
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o fornecedor com ID ${fornecedorSelecionado}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${linkFor}/${fornecedorSelecionado}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao deletar o fornecedor");
      }

      alert("Fornecedor deletado com sucesso!");
      setFornecedores((prev) =>
        prev.filter((fornecedor) => fornecedor.id !== fornecedorSelecionado)
      );
      setFornecedoresFiltrados((prev) =>
        prev.filter((fornecedor) => fornecedor.id !== fornecedorSelecionado)
      );
      setFornecedorSelecionado(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o fornecedor");
    }
  };

  const handleEditar = () => {
    if (!fornecedorSelecionado) {
      alert("Selecione um fornecedor para editar.");
      return;
    }
    navigate(`/Fornecedor/EditarFornecedor/${fornecedorSelecionado}`);
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
      <div className="ListagemFornecedor">
        <h1>Listagem de Fornecedores</h1>
        <div className="scrollCategoria">
          <table className="tableCategoria">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {fornecedoresFiltrados.map((fornecedor) => (
                <tr
                  key={fornecedor.id}
                  onClick={() => handleRowClick(fornecedor.id)}
                  style={{
                    backgroundColor:
                      fornecedorSelecionado === fornecedor.id ? "blue" : "transparent",
                    color:
                      fornecedorSelecionado === fornecedor.id ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  <td>{fornecedor.id}</td>
                  <td>{fornecedor.nome}</td>
                  <td>{fornecedor.cnpj}</td>
                  <td>{fornecedor.numTelefone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}