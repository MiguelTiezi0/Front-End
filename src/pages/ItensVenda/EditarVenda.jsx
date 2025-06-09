import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Venda.css";
import { linkVen } from "./linkVen";
import { linkCat } from "../Categoria/linkCat";

export function EditarVenda() {
  document.title = "Editar Venda";
  const { id } = useParams();
  const navigate = useNavigate();
  const [Venda, setVenda] = useState({
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
    const fetchVenda = async () => {
      try {
        const response = await fetch(`${linkVen}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados do Venda");
        }

        const data = await response.json();
        setVenda(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do Venda");
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

    fetchVenda();
    fetchCategorias();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenda((prevVenda) => ({
      ...prevVenda,
      [name]: value,
    }));
  };

  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === "outra") {
      setMostrarInputOutra(true);
      setVenda((prev) => ({ ...prev, categoriaId: "" }));
    } else {
      setMostrarInputOutra(false);
      setVenda((prev) => ({ ...prev, categoriaId: value }));
      setOutraCategoria("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let categoriaParaUsar = Venda.categoriaId;

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
      const response = await fetch(`${linkVen}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...Venda,
          preçoCusto: parseFloat(Venda.preçoCusto),
          preçoVenda: parseFloat(Venda.preçoVenda),
          quantidade: parseInt(Venda.quantidade),
          categoriaId: parseInt(categoriaParaUsar),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o Venda");
      }

      navigate("/Venda/ListagemVenda");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o Venda");
    }
  };

  return (
    <div className="centroEditarVen">
    <div className="EditarVenda">
      <h1>Editar Venda</h1>
      <form className="divEditarVenda" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={Venda.id || ""}
          placeholder="Id"
          className="inputEditarVenda inputIdEditarVenda"
        />
        <input
          type="text"
          name="descricao"
          required
          placeholder="Descrição"
          className="inputEditarVenda"
          value={Venda.descricao}
          onChange={handleChange}
        />
        <input
          type="text"
          name="fornecedorMarca"
          required
          placeholder="Fornecedor/Marca"
          className="inputEditarVenda"
          value={Venda.fornecedorMarca}
          onChange={handleChange}
        />
        <input
          type="text"
          name="preçoCusto"
          required
          placeholder="Preço Custo"
          className="inputEditarVenda"
          value={Venda.preçoCusto}
          onChange={handleChange}
        />
        <input
          type="text"
          name="preçoVenda"
          required
          placeholder="Preço Venda"
          className="inputEditarVenda"
          value={Venda.preçoVenda}
          onChange={handleChange}
        />
        <input
          type="text"
          name="tamanho"
          required
          placeholder="Tamanho"
          className="inputEditarVenda"
          value={Venda.tamanho}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cor"
          required
          placeholder="Cor"
          className="inputEditarVenda"
          value={Venda.cor}
          onChange={handleChange}
        />
        <input
          type="text"
          name="quantidade"
          required
          placeholder="Quantidade"
          className="inputEditarVenda"
          value={Venda.quantidade}
          onChange={handleChange}
        />

        {!mostrarInputOutra ? (
          <select
            name="categoriaId"
            className="inputEditarVenda"
            value={Venda.categoriaId}
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
            className="inputEditarVenda"
            value={outraCategoria}
            onChange={(e) => setOutraCategoria(e.target.value)}
            style={{ gridColumn: "1 / span 2" }}
          />
        )}

        <div className="buttonsGroupEditarVenda">
          <button type="button" className="btnVenda btnVoltarVenda">
            <Link to="/Venda/ListagemVenda" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnVenda btnSalvarVenda">
            Salvar
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}