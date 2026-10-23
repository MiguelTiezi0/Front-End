import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";
import { linkFor } from "../Fornecedor/linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function EditarProduto() {
  useRequireAuth("Funcionario");
  document.title = "Editar Produto";
  const { id } = useParams();
  const navigate = useNavigate();
  const alerta = useAlerta();

  const [produto, setProduto] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchTudo = async () => {
      try {
        const [produtoRes, categoriasRes, fornecedoresRes] = await Promise.all([
          fetch(`${linkPro}/${id}`),
          fetch(linkCat),
          fetch(linkFor),
        ]);
        if (!produtoRes.ok) throw new Error("Erro ao buscar produto");
        setProduto(await produtoRes.json());
        setCategorias(categoriasRes.ok ? await categoriasRes.json() : []);
        setFornecedores(fornecedoresRes.ok ? await fornecedoresRes.json() : []);
      } catch (error) {
        console.error(error);
        alerta("Não foi possível carregar o produto.", "error");
      }
    };
    fetchTudo();
  }, [id, alerta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduto((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = {
        ...produto,
        quantidade: parseInt(produto.quantidade, 10) || 0,
        precoCusto: parseFloat(produto.precoCusto) || 0,
        precoVenda: parseFloat(produto.precoVenda) || 0,
        categoriaId: produto.categoriaId ? Number(produto.categoriaId) : null,
        idFornecedor: produto.idFornecedor ? Number(produto.idFornecedor) : null,
        ativo: (parseInt(produto.quantidade, 10) || 0) > 0,
      };

      const response = await fetch(`${linkPro}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao atualizar o produto.");
      }
      alerta("Produto atualizado com sucesso!", "success");
      navigate("/Produto/ListagemProduto");
    } catch (error) {
      console.error(error);
      alerta(error.message || "Erro ao atualizar o produto.", "error");
    } finally {
      setSalvando(false);
    }
  };

  if (!produto) {
    return <p className="pdv-empty">Carregando produto…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Produto/ListagemProduto" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para produtos
          </Link>
          <h1 className="pdv-title">Editar produto: {produto.descricao}</h1>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Descrição *</label>
            <input type="text" name="descricao" required className="hp-inp" value={produto.descricao || ""} onChange={handleChange} />
          </div>

          <div>
            <label className="hp-lb">Fornecedor</label>
            <select name="idFornecedor" className="hp-inp" value={produto.idFornecedor || ""} onChange={handleChange}>
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="hp-lb">Categoria</label>
            <select name="categoriaId" className="hp-inp" value={produto.categoriaId || ""} onChange={handleChange}>
              <option value="">Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.descricao}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="hp-lb">Cor</label>
            <input type="text" name="cor" className="hp-inp" value={produto.cor || ""} onChange={handleChange} />
          </div>
          <div>
            <label className="hp-lb">Tamanho</label>
            <input type="text" name="tamanho" className="hp-inp" value={produto.tamanho || ""} onChange={handleChange} />
          </div>

          <div>
            <label className="hp-lb">Quantidade em estoque *</label>
            <input type="number" min="0" name="quantidade" required className="hp-inp" value={produto.quantidade ?? ""} onChange={handleChange} />
          </div>
          <div />

          <div>
            <label className="hp-lb">Preço de custo *</label>
            <input type="number" step="0.01" min="0" name="precoCusto" required className="hp-inp" value={produto.precoCusto ?? ""} onChange={handleChange} />
          </div>
          <div>
            <label className="hp-lb">Preço de venda *</label>
            <input type="number" step="0.01" min="0" name="precoVenda" required className="hp-inp" value={produto.precoVenda ?? ""} onChange={handleChange} />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Produto/ListagemProduto" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
