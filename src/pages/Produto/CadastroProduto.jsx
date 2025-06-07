import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Produto.css";

import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";

export function CadastroProduto() {
  document.title = "Cadastro de Produtos";
  const location = useLocation();
  const produtoClonado = location.state?.produto || null;

  const [Id, setId] = useState("");
  const [descricao, setDescricao] = useState(produtoClonado?.descricao || "");
  const [fornecedorMarca, setfornecedorMarca] = useState(produtoClonado?.fornecedorMarca || "");
  const [preçoCusto, setPreçoCusto] = useState(produtoClonado?.preçoCusto || "");
  const [preçoVenda, setPreçoVenda] = useState(produtoClonado?.preçoVenda || "");
  const [tamanho, setTamanho] = useState(produtoClonado?.tamanho || "");
  const [cor, setCor] = useState(produtoClonado?.cor || "");
  const [quantidade, setQuantidade] = useState(produtoClonado?.quantidade || "");
  const [categoriaId, setCategoriaId] = useState(produtoClonado?.categoriaId || "");
  const [categorias, setCategorias] = useState([]);
  const [outraCategoria, setOutraCategoria] = useState("");
  const [mostrarInputOutra, setMostrarInputOutra] = useState(false);

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

        const produtos = await response.json();
        const maiorId = produtos.reduce((max, produto) => Math.max(max, produto.id), 0);
        setId(maiorId + 1);
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

  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === "outra") {
      setMostrarInputOutra(true);
      setCategoriaId("");
    } else {
      setMostrarInputOutra(false);
      setCategoriaId(parseInt(value));
      setOutraCategoria("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let categoriaParaUsar = categoriaId;

    // Se for "Outra", cadastra a nova categoria e pega o id dela
    if (mostrarInputOutra && outraCategoria.trim() !== "") {
      try {
        // Cadastra nova categoria
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
        // Atualiza lista de categorias
        setCategorias((prev) => [...prev, novaCategoria]);
      } catch (error) {
        console.error(error);
         alert("Erro ao cadastrar a nova categoria");
        return;
      }
    }

    const produto = {
      descricao,
      fornecedorMarca,
      preçoCusto: parseFloat(preçoCusto),
      preçoVenda: parseFloat(preçoVenda),
      tamanho,
      cor,
      quantidade: parseInt(quantidade),
      categoriaId: categoriaParaUsar,
    };

    try {
      const response = await fetch(linkPro, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produto),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar o produto");
      }



      const responseProdutos = await fetch(linkPro, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!responseProdutos.ok) {
        throw new Error("Erro ao buscar produtos para calcular o próximo ID");
      }

      const produtos = await responseProdutos.json();
      const maiorId = produtos.reduce((max, produto) => Math.max(max, produto.id), 0);
      setId(maiorId + 1);
      // Limpa campo de outra categoria após cadastro
      setOutraCategoria("");
      setMostrarInputOutra(false);
    } catch (error) {
      console.error(error);
       alert("Erro ao cadastrar o produto");
    }
  };



  return (
    <div className="centro">

    
    <div className="CadastroProduto">
      <h1>Cadastro de Produtos</h1>
      <form className="formCadastroProduto" onSubmit={handleSubmit}>
        <input
          type="text"
          name="Id"
          id="Id"
          readOnly
          value={Id}
          placeholder="Id"
          className="inputCadastroProduto inputId"
        />
        <input
          type="text"
          required
          placeholder="Descrição"
          className="inputCadastroProduto"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Fornecedor/Marca"
          className="inputCadastroProduto"
          value={fornecedorMarca}
          onChange={(e) => setfornecedorMarca(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Preço Custo"
          className="inputCadastroProduto"
          value={preçoCusto}
          onChange={(e) => setPreçoCusto(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Preço Venda"
          className="inputCadastroProduto"
          value={preçoVenda}
          onChange={(e) => setPreçoVenda(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Tamanho"
          className="inputCadastroProduto"
          value={tamanho}
          onChange={(e) => setTamanho(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Cor"
          className="inputCadastroProduto"
          value={cor}
          onChange={(e) => setCor(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Quantidade"
          className="inputCadastroProduto"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />

        {/* Categoria: select OU input "Outra" */}
        {!mostrarInputOutra ? (
          <select
            className="selectCadastroProduto"
            value={categoriaId}
            onChange={handleCategoriaChange}
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
            className="inputCadastroProduto"
            value={outraCategoria}
            onChange={(e) => setOutraCategoria(e.target.value)}
          />
        )}

        <div className="buttonsGroupProduto">
          <button type="button" className="btnProduto btnVoltarProduto">
            <Link to="/" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnProduto btnSalvarProduto">
            Salvar
          </button>
          <button type="button" className="btnProduto btnEtiquetaProduto" onClick={() => alert("Gerar etiqueta")}>
            Etiqueta
          </button>
    
        </div>
      </form>
    </div>
    </div>
  );
}