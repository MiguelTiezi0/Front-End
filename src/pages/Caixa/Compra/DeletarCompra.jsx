import React, { useState, useEffect } from "react";
import "./Compra.css";
import { Link } from "react-router-dom";
import { linkCompra } from "./linkCompra";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";

export function DeletarCompra() {
  document.title = "Deletar Compras";
  const [compras, setCompras] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await fetch(linkCompra, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar Compras");
        }

        const data = await response.json();
        setCompras(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as Compras");
      }
    };

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

        const funcionariosData = await response.json();
        setFuncionarios(funcionariosData);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os funcionários");
      }
    };

    fetchCompras();
    fetchFuncionarios();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar esta compra?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCompra}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar a compra");
      }

      alert("Compra deletada com sucesso!");
      setCompras(compras.filter((compra) => compra.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar a compra");
    }
  };

  return (
    <div className="DeletarCompra">
      <h1>Deletar Compras</h1>
      <div className="scroll">
        <table className="tableCompra">
          <thead>
            <tr>
              <th>Id</th>
              <th>Funcionário</th>
              <th>Descrição</th>
              <th>Qtd Produtos</th>
              <th>Valor Total</th>
              <th>Data Compra</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra) => (
              <tr key={compra.id}>
                <td>{compra.id}</td>
                <td>
                  {funcionarios.find((f) => f.id === compra.funcionarioId)?.nome || compra.funcionarioId}
                </td>
                <td>{compra.descricao}</td>
                <td>{compra.quantidadeDeProduto}</td>
                <td>
                  {compra.valorDaCompra ? Number(compra.valorDaCompra).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }) : "N/A"}
                </td>
                <td>
                  {compra.dataCompra ? new Date(compra.dataCompra).toLocaleString("pt-BR") : "N/A"}
                </td>
                <td>
                  <button
                    className="btn btnVoltar"
                    onClick={() => handleDelete(compra.id)}
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