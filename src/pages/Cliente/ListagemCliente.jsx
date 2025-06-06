import React, { useState, useEffect } from "react";
import "./Cliente.css";
import lupa from "../../assets/icons/lupa.svg";
import lixo from "../../assets/icons/lixo.svg";
import edit from "../../assets/icons/edit.svg";
import olhoFechado from "../../assets/icons/olhoFechado.svg";
import { useNavigate } from "react-router-dom";

import { linkCli } from "./linkCli";

export function ListagemCliente() {
  document.title = "Listagem de Clientes";
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(linkCli, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar clientes");
        }

        const data = await response.json();
        setClientes(data);
        setClientesFiltrados(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os clientes");
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    const filtrados = clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(pesquisa.toLowerCase())
    );
    setClientesFiltrados(filtrados);
  }, [pesquisa, clientes]);

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
    setClienteSelecionado(id);
  };

  const handleDelete = async () => {
    if (!clienteSelecionado) {
      alert("Selecione um cliente para deletar.");
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o cliente com ID ${clienteSelecionado}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCli}/${clienteSelecionado}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o cliente");
      }

      alert("Cliente deletado com sucesso!");
      setClientes((prev) =>
        prev.filter((cliente) => cliente.id !== clienteSelecionado)
      );
      setClientesFiltrados((prev) =>
        prev.filter((cliente) => cliente.id !== clienteSelecionado)
      );
      setClienteSelecionado(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o cliente");
    }
  };

  const handleEditar = () => {
    if (!clienteSelecionado) {
      alert("Selecione um cliente para editar.");
      return;
    }
    navigate(`/Cliente/EditarCliente/${clienteSelecionado}`);
  };

  const handleDetalhar = () => {
    if (!clienteSelecionado) {
      alert("Selecione um cliente para visualizar os detalhes.");
      return;
    }
    navigate(`/Cliente/DetalhesCliente/${clienteSelecionado}`);
  };

  return (
    <div className="ListagemCliente">
      <div className="top-nav">
        <h1>Listagem de Clientes</h1>
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
            <img src={olhoFechado} className="top-nav-img" alt="Detalhar" />
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

      <div className="scroll">
        <table className="tableCliente">
          <thead>
            <tr>
              <th>Id</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Limite de Crédito</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr
                key={cliente.id}
                onClick={() => handleRowClick(cliente.id)}
                style={{
                  backgroundColor:
                    clienteSelecionado === cliente.id ? "blue" : "transparent",
                  color: clienteSelecionado === cliente.id ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.telefone}</td>
                <td>{Number(cliente.limiteDeCrédito || 0).toFixed(2).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
