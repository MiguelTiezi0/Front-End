import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";
import lupa from "../../assets/icons/lupa.svg";
import lixo from "../../assets/icons/lixo.svg";
import edit from "../../assets/icons/edit.svg";
import olho from "../../assets/icons/olhoFechado.svg";

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

  // Novo: filtro de pesquisa
  const pagamentosFiltrados = pagamentos.filter((p) => {
    const cliente = getClienteNome(p.clienteId ?? p.ClienteId);
    const funcionario = getFuncionarioNome(p.funcionarioId ?? p.FuncionarioId);
    return (
      p.id.toString().includes(pesquisa) ||
      cliente.toLowerCase().includes(pesquisa.toLowerCase()) ||
      funcionario.toLowerCase().includes(pesquisa.toLowerCase())
    );
  });

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
      <div className="ListagemPagamento">
        <h1 className="tituloListagemPagamento">Listagem de Pagamentos</h1>
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
                    <td>{getClienteNome(p.clienteId ?? p.ClienteId)}</td>
                    <td>{getVendaInfo(p.vendaId ?? p.VendaId)}</td>
                    <td>{p.formaDePagamento ?? p.FormaDePagamento}</td>
                    <td>R$ {Number(p.totalPago ?? p.TotalPago).toFixed(2)}</td>
                    <td>{p.toTalDeVezes ?? p.ToTalDeVezes}</td>
                    <td>{(p.dataPagamento ?? p.DataPagamento)?.slice(0, 10)}</td>
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