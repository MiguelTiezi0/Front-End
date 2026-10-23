import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";
import { linkFor } from "../Fornecedor/linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function CadastroProduto() {
  useRequireAuth("Funcionario");
  document.title = "Cadastro de Produtos";
  const location = useLocation();
  const navigate = useNavigate();
  const produtoClonado = location.state?.produto || null;
  const alerta = useAlerta();

  const [descricao, setDescricao] = useState(produtoClonado?.descricao || "");
  const [fornecedorId, setFornecedorId] = useState(produtoClonado?.idFornecedor || "");
  const [fornecedores, setFornecedores] = useState([]);
  const [mostrarInputFornecedor, setMostrarInputFornecedor] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState({ nome: "", cnpj: "", numTelefone: "" });

  const [precoCusto, setPrecoCusto] = useState(produtoClonado?.precoCusto || "");
  const [precoVenda, setPrecoVenda] = useState(produtoClonado?.precoVenda || "");
  const [tamanho, setTamanho] = useState(produtoClonado?.tamanho || "");
  const [cor, setCor] = useState(produtoClonado?.cor || "");
  const [quantidade, setQuantidade] = useState(produtoClonado?.quantidade ?? "");
  const [categoriaId, setCategoriaId] = useState(produtoClonado?.categoriaId || "");
  const [categorias, setCategorias] = useState([]);
  const [outraCategoria, setOutraCategoria] = useState("");
  const [mostrarInputOutra, setMostrarInputOutra] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(linkCat);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCategorias(Array.isArray(data) ? data : []);
      } catch {
        alerta("Não foi possível carregar as categorias.", "error");
      }
    };
    const fetchFornecedores = async () => {
      try {
        const response = await fetch(linkFor);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setFornecedores(Array.isArray(data) ? data : []);
      } catch {
        alerta("Não foi possível carregar os fornecedores.", "error");
      }
    };
    fetchCategorias();
    fetchFornecedores();
  }, [alerta]);

  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === "outra") {
      setMostrarInputOutra(true);
      setCategoriaId("");
    } else {
      setMostrarInputOutra(false);
      setCategoriaId(value);
    }
  };

  const handleFornecedorChange = (e) => {
    const value = e.target.value;
    if (value === "novo") {
      setMostrarInputFornecedor(true);
      setFornecedorId("");
    } else {
      setMostrarInputFornecedor(false);
      setFornecedorId(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      let categoriaParaUsar = categoriaId;
      let fornecedorParaUsar = fornecedorId;

      if (mostrarInputOutra && outraCategoria.trim()) {
        const resp = await fetch(linkCat, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descricao: outraCategoria }),
        });
        if (!resp.ok) throw new Error("Erro ao cadastrar a nova categoria.");
        categoriaParaUsar = (await resp.json()).id;
      }

      if (mostrarInputFornecedor && novoFornecedor.nome.trim() && novoFornecedor.cnpj.trim()) {
        const resp = await fetch(linkFor, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoFornecedor),
        });
        if (!resp.ok) throw new Error("Erro ao cadastrar o novo fornecedor.");
        fornecedorParaUsar = (await resp.json()).id;
      }

      const produto = {
        descricao,
        idFornecedor: fornecedorParaUsar ? Number(fornecedorParaUsar) : null,
        cor,
        tamanho,
        quantidade: parseInt(quantidade, 10) || 0,
        precoCusto: parseFloat(precoCusto) || 0,
        precoVenda: parseFloat(precoVenda) || 0,
        ativo: (parseInt(quantidade, 10) || 0) > 0,
        categoriaId: categoriaParaUsar ? Number(categoriaParaUsar) : null,
      };

      const response = await fetch(linkPro, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao cadastrar o produto.");
      }

      alerta("Produto cadastrado com sucesso!", "success");
      navigate("/Produto/ListagemProduto");
    } catch (error) {
      console.error(error);
      alerta(error.message || "Erro ao cadastrar o produto.", "error");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Novo produto</h1>
          <p className="pdv-subtitle">Cadastre um item no catálogo da loja.</p>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Descrição *</label>
            <input type="text" className="hp-inp" required placeholder="Ex: Camiseta básica" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>

          <div>
            <label className="hp-lb">Fornecedor</label>
            {!mostrarInputFornecedor ? (
              <select className="hp-inp" value={fornecedorId} onChange={handleFornecedorChange}>
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
                <option value="novo">+ Cadastrar novo fornecedor</option>
              </select>
            ) : (
              <button type="button" className="pdv-btn pdv-btn--ghost pdv-btn--sm" onClick={() => setMostrarInputFornecedor(false)}>
                Cancelar novo fornecedor
              </button>
            )}
          </div>
          <div>
            <label className="hp-lb">Categoria</label>
            {!mostrarInputOutra ? (
              <select className="hp-inp" value={categoriaId} onChange={handleCategoriaChange}>
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.descricao}</option>
                ))}
                <option value="outra">+ Cadastrar nova categoria</option>
              </select>
            ) : (
              <input
                type="text"
                className="hp-inp"
                required
                placeholder="Nome da nova categoria"
                value={outraCategoria}
                onChange={(e) => setOutraCategoria(e.target.value)}
              />
            )}
          </div>

          {mostrarInputFornecedor && (
            <div className="pdv-form-col-full pdv-form-grid" style={{ gap: 18 }}>
              <input type="text" className="hp-inp" required placeholder="Nome do fornecedor" value={novoFornecedor.nome} onChange={(e) => setNovoFornecedor((p) => ({ ...p, nome: e.target.value }))} />
              <input type="text" className="hp-inp" required placeholder="CNPJ" value={novoFornecedor.cnpj} onChange={(e) => setNovoFornecedor((p) => ({ ...p, cnpj: e.target.value }))} />
              <input type="text" className="hp-inp" placeholder="Telefone" value={novoFornecedor.numTelefone} onChange={(e) => setNovoFornecedor((p) => ({ ...p, numTelefone: e.target.value }))} />
            </div>
          )}

          <div>
            <label className="hp-lb">Cor</label>
            <input type="text" className="hp-inp" placeholder="Ex: Azul" value={cor} onChange={(e) => setCor(e.target.value)} />
          </div>
          <div>
            <label className="hp-lb">Tamanho</label>
            <input type="text" className="hp-inp" placeholder="Ex: M" value={tamanho} onChange={(e) => setTamanho(e.target.value)} />
          </div>

          <div>
            <label className="hp-lb">Quantidade em estoque *</label>
            <input type="number" min="0" className="hp-inp" required value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          </div>
          <div />

          <div>
            <label className="hp-lb">Preço de custo *</label>
            <input type="number" step="0.01" min="0" className="hp-inp" required placeholder="0,00" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value)} />
          </div>
          <div>
            <label className="hp-lb">Preço de venda *</label>
            <input type="number" step="0.01" min="0" className="hp-inp" required placeholder="0,00" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Produto/ListagemProduto" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
