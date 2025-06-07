import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Cliente.css";
import lixo from "../../assets/icons/lixo.svg";
import olhoFechado from "../../assets/icons/olhoFechado.svg";
import edit from "../../assets/icons/edit.svg";
import { linkCli } from "./linkCli";

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

    if (!validarCPF(cliente.cpf)) {
      alert("CPF inválido!");
      return;
    }

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

   
      navigate("/Cliente/ListagemCliente");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o cliente");
    }
  };

  // Navegação de botões
  const handleVoltar = () => {
    navigate("/Cliente/ListagemCliente");
  };

  const handleDetalhar = () => {
    navigate(`/Cliente/DetalhesCliente/${id}`);
  };

  const handleEditar = () => {
    alert("Você já está na tela de edição.");
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar este cliente?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCli}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o cliente");
      }

      alert("Cliente deletado com sucesso!");
      navigate("/Cliente/ListagemCliente");
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o cliente");
    }
  };

  return (
    <div className="centroEditarCliente">
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

    <div className="EditarCliente">
        <h1>Editar Cliente: {cliente.nome}</h1>
      <form className="divEditarCliente" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={cliente.id || ""}
          placeholder="Id"
          className="inputEditarCliente inputIdEditarCliente"
        />
        <input
          type="text"
          name="nome"
          required
          placeholder="Nome"
          className="inputEditarCliente"
          value={cliente.nome}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cpf"
          required
          placeholder="CPF"
          className="inputEditarCliente"
          value={cliente.cpf}
          onChange={handleChange}
        />
        <input
          type="text"
          name="endereço"
          required
          placeholder="Endereço"
          className="inputEditarCliente"
          value={cliente.endereço}
          onChange={handleChange}
        />
        <input
          type="number"
          name="número"
          required
          placeholder="Número"
          className="inputEditarCliente"
          value={cliente.número}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telefone"
          required
          placeholder="Telefone"
          className="inputEditarCliente"
          value={cliente.telefone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="bairro"
          required
          placeholder="Bairro"
          className="inputEditarCliente"
          value={cliente.bairro}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dataNascimento"
          required
          placeholder="Data de Nascimento"
          className="inputEditarCliente"
          value={cliente.dataNascimento ? cliente.dataNascimento.substring(0, 10) : ""}
          onChange={handleChange}
        />
        <input
          type="number"
          name="limiteDeCrédito"
          required
          placeholder="Limite de Crédito"
          className="inputEditarCliente"
          value={cliente.limiteDeCrédito}
          onChange={handleChange}
        />
        <div className="buttonsGroupCliente">
          <button type="button" className="btnCliente btnVoltarCliente" onClick={handleVoltar}>
            Voltar
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