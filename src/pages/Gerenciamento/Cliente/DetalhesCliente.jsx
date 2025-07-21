import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../../assets/icons/lixo.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";
import edit from "../../../assets/icons/edit.svg";
import "./Cliente.css";
import { linkCli } from "./linkCli";
import { linkVen } from "../../Caixa/Venda/linkVen";


export function DetalhesCliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [vendas, setVendas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClienteDetalhes = async () => {
      try {
        const response = await fetch(`${linkCli}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do cliente");
        }

        const data = await response.json();
        setCliente(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os detalhes do cliente");
      }
    };

    const fetchVendasCliente = async () => {
      try {
        const response = await fetch(linkVen, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Erro ao buscar vendas do cliente");

        const data = await response.json();
        const vendasDoCliente = data.filter(
          (v) => Number(v.clienteId ?? v.ClienteId) === Number(id)
        );
        setVendas(vendasDoCliente);

        // Calcule os totais e atualize o cliente no backend
        const totalGasto = vendasDoCliente.reduce(
          (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
          0
        );
        const totalPago = vendasDoCliente.reduce(
          (acc, v) => acc + Number(v.totalPago ?? v.TotalPago ?? 0),
          0
        );
        const totalDevido = vendasDoCliente.reduce(
          (acc, v) =>
            acc +
            (Number(v.valorTotal ?? v.ValorTotal ?? 0) -
              Number(v.totalPago ?? v.TotalPago ?? 0)),
          0
        );

        // Atualize o cliente no backend com os novos totais
        if (cliente) { // Só faz o PUT se cliente já foi carregado
          await fetch(`${linkCli}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: cliente.id,
              nome: cliente.nome,
              cpf: cliente.cpf,
              endereço: cliente.endereço,
              número: cliente.número,
              telefone: cliente.telefone,
              bairro: cliente.bairro,
              dataNascimento: cliente.dataNascimento,
              limiteDeCrédito: cliente.limiteDeCrédito,
              totalGasto: totalGasto,
              totalPago: totalPago,
              totalDevido: totalDevido,
            }),
          });
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as vendas do cliente");
      }
    };

    fetchClienteDetalhes();
    fetchVendasCliente();
  }, [id]);

  if (!cliente) {
    return <p>Carregando detalhes do cliente...</p>;
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const handleVoltar = () => {
    navigate("/Cliente/ListagemCliente");
  };

  const handleEditar = () => {
    navigate(`/Cliente/EditarCliente/${id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este cliente?"
    );
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

  // Calcule os totais dinamicamente SEM useState:
  const totalGasto = vendas.reduce(
    (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
    0
  );
  const totalPago = vendas.reduce(
    (acc, v) => acc + Number(v.totalPago ?? v.TotalPago ?? 0),
    0
  );
  const totalDevido = vendas.reduce(
    (acc, v) => acc + (Number(v.valorTotal ?? v.ValorTotal ?? 0) - Number(v.totalPago ?? v.TotalPago ?? 0)),
    0
  );

  function getRowColor(venda) {
    const total = Number(venda.valorTotal ?? venda.ValorTotal ?? 0);
    const pago = Number(venda.totalPago ?? venda.TotalPago ?? 0);

    if (pago === total && total > 0) return "#ccffcc"; // Verde: totalmente paga
    if (pago < total && pago > 0) return "#fff7b2"; // Amarelo: parcialmente paga
    if (pago < total && pago === 0) return "#ffcccc"; // Vermelho: não paga

    return ""; // Sem cor se não se encaixar em nenhum caso
  }
console.table(cliente)
  return (
    <div className="centroDetalhesCliente">
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
            onClick={() => navigate(`/Cliente/DetalhesCliente/${id}`)}
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
      <div className="contentDetalhesCliente">
        <div className="DetalhesCliente">
          <h1>Detalhes do Cliente: {cliente.nome}</h1>

          <div className="divDetalhesCliente">
            <input
              type="text"
              disabled
              placeholder="ID"
              className="inputDetalhesCliente inputIdDetalhesCliente"
              value={`ID: ${cliente.id}`}
            />
            <input
              type="text"
              disabled
              placeholder="Nome"
              className="inputDetalhesCliente"
              value={`Nome: ${cliente.nome}`}
            />
            <input
              type="text"
              disabled
              placeholder="CPF"
              className="inputDetalhesCliente"
              value={`CPF: ${cliente.cpf}`}
            />
            <input
              type="text"
              disabled
              placeholder="Endereço"
              className="inputDetalhesCliente"
              value={`Endereço: ${cliente.endereço}`}
            />
            <input
              type="text"
              disabled
              placeholder="Número"
              className="inputDetalhesCliente"
              value={`Número: ${cliente.número}`}
            />
            <input
              type="text"
              disabled
              placeholder="Telefone"
              className="inputDetalhesCliente"
              value={`Telefone: ${cliente.telefone}`}
            />
            <input
              type="text"
              disabled
              placeholder="Bairro"
              className="inputDetalhesCliente"
              value={`Bairro: ${cliente.bairro}`}
            />
            <input
              type="text"
              disabled
              placeholder="Data de Nascimento"
              className="inputDetalhesCliente"
              value={`Data de Nascimento: ${formatarData(
                cliente.dataNascimento
              )}`}
            />
            <input
              type="text"
              disabled
              placeholder="Limite de Crédito"
              className="inputDetalhesCliente"
              value={`Limite de Crédito: ${
                typeof cliente.limiteDeCrédito === "number"
                  ? cliente.limiteDeCrédito.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }`}
            />
          </div>
          <div className="buttonsGroupDetalhesCliente">
            <button
              type="button"
              className="btnDetalhesCliente btnVoltarCliente"
              onClick={handleVoltar}
            >
              <Link to="/Cliente/ListagemCliente" className="linkCadastro">
                Voltar
              </Link>
            </button>
            <button
              type="button"
              className="btnDetalhesCliente btnEditarCliente"
              onClick={handleEditar}
            >
              <Link
                to={`/Cliente/EditarCliente/${cliente.id}`}
                className="linkCadastro"
              >
                Editar
              </Link>
            </button>
          </div>
        </div>
        <div className="VendasCliente">
          <h2>Compras do Cliente</h2>
          <table className="detalhesClienteTabela tabelaScroll">
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
                  <td colSpan={3} style={{ textAlign: "center" }}>
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                <>
                  {vendas
                    .slice() // faz uma cópia para não alterar o original
                    .sort(
                      (a, b) =>
                        new Date(b.dataVenda ?? b.DataVenda) -
                        new Date(a.dataVenda ?? a.DataVenda)
                    )
                    .map((v) => (
                      <tr key={v.id} style={{ background: getRowColor(v) }}>
                        <td>{v.id}</td>
                        <td>
                          R$ {Number(v.valorTotal ?? v.ValorTotal).toFixed(2)}
                        </td>
                        <td>
                          {(() => {
                            const data = v.dataVenda ?? v.DataVenda;
                            if (!data) return "";
                            const d = new Date(data);
                            return d.toLocaleDateString("pt-BR");
                          })()}
                        </td>
                        <td>
                          <button className="btnDetalharVendaCliente">
                            <Link
                              to={`/Venda/DetalhesVenda/${v.id}`}
                              className="btnDetalharVendaClienteLink"
                            >
                              Detalhar venda
                            </Link>
                          </button>
                        </td>
                      </tr>
                    ))}
                </>
              )}
            </tbody>
            <td></td>
            <tfoot style={{position: "relative"}} className="detalhesClienteTotal">
              <tr>
                <th>Total Gasto</th>
                <th>Total Pago</th>
                <th>Total Devido</th>
                <th>Pagar</th>
              </tr>
              <tr>
                <td>
                  Total Gasto:{" "}
                  <strong>
                    R$ {totalGasto.toFixed(2)}
                  </strong>
                </td>
                <td>
                  Total Pago:{" "}
                  <strong>
                    R$ {totalPago.toFixed(2)}
                  </strong>
                </td>
                <td>
                  Total Devido:{" "}
                  <strong>
                    R$ {totalDevido.toFixed(2)}
                  </strong>
                </td>
                <td>
                  <button className="PagarDetalhesCliente">
                    <Link className="PagarDetalhesClienteLink">Pagar</Link>
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
