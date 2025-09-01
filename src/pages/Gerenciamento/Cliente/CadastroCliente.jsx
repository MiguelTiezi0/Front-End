import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Cliente.css";
import { linkCli } from "./linkCli";

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calcularDV = (cpfArray, pesoInicial) => {
    let soma = cpfArray.reduce(
      (acc, num, idx) => acc + num * (pesoInicial - idx),
      0
    );
    let resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const numeros = cpf.split("").map(Number);
  const dv1 = calcularDV(numeros.slice(0, 9), 10);
  const dv2 = calcularDV(numeros.slice(0, 10), 11);
  return dv1 === numeros[9] && dv2 === numeros[10];
}

function formatDateInput(value) {
  let v = value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) return v.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
  else if (v.length > 2) return v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
  return v;
}

function toISODate(dateStr) {
  if (!dateStr) return "";
  const [dd, mm, yyyy] = dateStr.split("/");
  if (!dd || !mm || !yyyy) return dateStr;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function formatTelefoneInput(value) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
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
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(linkCli, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Erro ao buscar clientes");
        const clientes = await response.json();
        const maiorId = clientes.reduce(
          (max, cliente) => Math.max(max, cliente.id),
          0
        );
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

    let camposFaltando = [];
    if (!nome) camposFaltando.push("Nome");
    if (!cpf) camposFaltando.push("CPF");
    if (!endereco) camposFaltando.push("Endereço");
    if (!numero) camposFaltando.push("Número");
    if (!telefone) camposFaltando.push("Telefone");
    if (!bairro) camposFaltando.push("Bairro");
    if (!dataNascimento) camposFaltando.push("Data de Nascimento");
    if (!limiteDeCredito) camposFaltando.push("Limite de Crédito");
    if (!usuario) camposFaltando.push("Usuário");
    if (!senha) camposFaltando.push("Senha");

    if (camposFaltando.length > 0) {
      const confirmar = window.confirm(
        `Os seguintes campos não foram preenchidos: ${camposFaltando.join(
          ", "
        )}.\nDeseja continuar mesmo assim?`
      );
      if (!confirmar) return;
    }

    if (cpf && !validarCPF(cpf)) {
      alert("CPF inválido!");
      return;
    }

    const cliente = {
      id: parseInt(id),
      nome: nome || "não informado",
      cpf: cpf || "não informado",
      endereço: endereco || "não informado",
      número: numero ? parseInt(numero) : 0,
      telefone: telefone || "não informado",
      bairro: bairro || "não informado",
      dataNascimento: dataNascimento ? toISODate(dataNascimento) : "",
      limiteDeCrédito: limiteDeCredito ? parseFloat(limiteDeCredito) : 0,
      usuario: usuario || "não informado",
      senha: senha || "123456",
      nivelAcesso: 3, // sempre Cliente
    };

    try {
      const response = await fetch(linkCli, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente),
      });
      if (!response.ok) throw new Error("Erro ao cadastrar o cliente");

      const responseClientes = await fetch(linkCli, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const clientes = await responseClientes.json();
      const maiorId = clientes.reduce(
        (max, cliente) => Math.max(max, cliente.id),
        0
      );
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
      setUsuario("");
      setSenha("");
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
            readOnly
            value={id}
            placeholder="Id"
            className="inputCadastroCliente inputIdCliente"
          />
          <input
            type="text"
            placeholder="Nome"
            className="inputCadastroCliente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="text"
            placeholder="CPF"
            className="inputCadastroCliente"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <input
            type="text"
            placeholder="Endereço"
            className="inputCadastroCliente"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
          <input
            type="number"
            placeholder="Número"
            className="inputCadastroCliente"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
          <input
            type="text"
            placeholder="Telefone"
            className="inputCadastroCliente"
            value={telefone}
            onChange={(e) => setTelefone(formatTelefoneInput(e.target.value))}
            maxLength={15}
          />
          <input
            type="text"
            placeholder="Bairro"
            className="inputCadastroCliente"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
          <input
            type="text"
            placeholder="Data de Nascimento (dd/mm/aaaa)"
            className="inputCadastroCliente"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(formatDateInput(e.target.value))}
            maxLength={10}
          />
          <input
            type="number"
            placeholder="Limite de Crédito"
            className="inputCadastroCliente"
            value={limiteDeCredito}
            onChange={(e) => setLimiteDeCredito(e.target.value)}
          />

          {/* Novos campos de usuário e senha */}
          <input
            type="text"
            placeholder="Usuário"
            className="inputCadastroCliente"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="inputCadastroCliente"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
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
