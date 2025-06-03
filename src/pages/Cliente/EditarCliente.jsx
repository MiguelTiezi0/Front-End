import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Cliente.css";


import { linkCli } from "./linkCli";


export function EditarCliente() {
  document.title = "Editar Cliente";
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({
    nome: "",
    cpf: "",
    endereço: "",
    número: "",
    telefone: "",
    bairro: "",
    dataNascimento: "",
    limiteDeCrédito: "",
  });

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`${linkCli}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados do cliente");
        }

        const data = await response.json();
        setCliente(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do cliente");
      }
    };

    fetchCliente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prevCliente) => ({
      ...prevCliente,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${linkCli}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cliente,
          número: parseInt(cliente.número),
          limiteDeCrédito: parseFloat(cliente.limiteDeCrédito),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o cliente");
      }

      alert("Cliente atualizado com sucesso!");
      navigate("/Cliente/ListagemCliente");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o cliente");
    }
  };

  return (
    <div className="EditarCliente">
      <h1>Editar Cliente</h1>
      <form className="divEditar" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={cliente.id || ""}
          placeholder="Id"
          className="inputEditar"
        />
        <input
          type="text"
          name="nome"
          required
          placeholder="Nome"
          className="inputEditar"
          value={cliente.nome}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cpf"
          required
          placeholder="CPF"
          className="inputEditar"
          value={cliente.cpf}
          onChange={handleChange}
        />
        <input
          type="text"
          name="endereço"
          required
          placeholder="Endereço"
          className="inputEditar"
          value={cliente.endereço}
          onChange={handleChange}
        />
        <input
          type="number"
          name="número"
          required
          placeholder="Número"
          className="inputEditar"
          value={cliente.número}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telefone"
          required
          placeholder="Telefone"
          className="inputEditar"
          value={cliente.telefone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="bairro"
          required
          placeholder="Bairro"
          className="inputEditar"
          value={cliente.bairro}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dataNascimento"
          required
          placeholder="Data de Nascimento"
          className="inputEditar"
          value={cliente.dataNascimento ? cliente.dataNascimento.substring(0, 10) : ""}
          onChange={handleChange}
        />
        <input
          type="number"
          name="limiteDeCrédito"
          required
          placeholder="Limite de Crédito"
          className="inputEditar"
          value={cliente.limiteDeCrédito}
          onChange={handleChange}
        />
        <div className="buttonsGroup">
          <button type="button" className="btn btnVoltar">
            <Link to="/Cliente/ListagemCliente" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btn btnSalvar">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}