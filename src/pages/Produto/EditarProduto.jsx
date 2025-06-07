import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Produto.css";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";

export function EditarProduto() {
  document.title = "Editar Produto";
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState({
    descricao: "",
    fornecedorMarca: "",
    preçoCusto: "",
    preçoVenda: "",
    tamanho: "",
    cor: "",
    quantidade: "",
    categoriaId: "",
  });
  const [categorias, setCategorias] = useState([]);
  const [outraCategoria, setOutraCategoria] = useState("");
  const [mostrarInputOutra, setMostrarInputOutra] = useState(false);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await fetch(`${linkPro}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados do produto");
        }

        const data = await response.json();
        setProduto(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do produto");
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

    fetchProduto();
    fetchCategorias();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduto((prevProduto) => ({
      ...prevProduto,
      [name]: value,
    }));
  };

  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === "outra") {
      setMostrarInputOutra(true);
      setProduto((prev) => ({ ...prev, categoriaId: "" }));
    } else {
      setMostrarInputOutra(false);
      setProduto((prev) => ({ ...prev, categoriaId: value }));
      setOutraCategoria("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let categoriaParaUsar = produto.categoriaId;

    // Se for "Outra", cadastra a nova categoria e pega o id dela
    if (mostrarInputOutra && outraCategoria.trim() !== "") {
      try {
        const responseCategoria = await fetch(linkCat, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ descricao: outraCategoria }),
        });

        if (!responseCategoria.ok) {
          throw new Error("Erro ao cadastrar nova categoria");
        }

        const novaCategoria = await responseCategoria.json();
        categoriaParaUsar = novaCategoria.id;
        setCategorias((prev) => [...prev, novaCategoria]);
      } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar a nova categoria");
        return;
      }
    }

    try {
      const response = await fetch(`${linkPro}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...produto,
          preçoCusto: parseFloat(produto.preçoCusto),
          preçoVenda: parseFloat(produto.preçoVenda),
          quantidade: parseInt(produto.quantidade),
          categoriaId: parseInt(categoriaParaUsar),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o produto");
      }

      navigate("/Produto/ListagemProduto");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o produto");
    }
  };

  return (
    <div className="centroEditarPro">
    <div className="EditarProduto">
      <h1>Editar Produto</h1>
      <form className="divEditarProduto" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={produto.id || ""}
          placeholder="Id"
          className="inputEditarProduto inputIdEditarProduto"
        />
        <input
          type="text"
          name="descricao"
          required
          placeholder="Descrição"
          className="inputEditarProduto"
          value={produto.descricao}
          onChange={handleChange}
        />
        <input
          type="text"
          name="fornecedorMarca"
          required
          placeholder="Fornecedor/Marca"
          className="inputEditarProduto"
          value={produto.fornecedorMarca}
          onChange={handleChange}
        />
        <input
          type="text"
          name="preçoCusto"
          required
          placeholder="Preço Custo"
          className="inputEditarProduto"
          value={produto.preçoCusto}
          onChange={handleChange}
        />
        <input
          type="text"
          name="preçoVenda"
          required
          placeholder="Preço Venda"
          className="inputEditarProduto"
          value={produto.preçoVenda}
          onChange={handleChange}
        />
        <input
          type="text"
          name="tamanho"
          required
          placeholder="Tamanho"
          className="inputEditarProduto"
          value={produto.tamanho}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cor"
          required
          placeholder="Cor"
          className="inputEditarProduto"
          value={produto.cor}
          onChange={handleChange}
        />
        <input
          type="text"
          name="quantidade"
          required
          placeholder="Quantidade"
          className="inputEditarProduto"
          value={produto.quantidade}
          onChange={handleChange}
        />

        {!mostrarInputOutra ? (
          <select
            name="categoriaId"
            className="inputEditarProduto"
            value={produto.categoriaId}
            onChange={handleCategoriaChange}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.descricao}
              </option>
            ))}
            <option value="outra">Outra</option>
          </select>
        ) : (
          <input
            type="text"
            required
            placeholder="Digite a nova categoria"
            className="inputEditarProduto"
            value={outraCategoria}
            onChange={(e) => setOutraCategoria(e.target.value)}
            style={{ gridColumn: "1 / span 2" }}
          />
        )}

        <div className="buttonsGroupEditarProduto">
          <button type="button" className="btnProduto btnVoltarProduto">
            <Link to="/Produto/ListagemProduto" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnProduto btnSalvarProduto">
            Salvar
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}