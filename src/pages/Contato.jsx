import React from "react";
import { Link } from "react-router-dom";
import "./Pages.css";

export function Contato() {
  document.title = "Contato — Hello People";

  return (
    <div className="contato-page">
      <header
        className="headerNav"
        style={{ padding: "10px 0", height: "7vh" }}
      >
        <nav>
          <ul>
            <li>
              <a href="/inicio">Início</a>
            </li>
            <li>
              <a href="/contato" className="active">
                Contato
              </a>
            </li>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/cadastro">Cadastro</a>
            </li>
          </ul>
        </nav>
      </header>

      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 880,
            background: "#fff",
            color: "#111827",
            padding: 22,
            borderRadius: 12,
            boxShadow: "0 8px 28px rgba(2,6,23,0.08)",
            border: "1px solid rgba(2,6,23,0.04)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22 }}>Hello People</h1>
          <p style={{ marginTop: 8, color: "#6b7280" }}>
            Loja de roupas casuais e streetwear. Qualidade, conforto e estilo
            para o seu dia a dia.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 18,
            }}
          >
            <div>
              <strong>Endereço</strong>
              <div style={{ color: "#475569", marginTop: 6 }}>
                Rua Exemplo, 123 — São Paulo, SP
              </div>
            </div>

            <div>
              <strong>Telefone</strong>
              <div style={{ color: "#475569", marginTop: 6 }}>
                (11) 98765‑4321
              </div>
            </div>

            <div>
              <strong>E‑mail</strong>
              <div style={{ color: "#475569", marginTop: 6 }}>
                contato@hellopeople.com
              </div>
            </div>

            <div>
              <strong>Atendimento</strong>
              <div style={{ color: "#475569", marginTop: 6 }}>
                Seg‑Sex: 09:00 ‑ 18:00
                <br />
                Sáb: 09:00 ‑ 13:00
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <strong>Redes sociais</strong>
            <div style={{ color: "#475569", marginTop: 6 }}>
              Instagram: @hellopeople &nbsp;•&nbsp; Facebook: /hellopeople
            </div>
          </div>

          <div style={{ marginTop: 20, textAlign: "right" }}>
            <Link
              to="/inicio"
              style={{
                textDecoration: "none",
                color: "#6b7280",
                fontWeight: 700,
              }}
            >
              Voltar
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
