import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Recebe o redirecionamento do OAuth2 Google e salva o token no localStorage. */
export function OAuth2Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const nivelAcesso = params.get("nivelAcesso");
    const nome = params.get("nome");
    const id = params.get("id");
    const error = params.get("error");

    if (error || !token) {
      alert("Falha no login com Google. Tente novamente.");
      navigate("/login");
      return;
    }

    // Normaliza nivelAcesso: "FUNCIONARIO" → "Funcionario"
    const nivelNormalizado =
      nivelAcesso
        ? nivelAcesso.charAt(0).toUpperCase() + nivelAcesso.slice(1).toLowerCase()
        : "Cliente";

    localStorage.setItem(
      "user",
      JSON.stringify({
        id,
        nome: decodeURIComponent(nome || ""),
        nivelAcesso: nivelNormalizado,
        token,
        expiration: 8 * 60 * 60 * 1000,
        lastActivity: Date.now(),
      })
    );

    if (nivelNormalizado === "Cliente") {
      navigate("/inicio");
    } else {
      navigate("/home");
    }
  }, [navigate]);

  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Autenticando com Google...</p>;
}
