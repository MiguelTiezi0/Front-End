import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Funcionario.css";
import { linkFun } from "./linkFun";
import lixo from "../../../assets/icons/lixo.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";
import edit from "../../../assets/icons/edit.svg";

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
    id: "",
    nome: "",
    cpf: "",
    endereco: "",
    dataContratacao: "",
    telefone: "",
    salario: "",
    dataDeNascimento: "",
    ativo: true,
    usuario: "",
    senha: "",
    nivelAcesso: 3, // cliente como padrão
  });

  // Buscar funcionário
  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        const response = await fetch(`${linkFun}/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error("Erro ao buscar os dados do funcionário");

        const data = await response.json();
        // Mapear propriedades do backend para as chaves locais usadas no formulário
        setFuncionario({
          id: data.id ?? data.Id ?? "",
          nome: data.nome ?? data.Nome ?? "",
          cpf: data.cpf ?? data.CPF ?? "",
          endereco:
            data.endereço ??
            data.Endereço ??
            data.endereco ??
            data.Endereco ??
            "",
          dataContratacao:
            data.dataContratacao ??
            data.dataContratação ??
            data.DataContratacao ??
            data.DataContratação ??
            "",
          telefone: data.telefone ?? data.Telefone ?? "",
          salario:
            data.salario ?? data.salário ?? data.Salário ?? data.Salário ?? 0,
          dataDeNascimento:
            data.dataDeNascimento ??
            data.DataDeNascimento ??
            data.dataDeNascimento ??
            "",
          ativo: data.ativo ?? data.Ativo ?? false,
          usuario: data.usuario ?? data.Usuario ?? "",
          senha: data.senha ?? data.Senha ?? "",
          nivelAcesso:
            data.nivelAcesso ?? data.NivelAcesso ?? data.NivelAcesso ?? 3,
        });
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do funcionário");
      }
    };

    fetchFuncionario();
  }, [id]);

  // Mudança nos campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "telefone") {
      setFuncionario((prev) => ({ ...prev, [name]: formatarTelefone(value) }));
    } else {
      setFuncionario((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCPF(funcionario.cpf)) {
      alert("CPF inválido!");
      return;
    }

    try {
      // Monta payload com os nomes que o backend espera (use strings para propriedades com acento)
      const payload = {
        Id: Number(funcionario.id) || undefined,
        Nome: funcionario.nome,
        CPF: funcionario.cpf,
        Endereço: funcionario.endereco,
        DataContratação: funcionario.dataContratacao,
        Telefone: funcionario.telefone,
        Salário: parseFloat(funcionario.salario) || 0,
        DataDeNascimento: funcionario.dataDeNascimento,
        Ativo: !!funcionario.ativo,
        Usuario: funcionario.usuario,
        Senha: funcionario.senha,
        NivelAcesso: Number(funcionario.nivelAcesso),
      };

      const response = await fetch(`${linkFun}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro do backend:", errorText);
        throw new Error("Erro ao atualizar o funcionário");
      }

      navigate("/Funcionario/ListagemFuncionario");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o funcionário");
    }
  };

  const handleVoltar = () => navigate("/Funcionario/ListagemFuncionario");
  const handleDetalhar = () =>
    navigate(`/Funcionario/DetalhesFuncionario/${id}`);
  const handleEditar = () => alert("Você já está na tela de edição.");
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este funcionário?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkFun}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erro ao deletar o funcionário");
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
            readOnly
            value={funcionario.id || ""}
            placeholder="Id"
            className="inputEditarFuncionario"
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
            name="endereco"
            required
            placeholder="Endereço"
            className="inputEditarFuncionario"
            value={funcionario.endereco}
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
            name="dataContratacao"
            required
            className="inputEditarFuncionario"
            value={funcionario.dataContratacao?.substring(0, 10) || ""}
            onChange={handleChange}
          />
          <input
            type="number"
            name="salario"
            required
            placeholder="Salário"
            className="inputEditarFuncionario"
            value={funcionario.salario}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dataDeNascimento"
            required
            className="inputEditarFuncionario"
            value={funcionario.dataDeNascimento?.substring(0, 10) || ""}
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

          {/* Novos campos */}
          <input
            type="text"
            name="usuario"
            required
            placeholder="Usuário"
            className="inputEditarFuncionario"
            value={funcionario.usuario}
            onChange={handleChange}
          />
          <input
            type="text"
            name="senha"
            required
            placeholder="Senha"
            className="inputEditarFuncionario"
            value={funcionario.senha}
            onChange={handleChange}
          />

          {/* Nivel de acesso com enum */}
          <select
            name="nivelAcesso"
            className="inputEditarFuncionario"
            value={funcionario.nivelAcesso}
            onChange={handleChange}
            required
          >
            <option value={0}>Administrador</option>
            <option value={1}>Gerente</option>
            <option value={2}>Funcionário</option>
            <option value={3}>Cliente</option>
          </select>

          <div className="buttonsGroupFuncionario">
            <button
              type="button"
              className="btnFuncionario btnVoltarFuncionario"
              onClick={handleVoltar}
            >
              Voltar
            </button>
            <button
              type="submit"
              className="btnFuncionario btnSalvarFuncionario"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
