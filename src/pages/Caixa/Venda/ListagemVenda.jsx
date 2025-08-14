import React, { useState, useEffect } from "react";
import "./Venda.css";
import lupa from "../../../assets/icons/lupa.svg";
import lixo from "../../../assets/icons/lixo.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";
import edit from "../../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";
import { linkVen } from "./linkVen";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";

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
  const [itensVenda, setItensVenda] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipoPesquisa, setTipoPesquisa] = useState("id");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resVendas, resFuncs, resClientes, resItens, resProdutos] = await Promise.all([
          fetch(linkVen),
          fetch(linkFun),
          fetch(linkCli),
          fetch(linkVenItens),
          fetch(linkPro),
        ]);
        const vendasData = await resVendas.json();
        const funcsData = await resFuncs.json();
        const clientesData = await resClientes.json();
        const itensData = await resItens.json();
        const produtosData = await resProdutos.json();

        setVendas(vendasData);
        setVendasFiltradas(vendasData);
        setFuncionarios(funcsData);
        setClientes(clientesData);
        setItensVenda(itensData);
        setProdutos(produtosData);
      } catch (error) {
        alert("Erro ao carregar dados das vendas.");
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let filtradas = vendas;

    // Filtro por pesquisa
    if (pesquisa) {
      filtradas = filtradas.filter((venda) => {
        const cliente = clientes.find((c) => c.id === venda.clienteId);
        const funcionario = funcionarios.find(
          (f) => f.id === venda.funcionarioId
        );
        if (tipoPesquisa === "id") {
          return venda.id.toString().includes(pesquisa);
        }
        if (tipoPesquisa === "funcionario") {
          return (
            funcionario &&
            funcionario.nome.toLowerCase().includes(pesquisa.toLowerCase())
          );
        }
        if (tipoPesquisa === "cliente") {
          return (
            cliente &&
            cliente.nome.toLowerCase().includes(pesquisa.toLowerCase())
          );
        }
        if (tipoPesquisa === "formaPagamento") {
          return (
            (Array.isArray(venda.formaDePagamento)
              ? venda.formaDePagamento.join(", ")
              : venda.formaDePagamento || ""
            )
              .toLowerCase()
              .includes(pesquisa.toLowerCase())
          );
        }
        if (tipoPesquisa === "dataVenda") {
          return (
            venda.dataVenda &&
            new Date(venda.dataVenda)
              .toLocaleDateString("pt-BR")
              .includes(pesquisa)
          );
        }
        return (
          venda.id.toString().includes(pesquisa) ||
          (cliente &&
            cliente.nome.toLowerCase().includes(pesquisa.toLowerCase())) ||
          (funcionario &&
            funcionario.nome.toLowerCase().includes(pesquisa.toLowerCase()))
        );
      });
    }

    // Filtro por datas
    if (dataInicio && dataFim) {
      const [diaIni, mesIni, anoIni] = dataInicio.split("-").reverse();
      const [diaFim, mesFim, anoFim] = dataFim.split("-").reverse();

      const dataIni = new Date(`${anoIni}-${mesIni}-${diaIni}T00:00:00`);
      const dataFinal = new Date(`${anoFim}-${mesFim}-${diaFim}T23:59:59`);

      filtradas = filtradas.filter((venda) => {
        if (!venda.dataVenda) return false;
        const [diaVenda, mesVenda, anoVenda] = venda.dataVenda
          .slice(0, 10)
          .split("-")
          .reverse();
        const dataVenda = new Date(`${anoVenda}-${mesVenda}-${diaVenda}T${venda.dataVenda.slice(11) || "00:00:00"}`);
        return dataVenda >= dataIni && dataVenda <= dataFinal;
      });
    }

    // Ordena da venda mais recente para a mais antiga
    filtradas = filtradas.slice().sort(
      (a, b) => new Date(b.dataVenda) - new Date(a.dataVenda)
    );

    setVendasFiltradas(filtradas);
  }, [pesquisa, tipoPesquisa, vendas, clientes, funcionarios, dataInicio, dataFim]);

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
      // --- Remover do caixa se for dinheiro ---
      const vendaRes = await fetch(`${linkVen}/${vendaSelecionada}`);
      if (vendaRes.ok) {
        const venda = await vendaRes.json();
        const formaDinheiro =
          venda.formaDePagamento === "Dinheiro" ||
          (Array.isArray(venda.formaDePagamento) &&
            venda.formaDePagamento.includes("Dinheiro"));
        const valorPago =
          Number(venda.totalPago ?? venda.TotalPago ?? 0);

        if (formaDinheiro && valorPago > 0) {
          await fetch("http://localhost:7172/api/Caixa/saida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valor: valorPago,
              descricao: `Estorno venda deletada ID ${venda.id}`,
              tipo: "Saída",
            }),
          });
        }
      }
      // --- Fim do bloco de remoção do caixa ---

      // Agora sim, delete a venda
      const response = await fetch(`${linkVen}/${vendaSelecionada}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar a venda");
      }

      alert("Venda deletada e itens devolvidos ao estoque!");

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

          <select
            className="inputTipoPesquisa"
            style={{ display: inputVisivel ? "inline-block" : "none", marginRight: 8 }}
            value={tipoPesquisa}
            onChange={(e) => setTipoPesquisa(e.target.value)}
          >
            <option value="id">Id</option>
            <option value="funcionario">Funcionário</option>
            <option value="cliente">Cliente</option>
            <option value="formaPagamento">Forma Pagamento</option>
            <option value="dataVenda">Data Venda</option>
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

      <div className="ListagemVenda">
        <h1>Relatorio de Vendas</h1>
        <div className="DatasVenda">
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
                <th>Total de Vezes</th>
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
                    color: vendaSelecionada === venda.id ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  <td>{venda.id}</td>
                  <td>
                    {funcionarios.find((f) => f.id === venda.funcionarioId)
                      ?.nome || venda.funcionarioId}
                  </td>
                  <td>
                    {venda.clienteId === 0 ||
                    venda.clienteId === "0" ||
                    venda.clienteId === null
                      ? "Anônimo"
                      : clientes.find((c) => c.id === venda.clienteId)?.nome ||
                        venda.clienteId}
                  </td>
                  <td>{venda.totalDeItens}</td>
                  <td>
                    {venda.valorTotal?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    {Array.isArray(venda.formaDePagamento)
                      ? venda.formaDePagamento.join(", ")
                      : venda.formaDePagamento}
                  </td>
                  <td>{venda.totalDeVezes || 1}x</td>
                  <td>
                    {venda.dataVenda
                      ? new Date(venda.dataVenda).toLocaleDateString("pt-BR")
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