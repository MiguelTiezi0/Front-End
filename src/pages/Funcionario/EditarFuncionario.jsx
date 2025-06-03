import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Funcionario.css";
import { linkFun } from "./linkFun";

export function EditarFuncionario() {
  document.title = "Editar Funcionário";
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState({
    nome: "",
    cpf: "",
    endereço: "",
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
    setFuncionario((prevFuncionario) => ({
      ...prevFuncionario,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      alert("Funcionário atualizado com sucesso!");
      navigate("/Funcionario/ListagemFuncionario");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o funcionário");
    }
  };

  return (
    <div className="EditarFuncionario">
      <h1>Editar Funcionário</h1>
      <form className="divEditar" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={funcionario.id || ""}
          placeholder="Id"
          className="inputEditar"
        />
        <input
          type="text"
          name="nome"
          required
          placeholder="Nome"
          className="inputEditar"
          value={funcionario.nome}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cpf"
          required
          placeholder="CPF"
          className="inputEditar"
          value={funcionario.cpf}
          onChange={handleChange}
        />
        <input
          type="text"
          name="endereço"
          required
          placeholder="Endereço"
          className="inputEditar"
          value={funcionario.endereço}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dataContratação"
          required
          placeholder="Data de Contratação"
          className="inputEditar"
          value={funcionario.dataContratação ? funcionario.dataContratação.substring(0, 10) : ""}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telefone"
          required
          placeholder="Telefone"
          className="inputEditar"
          value={funcionario.telefone}
          onChange={handleChange}
        />
        <input
          type="number"
          name="salário"
          required
          placeholder="Salário"
          className="inputEditar"
          value={funcionario.salário}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dataDeNascimento"
          required
          placeholder="Data de Nascimento"
          className="inputEditar"
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
            style={{ marginLeft: "10px" }}
          />
        </label>
        <div className="buttonsGroup">
          <button type="button" className="btn btnVoltar">
            <Link to="/Funcionario/ListagemFuncionario" className="linkCadastro">
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