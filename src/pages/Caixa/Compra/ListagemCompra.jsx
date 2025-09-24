import React, { useState, useEffect } from "react";
import "./Compra.css";
import lupa from "../../../assets/icons/lupa.svg";
import lixo from "../../../assets/icons/lixo.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";
import edit from "../../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";
import { linkCompra } from "./linkCompra";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";

export function ListagemCompra() {
  document.title = "Listagem de Compras";
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [compras, setCompras] = useState([]);
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [compraSelecionada, setCompraSelecionada] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipoPesquisa, setTipoPesquisa] = useState("id");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resCompras, resFuncs, resProdutos] = await Promise.all([
          fetch(linkCompra),
          fetch(linkFun),
          fetch(linkPro),
        ]);
        const comprasData = await resCompras.json();
        const funcsData = await resFuncs.json();
        const produtosData = await resProdutos.json();

        setCompras(comprasData);
        setComprasFiltradas(comprasData);
        setFuncionarios(funcsData);
        setProdutos(produtosData);
      } catch (error) {
        alert("Erro ao carregar dados das compras.");
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let filtradas = compras;

    // Filtro por pesquisa
    if (pesquisa) {
      filtradas = filtradas.filter((compra) => {
        const funcionario = funcionarios.find(
          (f) => f.id === compra.funcionarioId
        );
        if (tipoPesquisa === "id") {
          return compra.id.toString().includes(pesquisa);
        }
        if (tipoPesquisa === "funcionario") {
          return (
            funcionario &&
            funcionario.nome.toLowerCase().includes(pesquisa.toLowerCase())
          );
        }
        if (tipoPesquisa === "descricao") {
          return (
            compra.descricao &&
            compra.descricao.toLowerCase().includes(pesquisa.toLowerCase())
          );
        }
        if (tipoPesquisa === "dataCompra") {
          return (
            compra.dataCompra &&
            new Date(compra.dataCompra)
              .toLocaleDateString("pt-BR")
              .includes(pesquisa)
          );
        }
        return (
          compra.id.toString().includes(pesquisa) ||
          (funcionario &&
            funcionario.nome.toLowerCase().includes(pesquisa.toLowerCase())) ||
          (compra.descricao &&
            compra.descricao.toLowerCase().includes(pesquisa.toLowerCase()))
        );
      });
    }

    // Filtro por datas
    if (dataInicio && dataFim) {
      const dataIni = new Date(dataInicio + "T00:00:00");
      const dataFinal = new Date(dataFim + "T23:59:59");

      filtradas = filtradas.filter((compra) => {
        if (!compra.dataCompra) return false;
        const dataCompra = new Date(compra.dataCompra);
        return dataCompra >= dataIni && dataCompra <= dataFinal;
      });
    }

    // Ordena da compra mais recente para a mais antiga
    filtradas = filtradas.slice().sort(
      (a, b) => new Date(b.dataCompra) - new Date(a.dataCompra)
    );

    setComprasFiltradas(filtradas);
  }, [pesquisa, tipoPesquisa, compras, funcionarios, dataInicio, dataFim]);

  function handleClickPesquisa() {
    setInputVisivel(!inputVisivel);
    setbtnVisivel(!btnVisivel);
    setPesquisa("");
    setTimeout(() => {
      const input = document.querySelector(".inputPesquisar");
      if (input) input.focus();
    }, 0);
  }

  const handleRowClick = (id) => {
    setCompraSelecionada(id);
  };

  const handleDetalhar = () => {
    if (!compraSelecionada) {
      alert("Selecione uma compra para visualizar os detalhes.");
      return;
    }
    navigate(`/Compra/DetalhesCompra/${compraSelecionada}`);
  };

  const handleEditar = () => {
    if (!compraSelecionada) {
      alert("Selecione uma compra para editar.");
      return;
    }
    navigate(`/Compra/EditarCompra/${compraSelecionada}`);
  };

  const handleDelete = async () => {
    if (!compraSelecionada) {
      alert("Selecione uma compra para deletar.");
      return;
    }
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar esta compra?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCompra}/${compraSelecionada}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar a compra");
      }

      alert("Compra deletada!");

      setCompras((prev) => prev.filter((c) => c.id !== compraSelecionada));
      setComprasFiltradas((prev) =>
        prev.filter((c) => c.id !== compraSelecionada)
      );
      setCompraSelecionada(null);
    } catch (error) {
      alert("Erro ao deletar a compra");
    }
  };

  return (
    <div className="centroListagemCompra">
      <div className="top-nav">
        <div className="top-nav-buttons">
          {btnVisivel && (
            <button
              type="button"
              className="top-nav-button lupa"
              onClick={handleClickPesquisa}
            >
              <img src={lupa} className="top-nav-img" alt="Lupa" />
            </button>
          )}

          <select
            className="inputTipoPesquisa"
            style={{ display: inputVisivel ? "inline-block" : "none", marginRight: 8 }}
            value={tipoPesquisa}
            onChange={(e) => setTipoPesquisa(e.target.value)}
          >
            <option value="id">Id</option>
            <option value="funcionario">Funcionário</option>
            <option value="descricao">Descrição</option>
            <option value="dataCompra">Data Compra</option>
          </select>

          <input
            type="text"
            className={`inputPesquisar ${inputVisivel ? "visivel" : ""}`}
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

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
            <img src={olhoFechado} className="top-nav-img" alt="OlhoFechado" />
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

      <div className="ListagemCompra">
        <h1>Relatório de Compras</h1>
        <div className="DatasCompra">
          <div style={{ display: "flex", gap: 16, margin: "16px 0" }}>
            <div>
              <label className="labelDataPesquisar">Data Inicial: </label>
              <input
                type="date"
                className="inputDataPesquisar"
                value={dataInicio}
                max={dataFim || undefined}
                onChange={e => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="labelDataPesquisar">Data Final: </label>
              <input
                type="date"
                className="inputDataPesquisar"
                value={dataFim}
                min={dataInicio || undefined}
                onChange={e => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="scrollCompra">
          <table className="tableCompra">
            <thead>
              <tr>
                <th>Id</th>
                <th>Funcionário</th>
                <th>Descrição</th>
                <th>Qtd Produtos</th>
                <th>Valor Total</th>
                <th>Data Compra</th>
              </tr>
            </thead>
            <tbody>
              {comprasFiltradas.map((compra) => (
                <tr
                  key={compra.id}
                  onClick={() => handleRowClick(compra.id)}
                  style={{
                    backgroundColor:
                      compraSelecionada === compra.id ? "blue" : "transparent",
                    color: compraSelecionada === compra.id ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  <td>{compra.id}</td>
                  <td>
                    {funcionarios.find((f) => f.id === compra.funcionarioId)
                      ?.nome || compra.funcionarioId}
                  </td>
                  <td>{compra.descricao}</td>
                  <td>{compra.quantidadeDeProduto}</td>
                  <td>
                    {compra.valorDaCompra?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    {compra.dataCompra
                      ? new Date(compra.dataCompra).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}