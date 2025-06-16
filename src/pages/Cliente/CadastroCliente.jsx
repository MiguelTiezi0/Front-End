import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Cliente.css";


import { linkCli } from "./linkCli";


function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calcularDV = (cpfArray, pesoInicial) => {
    let soma = cpfArray.reduce((acc, num, idx) => acc + num * (pesoInicial - idx), 0);
    let resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const numeros = cpf.split('').map(Number);
  const dv1 = calcularDV(numeros.slice(0, 9), 10);
  const dv2 = calcularDV(numeros.slice(0, 10), 11);

  return dv1 === numeros[9] && dv2 === numeros[10];
}



function formatDateInput(value) {
  let v = value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) {
    return v.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
  } else if (v.length > 2) {
    return v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
  }
  return v;
}

function toISODate(dateStr) {
  if (!dateStr) return "";
  const [dd, mm, yyyy] = dateStr.split("/");
  if (!dd || !mm || !yyyy) return dateStr;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

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

    if (!validarCPF(cpf)) {
      alert("CPF inválido!");
      return;
    }

    const cliente = {
      id: parseInt(id),
      nome,
      cpf,
      endereço: endereco,
      número: parseInt(numero),
      telefone,
      bairro,
      dataNascimento: toISODate(dataNascimento),
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
    <div className="centroCliente">
    <div className="CadastroCliente">
      <h1>Cadastro de Clientes</h1>
      <form className="formCadastroCliente" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={id}
          placeholder="Id"
          className="inputCadastroCliente inputIdCliente"
        />
        <input
          type="text"
          required
          placeholder="Nome"
          className="inputCadastroCliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="CPF"
          className="inputCadastroCliente"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Endereço"
          className="inputCadastroCliente"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />
        <input
          type="number"
          required
          placeholder="Número"
          className="inputCadastroCliente"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Telefone"
          className="inputCadastroCliente"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Bairro"
          className="inputCadastroCliente"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Data de Nascimento"
          className="inputCadastroCliente"
          value={dataNascimento}
          onChange={e => setDataNascimento(formatDateInput(e.target.value))}
          maxLength={10}
          data-mask="date"

        />

        <input
          type="number"
          required
          placeholder="Limite de Crédito"
          className="inputCadastroCliente"
          value={limiteDeCredito}
          onChange={(e) => setLimiteDeCredito(e.target.value)}
        />
        <div className="buttonsGroupCliente">
          <button type="button" className="btnCliente btnVoltarCliente">
            <Link to="/" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnCliente btnSalvarCliente">
            Salvar
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}