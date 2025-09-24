import React, { useState, useEffect } from "react";
import "./Fornecedor.css";
import { Link } from "react-router-dom";
import { linkFor } from "./linkFor";

export function DeletarFornecedor() {
  document.title = "Deletar Fornecedores";
  const [fornecedores, setFornecedores] = useState([]);

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
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os fornecedores");
      }
    };

    fetchFornecedores();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar este fornecedor?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkFor}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o fornecedor");
      }

      alert("Fornecedor deletado com sucesso!");
      setFornecedores(fornecedores.filter((fornecedor) => fornecedor.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o fornecedor");
    }
  };

  return (
    <div className="DeletarFornecedor">
      <h1>Deletar Fornecedores</h1>
      <div className="scrollFornecedor">
        <table className="tableFornecedor">
          <thead>
            <tr>
              <th>Id</th>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.map((fornecedor) => (
              <tr key={fornecedor.id}>
                <td>{fornecedor.id}</td>
                <td>{fornecedor.nome}</td>
                <td>{fornecedor.cnpj}</td>
                <td>{fornecedor.numTelefone}</td>
                <td>
                  <button
                    className="btnFornecedor btnVoltarFornecedor"
                    onClick={() => handleDelete(fornecedor.id)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="buttonsGroupFornecedor">
        <button className="btnFornecedor btnVoltarFornecedor">
          <Link to="/" className="linkCadastro">
            Voltar
          </Link>
        </button>
      </div>
    </div>
  );
}