import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";

export function DeletarPagamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pagamento, setPagamento] = useState(null);

  useEffect(() => {
    fetch(`${linkPag}/${id}`)
      .then(r => r.json())
      .then(setPagamento);
  }, [id]);

  const handleDelete = async () => {
    const res = await fetch(`${linkPag}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Pagamento deletado com sucesso!");
      navigate("/Pagamento/ListagemPagamento");
    } else {
      alert("Erro ao deletar pagamento.");
    }
  };

  if (!pagamento) {
    return <div>Carregando informações do pagamento...</div>;
  }

  return (
    <div className="deletarPagamento">
      <h1>Deletar Pagamento</h1>
      <p>Tem certeza que deseja deletar o pagamento de ID <strong>{pagamento.id}</strong>?</p>
      <button onClick={handleDelete} style={{ background: "#d9534f", color: "#fff" }}>
        Deletar
      </button>
      <button onClick={() => navigate(-1)} style={{ marginLeft: 10 }}>
        Cancelar
      </button>
    </div>
  );
}