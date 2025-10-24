import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../../assets/icons/lixo.svg";
import olhosAbertos from "../../../assets/icons/olhosAbertos.svg";
import edit from "../../../assets/icons/edit.svg";
import "./Funcionario.css";
import { linkFun } from "./linkFun";
import { linkVen } from "../../Caixa/Venda/linkVen";

export function DetalhesFuncionario() {
  const { id } = useParams();
  const [funcionario, setFuncionario] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuncionarioDetalhes = async () => {
      try {
        const response = await fetch(`${linkFun}/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error("Erro ao buscar detalhes do funcionário");

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
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error("Erro ao buscar vendas do funcionário");

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

  if (!funcionario) return <p>Carregando detalhes do funcionário...</p>;

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const handleVoltar = () => navigate("/Funcionario/ListagemFuncionario");
  const handleEditar = () => navigate(`/Funcionario/EditarFuncionario/${id}`);
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

  const totalVendas = vendas.reduce(
    (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
    0
  );

  const vendasOrdenadas = [...vendas].sort(
    (a, b) =>
      new Date(b.dataVenda ?? b.DataVenda) -
      new Date(a.dataVenda ?? a.DataVenda)
  );

  const vendasFiltradas = vendasOrdenadas.filter((v) => {
    const dataVenda = new Date(v.dataVenda ?? v.DataVenda);
    if (dataInicio && dataFim) {
      const ini = new Date(`${dataInicio}T00:00:00`);
      const fim = new Date(`${dataFim}T23:59:59`);
      return dataVenda >= ini && dataVenda <= fim;
    }
    return true;
  });

  const totalVendasFiltradas = vendasFiltradas.reduce(
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
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`ID: ${funcionario.id}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Nome: ${funcionario.nome}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`CPF: ${funcionario.cpf}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Endereço: ${funcionario.endereço}`}
            />

            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Telefone: ${funcionario.telefone}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
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
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Data de Contratação: ${formatarData(
                funcionario.dataContratação
              )}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Data de Nascimento: ${formatarData(
                funcionario.dataDeNascimento
              )}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Ativo: ${funcionario.ativo ? "Sim" : "Não"}`}
            />

            {/* Novos campos */}
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Usuário: ${funcionario.usuario}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Senha: ${funcionario.senha}`}
            />
            <input
              className="inputDetalhesFuncionario"
              type="text"
              disabled
              value={`Nível de Acesso: ${funcionario.nivelAcesso}`}
            />

            <div className="buttonsGroupDetalhesFuncionario">
              <button
                type="button"
                className="btnDetalhesFuncionario btnVoltarFuncionario"
                onClick={handleVoltar}
              >
                <Link
                  to="/Funcionario/ListagemFuncionario"
                  className="linkEditarFunc"
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
                  className="linkEditarFunc"
                >
                  Editar
                </Link>
              </button>
            </div>
          </div>
        </div>

        <div className="VendasFuncionario">
          <h2>Vendas Realizadas</h2>
          <div style={{ display: "flex", gap: 16, margin: "16px 0" }}>
            <div>
              <label>Data Inicial: </label>
              <input
                type="date"
                value={dataInicio}
                max={dataFim || undefined}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label>Data Final: </label>
              <input
                type="date"
                value={dataFim}
                min={dataInicio || undefined}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
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
                vendasFiltradas.map((v) => (
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
                <th colSpan={2}>
                  {dataInicio && dataFim
                    ? "Total das Vendas filtradas"
                    : "Total de Todas as Vendas"}
                </th>
                <td colSpan={2}>
                  <strong>R$ {totalVendasFiltradas.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
