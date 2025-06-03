import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Funcionario.css";
import { linkFun } from "./linkFun";

export function CadastroFuncionario() {
  document.title = "Cadastro de Funcionários";
  const location = useLocation();
  const funcionarioClonado = location.state?.funcionario || null;

  const [id, setId] = useState("");
  const [nome, setNome] = useState(funcionarioClonado?.nome || "");
  const [cpf, setCpf] = useState(funcionarioClonado?.cpf || "");
  const [endereco, setEndereco] = useState(funcionarioClonado?.endereço || "");
  const [dataContratacao, setDataContratacao] = useState(funcionarioClonado?.dataContratação || "");
  const [telefone, setTelefone] = useState(funcionarioClonado?.telefone || "");
  const [salario, setSalario] = useState(funcionarioClonado?.salário || "");
  const [dataDeNascimento, setDataDeNascimento] = useState(funcionarioClonado?.dataDeNascimento || "");
  const [ativo, setAtivo] = useState(
    funcionarioClonado?.ativo !== undefined ? funcionarioClonado.ativo : true
  );

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

        const funcionarios = await response.json();
        const maiorId = funcionarios.reduce((max, funcionario) => Math.max(max, funcionario.id), 0);
        setId(maiorId + 1);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os funcionários");
      }
    };

    fetchFuncionarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const funcionario = {
      id: parseInt(id),
      nome,
      cpf,
      endereço: endereco,
      dataContratação: dataContratacao,
      telefone,
      salário: parseFloat(salario),
      dataDeNascimento,
      ativo,
    };

    try {
      const response = await fetch(linkFun, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(funcionario),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar o funcionário");
      }

      alert("Funcionário cadastrado com sucesso!");

      // Atualiza o próximo ID
      const responseFuncionarios = await fetch(linkFun, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!responseFuncionarios.ok) {
        throw new Error("Erro ao buscar funcionários para calcular o próximo ID");
      }

      const funcionarios = await responseFuncionarios.json();
      const maiorId = funcionarios.reduce((max, funcionario) => Math.max(max, funcionario.id), 0);
      setId(maiorId + 1);

      // Limpa os campos
      setNome("");
      setCpf("");
      setEndereco("");
      setDataContratacao("");
      setTelefone("");
      setSalario("");
      setDataDeNascimento("");
      setAtivo(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar o funcionário");
    }
  };

  return (
    <div className="CadastroFuncionario">
      <h1>Cadastro de Funcionários</h1>
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
          type="date"
          required
          placeholder="Data de Contratação"
          className="inputCadastro"
          value={dataContratacao}
          onChange={(e) => setDataContratacao(e.target.value)}
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
          type="number"
          required
          placeholder="Salário"
          className="inputCadastro"
          value={salario}
          onChange={(e) => setSalario(e.target.value)}
        />
        <input
          type="date"
          required
          placeholder="Data de Nascimento"
          className="inputCadastro"
          value={dataDeNascimento}
          onChange={(e) => setDataDeNascimento(e.target.value)}
        />
        <label style={{ color: "#fff", marginTop: "10px" }}>
          Ativo:
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            style={{ marginLeft: "10px" }}
          />
        </label>
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