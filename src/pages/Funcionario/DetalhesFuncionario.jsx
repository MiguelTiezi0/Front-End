import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../assets/icons/lixo.svg";
import olhosAbertos from "../../assets/icons/olhosAbertos.svg";
import edit from "../../assets/icons/edit.svg";
import "./Funcionario.css";
import { linkFun } from "./linkFun";

export function DetalhesFuncionario() {
  const { id } = useParams();
  const [funcionario, setFuncionario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuncionarioDetalhes = async () => {
      try {
        const response = await fetch(`${linkFun}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do funcionário");
        }

        const data = await response.json();
        setFuncionario(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os detalhes do funcionário");
      }
    };

    fetchFuncionarioDetalhes();
  }, [id]);

  if (!funcionario) {
    return <p>Carregando detalhes do funcionário...</p>;
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const handleVoltar = () => {
    navigate("/Funcionario/ListagemFuncionario");
  };

  const handleEditar = () => {
    navigate(`/Funcionario/EditarFuncionario/${id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este funcionário?"
    );
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
      navigate("/Funcionario/ListagemFuncionario");
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o funcionário");
    }
  };

  return (
    <div className="DetalhesFuncionario">
      <div className="top-nav">
        <h1>Detalhes do Funcionário: {funcionario.nome}</h1>
        <div className="top-nav-buttons">
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
            onClick={handleVoltar}
          >
            <img src={olhosAbertos} className="top-nav-img" alt="Detalhar" />
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

      <div className="divDetalhesFuncionario">
        <input
          type="text"
          disabled
          placeholder="ID"
          className="inputDetalhesFuncionario"
          value={`ID: ${funcionario.id}`}
        />
        <input
          type="text"
          disabled
          placeholder="Nome"
          className="inputDetalhesFuncionario"
          value={`Nome: ${funcionario.nome}`}
        />
        <input
          type="text"
          disabled
          placeholder="CPF"
          className="inputDetalhesFuncionario"
          value={`CPF: ${funcionario.cpf}`}
        />
        <input
          type="text"
          disabled
          placeholder="Endereço"
          className="inputDetalhesFuncionario"
          value={`Endereço: ${funcionario.endereço}`}
        />
    
        <input
          type="text"
          disabled
          placeholder="Telefone"
          className="inputDetalhesFuncionario"
          value={`Telefone: ${funcionario.telefone}`}
        />
        <input
          type="text"
          disabled
          placeholder="Salário"
          className="inputDetalhesFuncionario"
          value={`Salário: ${
            typeof funcionario.salário === "number"
              ? funcionario.salário.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : ""
          }`}
        />

            <input
          type="text"
          disabled
          placeholder="Data de Contratação"
          className="inputDetalhesFuncionario"
          value={`Data de Contratação: ${formatarData(
            funcionario.dataContratação
          )}`}
        />
        
        <input
          type="text"
          disabled
          placeholder="Data de Nascimento"
          className="inputDetalhesFuncionario"
          value={`Data de Nascimento: ${formatarData(
            funcionario.dataDeNascimento
          )}`}
        />
        <input
          type="text"
          disabled
          placeholder="Ativo"
          className="inputDetalhesFuncionario"
          value={`Ativo: ${funcionario.ativo ? "Sim" : "Não"}`}
        />
      </div>
      <div className="buttonsGroupDetalhesFuncionario">
        <button
          type="button"
          className="btnDetalhesFuncionario btnVoltarFuncionario"
          onClick={handleVoltar}
        >
          <Link to="/Funcionario/ListagemFuncionario" className="linkCadastro">
            Voltar
          </Link>
        </button>
        <button
          type="button"
          className="btnDetalhesFuncionario btnEditarFuncionario"
          onClick={handleEditar}
        >
          <Link
            to={`/Funcionario/EditarFuncionario/${funcionario.id}`}
            className="linkCadastro"
          >
            Editar
          </Link>
        </button>
      </div>
    </div>
  );
}
