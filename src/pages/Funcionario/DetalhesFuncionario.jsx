import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../assets/icons/lixo.svg";
import olhosAbertos from "../../assets/icons/olhosAbertos.svg";
import edit from "../../assets/icons/edit.svg";
import "./Funcionario.css";
import { linkFun } from "./linkFun";
import { linkVen } from "../Venda/linkVen";

export function DetalhesFuncionario() {
  const { id } = useParams();
  const [funcionario, setFuncionario] = useState(null);
  const [vendas, setVendas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuncionarioDetalhes = async () => {
      try {
        const response = await fetch(`${linkFun}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do funcionário");
        }

        const data = await response.json();
        setFuncionario(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os detalhes do funcionário");
      }
    };

    const fetchVendasFuncionario = async () => {
      try {
        const response = await fetch(linkVen, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar vendas do funcionário");
        }

        const data = await response.json();
        const vendasDoFuncionario = data.filter(
          (v) => Number(v.funcionarioId ?? v.FuncionarioId) === Number(id)
        );
        setVendas(vendasDoFuncionario);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as vendas do funcionário");
      }
    };

    fetchFuncionarioDetalhes();
    fetchVendasFuncionario();
  }, [id]);

  if (!funcionario) {
    return <p>Carregando detalhes do funcionário...</p>;
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const handleVoltar = () => {
    navigate("/Funcionario/ListagemFuncionario");
  };

  const handleEditar = () => {
    navigate(`/Funcionario/EditarFuncionario/${id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este funcionário?"
    );
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

  const totalVendas = vendas.reduce(
    (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
    0
  );

  return (
    <div className="centroDetalhesFuncionario">
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
            onClick={handleVoltar}
          >
            <img src={olhosAbertos} className="top-nav-img" alt="Detalhar" />
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
      <div className="contentDetalhesFuncionario">
        <div className="DetalhesFuncionario">
          <h1 className="DetalhesFuncTitulo">
            Detalhes do Funcionário: {funcionario.nome}
          </h1>
          <div className="divDetalhesFuncionario">
            <input
              type="text"
              disabled
              placeholder="ID"
              className="inputDetalhesFuncionario inputIdDetalhesFuncionario"
              value={`ID: ${funcionario.id}`}
            />
            <input
              type="text"
              disabled
              placeholder="Nome"
              className="inputDetalhesFuncionario"
              value={`Nome: ${funcionario.nome}`}
            />
            <input
              type="text"
              disabled
              placeholder="CPF"
              className="inputDetalhesFuncionario"
              value={`CPF: ${funcionario.cpf}`}
            />
            <input
              type="text"
              disabled
              placeholder="Endereço"
              className="inputDetalhesFuncionario"
              value={`Endereço: ${funcionario.endereço}`}
            />
            <input
              type="text"
              disabled
              placeholder="Telefone"
              className="inputDetalhesFuncionario"
              value={`Telefone: ${funcionario.telefone}`}
            />
            <input
              type="text"
              disabled
              placeholder="Salário"
              className="inputDetalhesFuncionario"
              value={`Salário: ${
                typeof funcionario.salário === "number"
                  ? funcionario.salário.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }`}
            />
            <input
              type="text"
              disabled
              placeholder="Data de Contratação"
              className="inputDetalhesFuncionario"
              value={`Data de Contratação: ${formatarData(
                funcionario.dataContratação
              )}`}
            />
            <input
              type="text"
              disabled
              placeholder="Data de Nascimento"
              className="inputDetalhesFuncionario"
              value={`Data de Nascimento: ${formatarData(
                funcionario.dataDeNascimento
              )}`}
            />
            <input
              type="text"
              disabled
              placeholder="Ativo"
              className="inputDetalhesFuncionario"
              value={`Ativo: ${funcionario.ativo ? "Sim" : "Não"}`}
            />
            <div className="buttonsGroupDetalhesFuncionario">
              <button
                type="button"
                className="btnDetalhesFuncionario btnVoltarFuncionario"
                onClick={handleVoltar}
              >
                <Link
                  to="/Funcionario/ListagemFuncionario"
                  className="linkCadastro"
                >
                  Voltar
                </Link>
              </button>
              <button
                type="button"
                className="btnDetalhesFuncionario btnEditarFuncionario"
                onClick={handleEditar}
              >
                <Link
                  to={`/Funcionario/EditarFuncionario/${funcionario.id}`}
                  className="linkCadastro"
                >
                  Editar
                </Link>
              </button>
            </div>
          </div>
        </div>
        <div className="VendasFuncionario">
          <h2>Vendas Realizadas</h2>
          <table className="detalhesFuncionarioTabela">
            <thead>
              <tr>
                <th>ID Venda</th>
                <th>Total</th>
                <th>Data</th>
                <th>Detalhar Venda</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                vendas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>
                      R$ {Number(v.valorTotal ?? v.ValorTotal).toFixed(2)}
                    </td>
                    <td>{(v.dataVenda ?? v.DataVenda)?.slice(0, 10)}</td>
                    <td>
                      <button className="btnDetalharVendaFuncionario">
                        <Link
                          to={`/Venda/DetalhesVenda/${v.id}`}
                          className="btnDetalharVendaFuncionarioLink"
                        >
                          Detalhar venda
                        </Link>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="detalhesFuncionarioTotal">
              <tr>
                <th colSpan={2}>Total das Vendas</th>
                <td colSpan={2}>
                  <strong>R$ {totalVendas.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
