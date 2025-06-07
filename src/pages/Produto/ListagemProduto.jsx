import React, { useState, useEffect } from "react";
import "./Produto.css";
import lupa from "../../assets/icons/lupa.svg";
import lixo from "../../assets/icons/lixo.svg";
import olhoFechado from "../../assets/icons/olhoFechado.svg";
import clonar from "../../assets/icons/clonar.svg";
import edit from "../../assets/icons/edit.svg";
import { useNavigate } from "react-router-dom";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";

export function ListagemProduto() {
  document.title = "Listagem de Produtos";
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch(linkPro, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar produtos");
        }

        const data = await response.json();
        setProdutos(data);
        setProdutosFiltrados(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os produtos");
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await fetch(linkCat, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar categorias");
        }

        const categoriasData = await response.json();
        setCategorias(categoriasData);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as categorias");
      }
    };

    fetchProdutos();
    fetchCategorias();
  }, []);

  useEffect(() => {
    const produtosFiltrados = produtos.filter((produto) =>
      produto.descricao.toLowerCase().includes(pesquisa.toLowerCase())
    );
    setProdutosFiltrados(produtosFiltrados);
  }, [pesquisa, produtos]);

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
    setProdutoSelecionado(id);
  };

  const handleDiminuirQuantidade = async () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto para diminuir a quantidade.");
      return;
    }
    const produto = produtos.find((p) => p.id === produtoSelecionado);
    if (!produto) return;

    if (produto.quantidade <= 0) {
      alert("O produto já está inutilizado.");
      return;
    }

    const novaQuantidade = produto.quantidade - 1;

    try {
      const response = await fetch(`${linkPro}/${produtoSelecionado}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...produto, quantidade: novaQuantidade }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar a quantidade do produto");
      }

      alert("Quantidade do produto atualizada com sucesso!");

      setProdutos((prevProdutos) =>
        prevProdutos.map((p) =>
          p.id === produtoSelecionado ? { ...p, quantidade: novaQuantidade } : p
        )
      );
      setProdutosFiltrados((prevProdutos) =>
        prevProdutos.map((p) =>
          p.id === produtoSelecionado ? { ...p, quantidade: novaQuantidade } : p
        )
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar a quantidade do produto");
    }
  };

  const handleDetalhar = () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto para visualizar os detalhes.");
      return;
    }
    navigate(`/Produto/DetalhesProduto/${produtoSelecionado}`);
  };

  const handleEditar = () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto para editar.");
      return;
    }
    navigate(`/Produto/EditarProduto/${produtoSelecionado}`);
  };

  const handleClonar = () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto para clonar.");
      return;
    }
    const produto = produtos.find((p) => p.id === produtoSelecionado);
    if (produto) {
      navigate("/Produto/CadastroProduto", { state: { produto } });
    }
  };

  const handleDelete = async () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto para deletar.");
      return;
    }
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este produto?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkPro}/${produtoSelecionado}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o produto");
      }

      alert("Produto deletado com sucesso!");

      // Remove o produto da lista local
      setProdutos((prev) => prev.filter((p) => p.id !== produtoSelecionado));
      setProdutosFiltrados((prev) =>
        prev.filter((p) => p.id !== produtoSelecionado)
      );
      setProdutoSelecionado(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o produto");
    }
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
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((produto) => (
                <tr
                  key={produto.id}
                  onClick={() => handleRowClick(produto.id)}
                  style={{
                    backgroundColor:
                      produtoSelecionado === produto.id
                        ? "blue"
                        : produto.quantidade <= 0
                        ? "#b41111"
                        : "transparent",
                    color:
                      produtoSelecionado === produto.id ||
                      produto.quantidade <= 0
                        ? "white"
                        : "black",
                    cursor: "pointer",
                  }}
                >
                  <td>{produto.id}</td>
                  <td>{produto.descricao}</td>
                  <td>{produto.quantidade}</td>
                  <td>
                    {produto.preçoVenda ? produto.preçoVenda.toFixed(2) : "N/A"}
                  </td>
                  <td>
                    {categorias.find((cat) => cat.id === produto.categoriaId)
                      ?.descricao || "N/A"}
                  </td>
                  <td>
                    {produto.dataCadastro
                      ? new Date(produto.dataCadastro).toLocaleString("pt-br")
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
