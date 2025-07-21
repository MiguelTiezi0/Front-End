import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Funcionario.css";
import { linkFun } from "./linkFun";
import lixo from "../../../assets/icons/lixo.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";
import edit from "../../../assets/icons/edit.svg";

// Função de validação de CPF
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


function formatarTelefone(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

export function EditarFuncionario() {
  document.title = "Editar Funcionário";
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState({
    nome: "",
    cpf: "",
    endereço: "",
    bairro: "",
    numeroDaCasa: "",
    dataContratação: "",
    telefone: "",
    salário: "",
    dataDeNascimento: "",
    ativo: true,
  });

  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        const response = await fetch(`${linkFun}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados do funcionário");
        }

        const data = await response.json();
        setFuncionario(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do funcionário");
      }
    };

    fetchFuncionario();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "telefone") {
      setFuncionario((prevFuncionario) => ({
        ...prevFuncionario,
        [name]: formatarTelefone(value),
      }));
    } else {
      setFuncionario((prevFuncionario) => ({
        ...prevFuncionario,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCPF(funcionario.cpf)) {
      alert("CPF inválido!");
      return;
    }

    try {
      const response = await fetch(`${linkFun}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...funcionario,
          salário: parseFloat(funcionario.salário),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o funcionário");
      }

      navigate("/Funcionario/ListagemFuncionario");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o funcionário");
    }
  };

  const handleVoltar = () => {
    navigate("/Funcionario/ListagemFuncionario");
  };

  const handleDetalhar = () => {
    navigate(`/Funcionario/DetalhesFuncionario/${id}`);
  };

  const handleEditar = () => {
    alert("Você já está na tela de edição.");
  };

  const handleDelete = async () => {
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
      navigate("/Funcionario/ListagemFuncionario");
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o funcionário");
    }
  };

  return (
    <div className="centroEditarFuncionario">
      <div className="top-nav">
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
            onClick={handleDetalhar}
          >
            <img src={olhoFechado} className="top-nav-img" alt="Detalhar" />
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
      <div className="EditarFuncionario">
        <h1>Editar Funcionário: {funcionario.nome}</h1>
        <form className="divEditarFuncionario" onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            id="id"
            readOnly
            value={funcionario.id || ""}
            placeholder="Id"
            className="inputEditarFuncionario inputIdEditarFuncionario"
          />
          <input
            type="text"
            name="nome"
            required
            placeholder="Nome"
            className="inputEditarFuncionario"
            value={funcionario.nome}
            onChange={handleChange}
          />
          <input
            type="text"
            name="cpf"
            required
            placeholder="CPF"
            className="inputEditarFuncionario"
            value={funcionario.cpf}
            onChange={handleChange}
          />
          <input
            type="text"
            name="endereço"
            required
            placeholder="Endereço"
            className="inputEditarFuncionario"
            value={funcionario.endereço}
            onChange={handleChange}
          />
          <input
            type="text"
            name="bairro"
            required
            placeholder="Bairro"
            className="inputEditarFuncionario"
            value={funcionario.bairro}
            onChange={handleChange}
          />
          <input
            type="text"
            name="numeroDaCasa"
            required
            placeholder="Número"
            className="inputEditarFuncionario"
            value={funcionario.numeroDaCasa}
            onChange={handleChange}
          />
          <input
            type="text"
            name="telefone"
            required
            placeholder="Telefone"
            className="inputEditarFuncionario"
            value={funcionario.telefone}
            onChange={handleChange}
            maxLength={15}
          />
          <input
            type="date"
            name="dataContratação"
            required
            placeholder="Data de Contratação"
            className="inputEditarFuncionario"
            value={funcionario.dataContratação ? funcionario.dataContratação.substring(0, 10) : ""}
            onChange={handleChange}
          />
          <input
            type="number"
            name="salário"
            required
            placeholder="Salário"
            className="inputEditarFuncionario"
            value={funcionario.salário}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dataDeNascimento"
            required
            placeholder="Data de Nascimento"
            className="inputEditarFuncionario"
            value={funcionario.dataDeNascimento ? funcionario.dataDeNascimento.substring(0, 10) : ""}
            onChange={handleChange}
          />
          <label style={{ color: "#fff", marginTop: "10px" }}>
            Ativo:
            <input
              type="checkbox"
              name="ativo"
              checked={funcionario.ativo}
              onChange={handleChange}
            />
          </label>
          <div className="buttonsGroupFuncionario">
            <button type="button" className="btnFuncionario btnVoltarFuncionario" onClick={handleVoltar}>
              Voltar
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