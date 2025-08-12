import React, { useEffect, useState } from "react"; 
import { HeaderCaixa } from "../../components/Caixa/HeaderCaixa/HeaderCaixa.jsx";
import "./HomeCaixa.css";

export function HomeCaixa() {
  document.title = "Home";
  const [mensagemCaixa, setMensagemCaixa] = useState("");
  const [caixa, setCaixa] = useState(null);

  // Consulta do caixa (chamada manualmente após cada operação)
  const consultarCaixa = async () => {
    try {
      const res = await fetch("http://localhost:7172/api/Caixa/aberto");
      if (!res.ok) {
        setCaixa(null);
        setMensagemCaixa("Caixa fechado ou erro ao consultar.");
        return;
      }
      const dados = await res.json();
      setCaixa(dados);
      setMensagemCaixa("");
    } catch {
      setCaixa(null);
      setMensagemCaixa("Caixa fechado ou erro ao consultar.");
    }
  };
useEffect(() => {
    consultarCaixa(); // Consulta o caixa ao carregar a página
}, []);

  // Abrir caixa
  const handleAbrirCaixa = async () => {
    const valor = prompt("Informe o valor de abertura do caixa:");
    if (!valor || isNaN(valor)) {
      setMensagemCaixa("Valor inválido.");
      return;
    }
    try {
      const res = await fetch("http://localhost:7172/api/Caixa/abrir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorAbertura: parseFloat(valor) }),
      });
      if (res.ok) setMensagemCaixa("Caixa aberto com sucesso.");
      else setMensagemCaixa(`Erro ao abrir caixa. (${res.status})`);
      await consultarCaixa(); // Atualiza o valor do caixa
    } catch {
      setMensagemCaixa("Falha na comunicação com o servidor.");
    }
  };

  // Fechar caixa
  const handleFecharCaixa = async () => {
    try {
      const res = await fetch("http://localhost:7172/api/Caixa/fechar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valorFechamento: caixa?.valorFinal ?? caixa?.valorAtual ?? 0,
        }),
      });
      if (res.ok) {
        setMensagemCaixa("Caixa fechado com sucesso.");
        setCaixa(null);
      } else {
        setMensagemCaixa(`Erro ao fechar caixa. (${res.status})`);
      }
      await consultarCaixa(); // Atualiza o valor do caixa
    } catch {
      setMensagemCaixa("Erro na conexão.");
    }
  };

  // Registrar entrada
  const handleEntrada = async () => {
    const valor = prompt("Informe o valor da ENTRADA:");
    const descricao = prompt("Informe uma descrição da ENTRADA:");
    if (!valor || isNaN(valor) || !descricao) {
      setMensagemCaixa("Preencha valor e descrição válidos.");
      return;
    }
    try {
      const res = await fetch("http://localhost:7172/api/Caixa/entrada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: parseFloat(valor),
          descricao,
          tipo: "Entrada", // <-- Adicione este campo
        }),
      });
      if (res.ok) setMensagemCaixa("Entrada registrada.");
      else setMensagemCaixa(`Erro ao registrar entrada. (${res.status})`);
      await consultarCaixa();
    } catch {
      setMensagemCaixa("Erro ao registrar entrada.");
    }
  };

  // Registrar saída
  const handleSaida = async () => {
    const valor = prompt("Informe o valor da SAÍDA:");
    const descricao = prompt("Informe uma descrição da SAÍDA:");
    if (!valor || isNaN(valor) || !descricao) {
      setMensagemCaixa("Preencha valor e descrição válidos.");
      return;
    }
    try {
      const res = await fetch("http://localhost:7172/api/Caixa/saida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: parseFloat(valor),
          descricao,
          tipo: "Saída", // <-- Adicione este campo, com acento!
        }),
      });
      if (res.ok) setMensagemCaixa("Saída registrada.");
      else setMensagemCaixa(`Erro ao registrar saída. (${res.status})`);
      await consultarCaixa();
    } catch {
      setMensagemCaixa("Erro ao registrar saída.");
    }
  };

  return (
    <div className="HomeCaixa">
      <HeaderCaixa />
      <div className="AppHomeCaixa">
        <div className="CaixaOperacoes">
          <h2>Operações de Caixa</h2>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="valorCaixa" style={{ fontWeight: "bold" }}>
              Valor atual no caixa:
            </label>
            <input
              id="valorCaixa"
              type="text"
              readOnly
              value={
                caixa
                  ? `R$ ${caixa.valorAtual?.toFixed(2) ?? caixa.valorFinal?.toFixed(2) ?? "0.00"}`
                  : "Caixa fechado"
              }
              style={{
                marginLeft: 12,
                width: 140,
                fontWeight: "bold",
                fontSize: "1.2em",
                background: "#f6fff6",
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "6px 10px",
              }}
            />
          </div>
          <div className="CaixaBtns">
            <button onClick={handleAbrirCaixa}>Abrir Caixa</button>
            <button onClick={handleFecharCaixa}>Fechar Caixa</button>
            <button onClick={handleEntrada}>Registrar Entrada</button>
            <button onClick={handleSaida}>Registrar Saída</button>
          </div>
          {mensagemCaixa && <p className="MensagemCaixa">{mensagemCaixa}</p>}
        </div>
        <div className="CentroOp">
          <div className="Opcoes">
            <button className="OpcoesBtn">Opções</button>
            <button className="OpcoesBtn">Rec. Clientes</button>
            <button className="OpcoesBtn">Abrir Gaveta</button>
            <button className="OpcoesBtn">Nova venda</button>
            <button className="OpcoesBtn">Pendentes</button>
            <button className="OpcoesBtn">Localizar</button>
            <button className="OpcoesBtn">Reimpressão</button>
            <button className="OpcoesBtn">Troca</button>
            <button className="OpcoesBtn">Troca</button>
          </div>
        </div>
      </div>
    </div>
  );
}
