import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Funcionario.css";
import { linkFun } from "./linkFun";
import Inputmask from "inputmask";

// Função de validação de CPF
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
  // Remove tudo que não for número
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
  // Converte dd/mm/aaaa para aaaa-mm-dd
  if (!dateStr) return "";
  const [dd, mm, yyyy] = dateStr.split("/");
  if (!dd || !mm || !yyyy) return dateStr;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

export function CadastroFuncionario() {
  document.title = "Cadastro de Funcionários";
  const location = useLocation();
  const funcionarioClonado = location.state?.funcionario || null;

  const [id, setId] = useState("");
  const [nome, setNome] = useState(funcionarioClonado?.nome || "");
  const [cpf, setCpf] = useState(funcionarioClonado?.cpf || "");
  const [endereco, setEndereco] = useState(funcionarioClonado?.endereço || "");
  const [dataContratacao, setDataContratacao] = useState(
    funcionarioClonado?.dataContratação || ""
  );
  const [telefone, setTelefone] = useState(funcionarioClonado?.telefone || "");
  const [salario, setSalario] = useState(funcionarioClonado?.salário || "");
  const [dataDeNascimento, setDataDeNascimento] = useState(
    funcionarioClonado?.dataDeNascimento || ""
  );
  const [ativo, setAtivo] = useState(
    funcionarioClonado?.ativo !== undefined ? funcionarioClonado.ativo : true
  );

  useEffect(() => {
    Inputmask("99/99/9999").mask(
      document.querySelectorAll("input[data-mask='date']")
    );

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
        const maiorId = funcionarios.reduce(
          (max, funcionario) => Math.max(max, funcionario.id),
          0
        );
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

    if (!validarCPF(cpf)) {
      alert("CPF inválido!");
      return;
    }

    const funcionario = {
      id: parseInt(id),
      nome,
      cpf,
      endereço: endereco,
      dataContratação: toISODate(dataContratacao),
      telefone,
      salário: parseFloat(salario),
      dataDeNascimento: toISODate(dataDeNascimento),
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

      const responseFuncionarios = await fetch(linkFun, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!responseFuncionarios.ok) {
        throw new Error(
          "Erro ao buscar funcionários para calcular o próximo ID"
        );
      }

      const funcionarios = await responseFuncionarios.json();
      const maiorId = funcionarios.reduce(
        (max, funcionario) => Math.max(max, funcionario.id),
        0
      );
      setId(maiorId + 1);

      setNome("");
      setCpf("");
      setEndereco("");
      setDataContratacao("");
      setTelefone("");
      setSalario("");
      setDataDeNascimento("");
      setAtivo(true);
    } catch (error) {
      console.log(error);
      alert("Erro ao cadastrar o funcionário");
    }
  };

  return (
    <div className="centro">
    
    <div className="CadastroFuncionario">
      <h1>Cadastro de Funcionários</h1>
      <form className="formCadastroFuncionario" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={id}
          placeholder="Id"
          className="inputCadastroFuncionario inputIdFuncionario"
        />
        <input
          type="text"
          required
          placeholder="Nome"
          className="inputCadastroFuncionario"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="CPF"
          className="inputCadastroFuncionario"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Endereço"
          className="inputCadastroFuncionario"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />

        <input
          type="text"
          required
          placeholder="Telefone"
          className="inputCadastroFuncionario"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <input
          type="text"
          required
          placeholder="Data de Contratação "
          className="inputCadastroFuncionario"
          value={dataContratacao}
          onChange={(e) => setDataContratacao(formatDateInput(e.target.value))}
          maxLength={10}
          data-mask="date"
        />

        <input
          type="text"
          required
          placeholder="Data de Nascimento "
          className="inputCadastroFuncionario"
          value={dataDeNascimento}
          onChange={(e) => setDataDeNascimento(formatDateInput(e.target.value))}
          maxLength={10}
          data-mask="date"
        />

        <input
          type="number"
          required
          placeholder="Salário"
          className="inputCadastroFuncionario"
          value={salario}
          onChange={(e) => setSalario(e.target.value)}
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
        <div className="buttonsGroupFuncionario">
          <button type="button" className="btnFuncionario btnVoltarFuncionario">
            <Link to="/" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnFuncionario btnSalvarFuncionario">
            Salvar
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
