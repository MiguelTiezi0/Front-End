import React, { useState, useEffect } from "react";
import "./Venda.css";
import lupa from "../../assets/icons/lupa.svg";
import lixo from "../../assets/icons/lixo.svg";
import olhoFechado from "../../assets/icons/olhoFechado.svg";
import clonar from "../../assets/icons/clonar.svg";
import edit from "../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";
import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVenItens } from "./linkVenItens";

export function ListagemVenda() {
  document.title = "Listagem de Vendas";
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [vendasFiltradas, setVendasFiltradas] = useState([]);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [linkVenItens, setlinkVenItens] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resVendas, resFuncs, resClientes, resItens] = await Promise.all([
          fetch(linkVen),
          fetch(linkFun),
          fetch(linkCli),
          fetch(linkVenItens),
        ]);
        const vendasData = await resVendas.json();
        const funcsData = await resFuncs.json();
        const clientesData = await resClientes.json();
        const itensData = await resItens.json();

        setVendas(vendasData);
        setVendasFiltradas(vendasData);
        setFuncionarios(funcsData);
        setClientes(clientesData);
        setlinkVenItens(itensData);
      } catch (error) {
        alert("Erro ao carregar dados das vendas.");
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const filtradas = vendas.filter((venda) => {
      const cliente = clientes.find((c) => c.id === venda.clienteId);
      const funcionario = funcionarios.find((f) => f.id === venda.funcionarioId);
      return (
        venda.id.toString().includes(pesquisa) ||
        (cliente && cliente.nome.toLowerCase().includes(pesquisa.toLowerCase())) ||
        (funcionario && funcionario.nome.toLowerCase().includes(pesquisa.toLowerCase()))
      );
    });
    setVendasFiltradas(filtradas);
  }, [pesquisa, vendas, clientes, funcionarios]);

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
    setVendaSelecionada(id);
  };

  const handleDetalhar = () => {
    if (!vendaSelecionada) {
      alert("Selecione uma venda para visualizar os detalhes.");
      return;
    }
    navigate(`/Venda/DetalhesVenda/${vendaSelecionada}`);
  };

  const handleEditar = () => {
    if (!vendaSelecionada) {
      alert("Selecione uma venda para editar.");
      return;
    }
    navigate(`/Venda/EditarVenda/${vendaSelecionada}`);
  };

  const handleClonar = () => {
    if (!vendaSelecionada) {
      alert("Selecione uma venda para clonar.");
      return;
    }
    const venda = vendas.find((v) => v.id === vendaSelecionada);
    if (venda) {
      navigate("/Venda/CadastroVenda", { state: { venda } });
    }
  };

  const handleDelete = async () => {
    if (!vendaSelecionada) {
      alert("Selecione uma venda para deletar.");
      return;
    }
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar esta venda?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkVen}/${vendaSelecionada}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar a venda");
      }

      alert("Venda deletada com sucesso!");

      setVendas((prev) => prev.filter((v) => v.id !== vendaSelecionada));
      setVendasFiltradas((prev) =>
        prev.filter((v) => v.id !== vendaSelecionada)
      );
      setVendaSelecionada(null);
    } catch (error) {
      alert("Erro ao deletar a venda");
    }
  };

  return (
    <div className="centroListagemVenda">
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

          <button
            type="button"
            className="top-nav-button clonar"
            onClick={handleClonar}
          >
            <img src={clonar} className="top-nav-img" alt="Clonar" />
          </button>
        </div>
      </div>
      <div className="ListagemVenda">
        <h1>Listagem de Vendas</h1>
        <div className="scrollVenda">
          <table className="tableVenda">
            <thead>
              <tr>
                <th>Id</th>
                <th>Funcionário</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Valor Total</th>
                <th>Forma Pagamento</th>
                <th>Data Venda</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map((venda) => (
                <tr
                  key={venda.id}
                  onClick={() => handleRowClick(venda.id)}
                  style={{
                    backgroundColor:
                      vendaSelecionada === venda.id ? "blue" : "transparent",
                    color:
                      vendaSelecionada === venda.id ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  <td>{venda.id}</td>
                  <td>
                    {funcionarios.find((f) => f.id === venda.funcionarioId)?.nome || venda.funcionarioId}
                  </td>
                  <td>
                    {clientes.find((c) => c.id === venda.clienteId)?.nome || venda.clienteId}
                  </td>
                  <td>
                    {venda.totalDeItens}
                  </td>
                  <td>
                    {venda.valorTotal?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td>
                    {Array.isArray(venda.formaDePagamento)
                      ? venda.formaDePagamento.join(", ")
                      : venda.formaDePagamento}
                  </td>
                  <td>
                    {venda.dataVenda
                      ? new Date(venda.dataVenda).toLocaleString("pt-BR")
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