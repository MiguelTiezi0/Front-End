import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Venda.css";
import { linkVen } from "./linkVen";
import { linkFun } from "../Funcionario/linkFun";
import { linkCli } from "../Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../Produto/linkPro";

export function EditarVenda() {
  document.title = "Editar Venda";
  const { id } = useParams();
  const navigate = useNavigate();
  const [venda, setVenda] = useState({
    funcionarioId: "",
    clienteId: "",
    totalDeItens: 0,
    valorTotal: 0,
    formaDePagamento: [],
    dataVenda: "",
  });
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [novoItem, setNovoItem] = useState({
    produtoId: "",
    valorDoItem: "",
    quantidade: 1,
  });

  const [itensCancelados, setItensCancelados] = useState([]);


  useEffect(() => {
    fetch(`${linkVen}/${id}`)
      .then(r => r.json())
      .then(data => {
        setVenda({
          funcionarioId: data.funcionarioId,
          clienteId: data.clienteId,
          totalDeItens: data.totalDeItens,
          valorTotal: data.valorTotal,
          formaDePagamento: data.formaDePagamento || [],
          dataVenda: data.dataVenda ? data.dataVenda.slice(0, 16) : "",
        });
      });
    fetch(linkFun).then(r => r.json()).then(setFuncionarios);
    fetch(linkCli).then(r => r.json()).then(setClientes);
    fetch(linkVenItens)
      .then(r => r.json())
      .then(data => setItens(data.filter(i => Number(i.vendaId ?? i.VendaId) === Number(id))));
    fetch(linkPro).then(r => r.json()).then(setProdutos);
  }, [id]);

  useEffect(() => {
    setVenda(v => ({
      ...v,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
      valorTotal: itens.reduce((acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade), 0),
    }));
  }, [itens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenda((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormaPagamentoChange = (e) => {
    setVenda((prev) => ({
      ...prev,
      formaDePagamento: Array.from(e.target.selectedOptions, o => o.value),
    }));
  };

 const handleCancelarItem = (itemId) => {
  const item = itens.find(i => i.id === itemId);
  if (!item) return;

  // Marcar item como cancelado temporariamente
  setItensCancelados(prev => [
    ...prev,
    { ...item, quantidade: item.quantidade > 1 ? item.quantidade - 1 : 0 }
  ]);

  // Atualizar lista de itens visivelmente
  setItens(itens.map(i =>
    i.id === itemId
      ? { ...i, quantidade: i.quantidade > 1 ? i.quantidade - 1 : 0 }
      : i
  ));
};
const handleSubmit = async (e) => {
  e.preventDefault();

  // Atualizar os itens no servidor
  for (const item of itensCancelados) {
    if (item.quantidade === 0) {
      await fetch(`${linkVenItens}/${item.id}`, { method: "DELETE" });
    } else {
      await fetch(`${linkVenItens}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
  }

  // Enviar os dados da venda
  const vendaBody = {
    Id: Number(id),
    FuncionarioId: Number(venda.funcionarioId),
    ClienteId: Number(venda.clienteId),
    TotalDeItens: Number(venda.totalDeItens),
    ValorTotal: Number(venda.valorTotal),
    FormaDePagamento: venda.formaDePagamento,
    DataVenda: new Date(venda.dataVenda).toISOString(),
  };
  const response = await fetch(`${linkVen}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vendaBody),
  });

  if (!response.ok) {
    alert("Erro ao atualizar a venda");
    return;
  }

  navigate("/Venda/ListagemVenda");
};




  const handleNovoItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem(i => ({
      ...i,
      [name]: name === "quantidade" ? Number(value) : value,
      valorDoItem:
        name === "produtoId"
          ? produtos.find(p => p.id === Number(value))?.preçoVenda || ""
          : i.valorDoItem,
    }));
  };

  const handleAdicionarItem = async () => {
    if (!novoItem.produtoId || !novoItem.valorDoItem || !novoItem.quantidade) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }
    const res = await fetch(linkVenItens, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        VendaId: Number(id),
        ProdutoId: Number(novoItem.produtoId),
        ValorDoItem: Number(novoItem.valorDoItem),
        quantidade: Number(novoItem.quantidade),
      }),
    });
    if (res.ok) {
      const itemSalvo = await res.json();
      setItens([...itens, itemSalvo]);
      setNovoItem({ produtoId: "", valorDoItem: "", quantidade: 1 });
    } else {
      alert("Erro ao adicionar item!");
    }
  };

  const formasPagamento = [
    "Dinheiro",
    "Cartão",
    "Pix",
    "Crediário",
    "Consignação",
  ];

  return (
    <div className="editarVendaCentro">
          <h1 className="editarVendaTitulo">Editar Venda</h1>
      <div className="editarVendaGrid">
        <form className="editarVendaForm" onSubmit={handleSubmit}>
          <div className="editarVendaDividirInput">
            <input
              type="text"
              name="id"
              readOnly
              value={id}
              className="editarVendaInput"
            />
          </div>
          <div className="editarVendaDividirInput">
            <input
              type="datetime-local"
              name="dataVenda"
              required
              className="editarVendaInput"
              value={venda.dataVenda}
              onChange={handleChange}
            />
          </div>
      
          <div className="editarVendaDividirInput">
            <select
              name="clienteId"
              className="editarVendaInput"
              required
              value={venda.clienteId}
              onChange={handleChange}
            >
              <option value="">Cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
              <div className="editarVendaDividirInput">
        
            <input
              className="editarVendaInput"
              type="text"
              placeholder="CPF do Cliente
"
              value={clientes.find(c => c.id === Number(venda.clienteId))?.cpf || ""}
              disabled
            />
            </div>
              <div className="editarVendaDividirInput">
            <select
              name="funcionarioId"
              className="editarVendaInput"
              required
              value={venda.funcionarioId}
              onChange={handleChange}
            >
              <option value="">Funcionário</option>
              {funcionarios.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
  
       <div className="editarVendaDividirInput">
         
            <select
              className="editarVendaInput"
              required
              value={venda.formaDePagamento}
              placeholder="Forma de pagamento"
              onChange={e =>
                setVenda(v => ({
                  ...v,
                  formaDePagamento: Array.from(e.target.selectedOptions, o => o.value),
                }))
              }
            >
                <option value="">Forma de pagamento</option>
            
              {formasPagamento.map(fp => (
                <option key={fp} value={fp}>{fp}</option>
              ))}
            </select>
            </div>
   
            <div className="editarVendaDividirInput">
              <select
                name="produtoId"
                className="editarVendaInput"
                value={novoItem.produtoId}
                onChange={handleNovoItemChange}
              >
                <option value="">Produto</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.descricao} (Estoque: {p.quantidade})
                  </option>
                ))}
              </select>
      
            </div>
            <div className="editarVendaDividirInput">
       
              <input
                name="quantidade"
                type="number"
                min={1}
                value={novoItem.quantidade}
                onChange={handleNovoItemChange}
                placeholder="Qtd"
                className="editarVendaInput"              />
    
          
            </div>
            <div className="editarVendaDividirInput">
         
              <button type="button" className="editarVendaAdicionarItem" onClick={handleAdicionarItem}>
                Adicionar Item
              </button>
            </div>
          <div className="editarVendaBtnDiv">
            <Link to="/Venda/ListagemVenda" >
              <button type="button" className="editarVendaBtn editarVendaBtnVoltar">
                Voltar
              </button>
            </Link>
            <button type="submit" className="editarVendaBtn editarVendaBtnSalvar">
              Salvar
            </button>
          </div>
        </form>
        {/* Direita: Itens da venda */}
        <div className="editarVendaTabelaWrapper">
        <h3 className="editarVendaItensCompradoTitulo">Itens comprados</h3>
            <table className="editarVendaTabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Valor uni</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>Nenhum item</td>
                  </tr>
                ) : (
                  itens.map(item => {
                    const produto = produtos.find(p => p.id === Number(item.produtoId ?? item.ProdutoId));
                    return (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{produto ? produto.descricao : (item.produtoId ?? item.ProdutoId)}</td>
                        <td>{item.quantidade}</td>
                        <td>R$ {Number(item.valorDoItem ?? item.ValorDoItem).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="editarVendaBtnCancelarItem"
                            disabled={item.quantidade < 1}
                            onClick={() => handleCancelarItem(item.id)}
                          >
                            Cancelar 1
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="editarVendaValorTotalTabela">
              Valor total: <strong>R$ {venda.valorTotal.toFixed(2)}</strong>
            </div>

        </div>
      </div>
    </div>
  );
}