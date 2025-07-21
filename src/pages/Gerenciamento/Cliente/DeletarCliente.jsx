import React, { useState, useEffect } from "react";
import "./Cliente.css";
import { Link } from "react-router-dom";


import { linkCli } from "./linkCli";


export function DeletarCliente() {
  document.title = "Deletar Clientes";
  const [clientes, setClientes] = useState([]);

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
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os clientes");
      }
    };

    fetchClientes();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar este cliente?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCli}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o cliente");
      }

      alert("Cliente deletado com sucesso!");
      setClientes(clientes.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o cliente");
    }
  };

  return (
    <div className="DeletarCliente">
      <h1>Deletar Clientes</h1>
      <div className="scroll">
        <table className="tableProduto">
          <thead>
            <tr>
              <th>Id</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Bairro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.bairro}</td>
                <td>
                  <button
                    className="btn btnVoltar"
                    onClick={() => handleDelete(cliente.id)}
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