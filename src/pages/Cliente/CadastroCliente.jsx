import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Cliente.css";


import { linkCli } from "./linkCli";


export function CadastroCliente() {
  document.title = "Cadastro de Clientes";

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [telefone, setTelefone] = useState("");
  const [bairro, setBairro] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [limiteDeCredito, setLimiteDeCredito] = useState("");

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

        const clientes = await response.json();
        const maiorId = clientes.reduce((max, cliente) => Math.max(max, cliente.id), 0);
        setId(maiorId + 1);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os clientes");
      }
    };

    fetchClientes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cliente = {
      id: parseInt(id),
      nome,
      cpf,
      endereço: endereco,
      número: parseInt(numero),
      telefone,
      bairro,
      dataNascimento,
      limiteDeCrédito: parseFloat(limiteDeCredito),
    };

    try {
      const response = await fetch(linkCli, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar o cliente");
      }

      alert("Cliente cadastrado com sucesso!");

      // Atualiza o próximo ID
      const responseClientes = await fetch(linkCli, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!responseClientes.ok) {
        throw new Error("Erro ao buscar clientes para calcular o próximo ID");
      }

      const clientes = await responseClientes.json();
      const maiorId = clientes.reduce((max, cliente) => Math.max(max, cliente.id), 0);
      setId(maiorId + 1);

      // Limpa os campos
      setNome("");
      setCpf("");
      setEndereco("");
      setNumero("");
      setTelefone("");
      setBairro("");
      setDataNascimento("");
      setLimiteDeCredito("");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar o cliente");
    }
  };

  return (
    <div className="CadastroCliente">
      <h1>Cadastro de Clientes</h1>
      <form className="formCadastro" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={id}
          placeholder="Id"
          className="inputCadastro inputId"
        />
        <input
          type="text"
          required
          placeholder="Nome"
          className="inputCadastro"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="CPF"
          className="inputCadastro"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Endereço"
          className="inputCadastro"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />
        <input
          type="number"
          required
          placeholder="Número"
          className="inputCadastro"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Telefone"
          className="inputCadastro"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Bairro"
          className="inputCadastro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />
        <input
          type="date"
          required
          placeholder="Data de Nascimento"
          className="inputCadastro"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />
        <input
          type="number"
          required
          placeholder="Limite de Crédito"
          className="inputCadastro"
          value={limiteDeCredito}
          onChange={(e) => setLimiteDeCredito(e.target.value)}
        />
        <div className="buttonsGroup">
          <button type="button" className="btn btnVoltar">
            <Link to="/" className="linkCadastro">
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