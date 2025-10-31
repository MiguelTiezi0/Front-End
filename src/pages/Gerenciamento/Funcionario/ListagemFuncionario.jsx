import React, { useState, useEffect } from "react";
import "./Funcionario.css";
import lupa from "../../../assets/icons/lupa.svg";
import lixo from "../../../assets/icons/lixo.svg";
import edit from "../../../assets/icons/edit.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";

import { useNavigate } from "react-router-dom";
import { linkFun } from "./linkFun";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function ListagemFuncionario() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Funcionários";
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const response = await fetch(linkFun, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar funcionários");
        }

        const data = await response.json();
        setFuncionarios(data);
        setFuncionariosFiltrados(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os funcionários");
      }
    };

    fetchFuncionarios();
  }, []);

  useEffect(() => {
    const filtrados = funcionarios.filter((funcionario) =>
      funcionario.nome.toLowerCase().includes(pesquisa.toLowerCase())
    );
    setFuncionariosFiltrados(filtrados);
  }, [pesquisa, funcionarios]);

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
    setFuncionarioSelecionado(id);
  };

  const handleDelete = async () => {
    if (!funcionarioSelecionado) {
      alert("Selecione um funcionário para deletar.");
      return;
    }

 


    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o funcionário com ID ${funcionarioSelecionado}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${linkFun}/${funcionarioSelecionado}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao deletar o funcionário");
      }

      alert("Funcionário deletado com sucesso!");
      setFuncionarios((prev) =>
        prev.filter((funcionario) => funcionario.id !== funcionarioSelecionado)
      );
      setFuncionariosFiltrados((prev) =>
        prev.filter((funcionario) => funcionario.id !== funcionarioSelecionado)
      );
      setFuncionarioSelecionado(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o funcionário");
    }
  };
   const handleDetalhar = () => {
    if (!funcionarioSelecionado) {
      alert("Selecione um produto para visualizar os detalhes.");
      return;
    }
    navigate(`/Funcionario/DetalhesFuncionario/${funcionarioSelecionado}`);
  };

  const handleEditar = () => {
    if (!funcionarioSelecionado) {
      alert("Selecione um funcionário para editar.");
      return;
    }
    navigate(`/Funcionario/EditarFuncionario/${funcionarioSelecionado}`);
  };

  return (
    <div className="centroListagemFunciona">
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
            className="top-nav-button olhoFechado"
            onClick={handleDetalhar}
          >
            <img src={olhoFechado} className="top-nav-img" alt="OlhoFechado" />
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
    <div className="ListagemFuncionario">
        <h1>Listagem de Funcionários</h1>

      <div className="scrollFuncionario">
        <table className="tableProduto">
          <thead>
            <tr>
              <th>Id</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Endereço</th>
              <th>Data Contratação</th>
              <th>Telefone</th>
              <th>Salário</th>
              <th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {funcionariosFiltrados.map((funcionario) => (
              <tr
                key={funcionario.id}
                onClick={() => handleRowClick(funcionario.id)}
                style={{
                  backgroundColor:
                    funcionarioSelecionado === funcionario.id ? "blue" : "transparent",
                  color:
                    funcionarioSelecionado === funcionario.id ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                <td>{funcionario.id}</td>
                <td>{funcionario.nome}</td>
                <td>{funcionario.cpf}</td>
                <td>{funcionario.endereço}</td>
                <td>
                  {funcionario.dataContratação
                    ? new Date(funcionario.dataContratação).toLocaleDateString("pt-BR")
                    : ""}
                </td>
                <td>{funcionario.telefone}</td>
                <td>
                  {typeof funcionario.salário === "number"
                    ? funcionario.salário.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : ""}
                </td>

                <td>{funcionario.ativo ? "Sim" : "Não"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}