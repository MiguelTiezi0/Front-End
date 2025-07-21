import React, { useState, useEffect } from "react";
import "./Funcionario.css";
import { Link } from "react-router-dom";
import { linkFun } from "./linkFun";

export function DeletarFuncionario() {
  document.title = "Deletar Funcionários";
  const [funcionarios, setFuncionarios] = useState([]);

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
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os funcionários");
      }
    };

    fetchFuncionarios();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar este funcionário?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkFun}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o funcionário");
      }

      alert("Funcionário deletado com sucesso!");
      setFuncionarios(funcionarios.filter((funcionario) => funcionario.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o funcionário");
    }
  };

  return (
    <div className="DeletarFuncionario">
      <h1>Deletar Funcionários</h1>
      <div className="scroll">
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
              <th>Data Nascimento</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((funcionario) => (
              <tr key={funcionario.id}>
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
                <td>
                  {funcionario.dataDeNascimento
                    ? new Date(funcionario.dataDeNascimento).toLocaleDateString("pt-BR")
                    : ""}
                </td>
                <td>{funcionario.ativo ? "Sim" : "Não"}</td>
                <td>
                  <button
                    className="btn btnVoltar"
                    onClick={() => handleDelete(funcionario.id)}
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