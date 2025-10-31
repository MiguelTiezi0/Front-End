import React, { useState, useEffect, useMemo } from "react";
import "./Produto.css";
import lupa from "../../../assets/icons/lupa.svg";
import lixo from "../../../assets/icons/lixo.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";
import clonar from "../../../assets/icons/clonar.svg";
import edit from "../../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";
import { linkFor } from "../Fornecedor/linkFor";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function ListagemProduto() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Produtos";
  const navigate = useNavigate();
  const alerta = useAlerta();

  // Estados
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]); // Novo estado
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [tipoPesquisa, setTipoPesquisa] = useState("descricao");

  // Fetch inicial de dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produtosRes, categoriasRes, fornecedoresRes] = await Promise.all(
          [fetch(linkPro), fetch(linkCat), fetch(linkFor)]
        );

        if (!produtosRes.ok) throw new Error("Erro ao buscar produtos");
        if (!categoriasRes.ok) throw new Error("Erro ao buscar categorias");
        if (!fornecedoresRes.ok) throw new Error("Erro ao buscar fornecedores");

        const [produtosData, categoriasData, fornecedoresData] =
          await Promise.all([
            produtosRes.json(),
            categoriasRes.json(),
            fornecedoresRes.json(),
          ]);

        setProdutos(produtosData);
        setCategorias(categoriasData);
        setFornecedores(fornecedoresData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alerta(error.message, "error");
      }
    };

    fetchData();
  }, [alerta]);

  // Filtragem de produtos usando useMemo
  const produtosFiltrados = useMemo(() => {
    const filtro = pesquisa.toLowerCase().trim();
    if (!filtro) return produtos;

    return produtos.filter((produto) => {
      switch (tipoPesquisa) {
        case "id":
          return String(produto.id).includes(filtro);

        case "descricao":
          return produto.descricao?.toLowerCase().includes(filtro);

        case "categoria": {
          const categoria = categorias.find(
            (cat) => cat.id === produto.categoriaId
          );
          return categoria?.descricao?.toLowerCase().includes(filtro);
        }

        case "tamanho":
          return String(produto.tamanho || "")
            .toLowerCase()
            .includes(filtro);

        case "fornecedor": {
          const fornecedor = fornecedores.find(
            (f) => f.id === produto.idFornecedor
          );
          // Busca tanto por ID quanto por nome do fornecedor, convertendo CNPJ para string
          return (
            String(produto.idFornecedor).includes(filtro) ||
            fornecedor?.nome?.toLowerCase().includes(filtro) ||
            String(fornecedor?.cnpj || "")
              .toLowerCase()
              .includes(filtro)
          );
        }

        case "preco":
          return String(produto.preçoVenda || "").includes(filtro);

        default:
          return true;
      }
    });
  }, [pesquisa, produtos, tipoPesquisa, categorias, fornecedores]);

  // Handlers
  const handleClickPesquisa = () => {
    setInputVisivel((prev) => !prev);
    setbtnVisivel((prev) => !prev);
    setPesquisa("");
    setTimeout(() => document.querySelector(".inputPesquisar")?.focus(), 0);
  };

  const handleRowClick = (id) => setProdutoSelecionado(id);

  const handleDelete = async () => {
    if (!produtoSelecionado) {
      alerta("Selecione um produto para deletar.", "warning");
      return;
    }

    if (!window.confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      const response = await fetch(`${linkPro}/${produtoSelecionado}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Erro ao deletar o produto");

      setProdutos((prev) => prev.filter((p) => p.id !== produtoSelecionado));
      setProdutoSelecionado(null);
      alerta("Produto deletado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      alerta("Erro ao deletar o produto", "error");
    }
  };

  const handleDetalhar = () => {
    if (!produtoSelecionado) {
      alerta("Selecione um produto para visualizar os detalhes.", "warning");
      return;
    }
    navigate(`/Produto/DetalhesProduto/${produtoSelecionado}`);
  };

  const handleEditar = () => {
    if (!produtoSelecionado) {
      alerta("Selecione um produto para editar.", "warning");
      return;
    }
    navigate(`/Produto/EditarProduto/${produtoSelecionado}`);
  };

  const handleClonar = () => {
    if (!produtoSelecionado) {
      alerta("Selecione um produto para clonar.", "warning");
      return;
    }
    const produto = produtos.find((p) => p.id === produtoSelecionado);
    if (produto) {
      navigate("/Produto/CadastroProduto", { state: { produto } });
    }
  };

  // Renderização da tabela
  const renderProdutoRow = (produto) => {
    const fornecedor = fornecedores.find((f) => f.id === produto.idFornecedor);
    const isSelected = produtoSelecionado === produto.id;
    const isOutOfStock = produto.quantidade <= 0;

    return (
      <tr

      
      
      key={produto.id}
      className={`
        ${produto.quantidade <= 0 ? "sem-estoque" : ""}
          ${produtoSelecionado === produto.id ? "selecionado" : ""}
        `}
        onClick={() => setProdutoSelecionado(produto.id)}
      >
        <td>{produto.id}</td>
        <td>{produto.descricao}</td>
        <td>{produto.quantidade}</td>
        <td>{produto.tamanho || "N/A"}</td>
        <td>{fornecedor ? fornecedor.nome : "N/A"}</td>
        <td>{produto.preçoVenda?.toFixed(2) || "N/A"}</td>
      </tr>
    );
  };

  return (
    <div className="centroListagemProduto">
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
            id="tipoPesquisa"
            style={{
              display: inputVisivel ? "inline-block" : "none",
              marginRight: 8,
            }}
            value={tipoPesquisa}
            onChange={(e) => setTipoPesquisa(e.target.value)}
          >
            <option value="id">Id</option>
            <option value="descricao">Descrição</option>
            <option value="categoria">Categoria</option>
            <option value="tamanho">Tamanho</option>
            <option value="fornecedor">Fornecedor</option>
            <option value="preco">Preço</option>
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

          <button
            type="button"
            className="top-nav-button clonar"
            onClick={handleClonar}
          >
            <img src={clonar} className="top-nav-img" alt="Clonar" />
          </button>
        </div>
      </div>
      <div className="ListagemProduto">
        <h1>Listagem de Produtos</h1>
        <div className="scrollProduto">
          <table className="tableProduto">
            <thead>
              <tr>
                <th>Id</th>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>Tamanho</th>
                <th>Fornecedor</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>{produtosFiltrados.map(renderProdutoRow)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
