import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";
import lupa from "../../../assets/icons/lupa.svg";
import lixo from "../../../assets/icons/lixo.svg";
import edit from "../../../assets/icons/edit.svg";
import olho from "../../../assets/icons/olhoFechado.svg";

export function ListagemPagamento() {
  const navigate = useNavigate();
  const [pagamentos, setPagamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);

  // Novo: pesquisa
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [tipoPesquisa, setTipoPesquisa] = useState("id"); // NOVO
  const [dataInicio, setDataInicio] = useState(""); // NOVO
  const [dataFim, setDataFim] = useState(""); // NOVO

  useEffect(() => {
    fetch(linkPag).then(r => r.json()).then(setPagamentos);
    fetch(linkFun).then(r => r.json()).then(setFuncionarios);
    fetch(linkCli).then(r => r.json()).then(setClientes);
    fetch(linkVen).then(r => r.json()).then(setVendas);
  }, []);

  const getFuncionarioNome = (id) =>
    funcionarios.find(f => f.id === Number(id))?.nome || "";

  const getClienteNome = (id) =>
    clientes.find(c => c.id === Number(id))?.nome || "";

  const getVendaInfo = (id) => {
    const v = vendas.find(v => v.id === Number(id));
    if (!v) return "";
    return `ID: ${v.id} `;
  };

  const handleDetalhes = () => {
    if (!pagamentoSelecionado) {
      alert("Selecione um pagamento para ver detalhes.");
      return;
    }
    navigate(`/Pagamento/DetalhesPagamento/${pagamentoSelecionado}`);
  };

  const handleEditar = () => {
    if (!pagamentoSelecionado) {
      alert("Selecione um pagamento para editar.");
      return;
    }
    navigate(`/Pagamento/EditarPagamento/${pagamentoSelecionado}`);
  };

  const handleNovo = () => {
    navigate("/Pagamento/CadastroPagamento");
  };

  // Filtro igual ListagemVenda
  const pagamentosFiltrados = pagamentos
    .filter((p) => {
      const cliente = getClienteNome(p.clienteId ?? p.ClienteId);
      const funcionario = getFuncionarioNome(p.funcionarioId ?? p.FuncionarioId);
      if (pesquisa) {
        if (tipoPesquisa === "id") {
          return p.id.toString().includes(pesquisa);
        }
        if (tipoPesquisa === "funcionario") {
          return funcionario.toLowerCase().includes(pesquisa.toLowerCase());
        }
        if (tipoPesquisa === "cliente") {
          return cliente.toLowerCase().includes(pesquisa.toLowerCase());
        }
        if (tipoPesquisa === "formaPagamento") {
          return (
            (p.formaDePagamento ?? p.FormaDePagamento ?? "")
              .toLowerCase()
              .includes(pesquisa.toLowerCase())
          );
        }
        if (tipoPesquisa === "dataPagamento") {
          const data = p.dataPagamento ?? p.DataPagamento;
          return (
            data &&
            new Date(data).toLocaleDateString("pt-BR").includes(pesquisa)
          );
        }
        return (
          p.id.toString().includes(pesquisa) ||
          cliente.toLowerCase().includes(pesquisa.toLowerCase()) ||
          funcionario.toLowerCase().includes(pesquisa.toLowerCase())
        );
      }
      return true;
    })
    .filter((p) => {
      // Filtro por datas
      if (dataInicio && dataFim) {
        const dataIni = new Date(dataInicio);
        const dataFinal = new Date(dataFim);
        const dataPag = new Date(p.dataPagamento ?? p.DataPagamento);
        dataPag.setHours(0,0,0,0);
        dataIni.setHours(0,0,0,0);
        dataFinal.setHours(0,0,0,0);
        return dataPag >= dataIni && dataPag <= dataFinal;
      }
      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.dataPagamento ?? b.DataPagamento) - new Date(a.dataPagamento ?? a.DataPagamento));

  function handleClickPesquisa() {
    setInputVisivel(!inputVisivel);
    setbtnVisivel(!btnVisivel);
    setPesquisa("");
    setTimeout(() => {
      const input = document.querySelector(".inputPesquisar");
      if (input) input.focus();
    }, 0);
  }

  const handleDelete = async () => {
    if (!pagamentoSelecionado) {
      alert("Selecione um pagamento para deletar.");
      return;
    }
    const confirmDelete = window.confirm("Tem certeza que deseja deletar este pagamento?");
    if (!confirmDelete) return;

    try {
      // --- Remover do caixa se for dinheiro ---
      const pagamentoRes = await fetch(`${linkPag}/${pagamentoSelecionado}`);
      if (pagamentoRes.ok) {
        const pagamento = await pagamentoRes.json();
        const formaDinheiro =
          pagamento.formaDePagamento === "Dinheiro" ||
          (Array.isArray(pagamento.formaDePagamento) &&
            pagamento.formaDePagamento.includes("Dinheiro"));
        const valorPago =
          Number(pagamento.totalPago ?? pagamento.TotalPago ?? 0);

        if (formaDinheiro && valorPago > 0) {
          await fetch("http://localhost:7172/api/Caixa/saida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valor: valorPago,
              descricao: `Estorno pagamento deletado ID ${pagamento.id}`,
              tipo: "Saída",
            }),
          });
        }
      }
      // --- Fim do bloco de remoção do caixa ---

      // Agora sim, delete o pagamento
      const response = await fetch(`${linkPag}/${pagamentoSelecionado}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erro ao deletar o pagamento");
      alert("Pagamento deletado com sucesso!");
      setPagamentos((prev) => prev.filter((p) => p.id !== pagamentoSelecionado));
      setPagamentoSelecionado(null);
    } catch (error) {
      alert("Erro ao deletar o pagamento");
    }
  };

  return (
    <div className="centroListagemPagamento">
      <div className="top-nav-pagamento">
        <div className="top-nav-buttons">
          {/* Lupa: pesquisar */}
          {btnVisivel && (
            <button
              type="button"
              className="top-nav-button lupa"
              onClick={handleClickPesquisa}
            >
              <img src={lupa} className="top-nav-img" alt="Pesquisar" />
            </button>
          )}

          {/* SELECT DE TIPO DE PESQUISA */}
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
            <option value="dataPagamento">Data Pagamento</option>
          </select>

          <input
            type="text"
            className={`inputPesquisar ${inputVisivel ? "visivel" : ""}`}
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

          {/* Olho: detalhes */}
          <button
            type="button"
            className="top-nav-button olhoFechado"
            onClick={handleDetalhes}
          >
            <img src={olho} className="top-nav-img" alt="Detalhes" />
          </button>

          {/* Lixo: deletar */}
          <button
            type="button"
            className="top-nav-button lixo"
            onClick={handleDelete}
          >
            <img src={lixo} className="top-nav-img" alt="Lixo" />
          </button>

          {/* Editar */}
          <button
            type="button"
            className="top-nav-button editar"
            onClick={handleEditar}
          >
            <img src={edit} className="top-nav-img" alt="Editar" />
          </button>
        </div>
      </div>

      {/* CAMPOS DE DATA */}
   
      <div className="ListagemPagamento">
        <h1 className="tituloListagemPagamento">Relatorio de Pagamentos</h1>
           <div className="filtrosPagamento">
    
        <label >Data Inicial:</label>
        <input
          type="date"
          value={dataInicio}
          max={dataFim || undefined}
          onChange={e => setDataInicio(e.target.value)}
        />
        <label >Data Final:</label>
        <input
          type="date"
          value={dataFim}
          min={dataInicio || undefined}
          onChange={e => setDataFim(e.target.value)}
        />
      </div>

        <div className="scrollPagamento">
          <table className="tablePagamento">
            <thead>
              <tr>
                <th>ID</th>
                <th>Funcionário</th>
                <th>Cliente</th>
                <th>Venda</th>
                <th>Forma de Pagamento</th>
                <th>Total Pago</th>
                <th>Total de Vezes</th>
                <th>Data Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {pagamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              ) : (
                pagamentosFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setPagamentoSelecionado(p.id)}
                    className={
                      pagamentoSelecionado === p.id
                        ? "linhaSelecionadaPagamento"
                        : ""
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td>{p.id}</td>
                    <td>{getFuncionarioNome(p.funcionarioId ?? p.FuncionarioId)}</td>
                    <td>
                      {p.clienteId === 0 ||
                      p.clienteId === "0" ||
                      p.clienteId === null
                        ? "Anônimo"
                        : clientes.find((c) => c.id === p.clienteId)?.nome ||
                          p.clienteId}
                    </td>
                    <td>{getVendaInfo(p.vendaId ?? p.VendaId)}</td>
                    <td>{p.formaDePagamento ?? p.FormaDePagamento}</td>
                    <td>R$ {Number(p.totalPago ?? p.TotalPago).toFixed(2)}</td>
                    <td>{p.toTalDeVezes ?? p.ToTalDeVezes}</td>
                    <td>
                      {(() => {
                        const data = p.dataPagamento ?? p.DataPagamento;
                        if (!data) return "";
                        const d = new Date(data);
                        return d.toLocaleDateString("pt-BR");
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}