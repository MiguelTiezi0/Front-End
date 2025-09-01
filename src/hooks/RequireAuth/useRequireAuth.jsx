// hooks/useRequireAuth.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Hook para proteger páginas pelo nível de acesso e inatividade
export function useRequireAuth(minNivel) {
  const navigate = useNavigate();

  useEffect(() => {
    function checkUser() {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userData);
      const now = Date.now();

    const tempos = {
  "Cliente": 5 * 60 * 1000,       
  "Funcionario": 30 * 60 * 1000,  
  "Gerente": 30 * 60 * 1000,
  "Administrador": 30 * 60 * 1000
};

const tempoMax = tempos[user.nivelAcesso] || 30 * 60 * 1000;
if (now - user.lastActivity > tempoMax) {
  localStorage.removeItem("user");
  alert("Você foi desconectado por inatividade.");
  navigate("/login");
  return;
}


      // Verifica nível de acesso
      const niveis = ["Administrador", "Gerente", "Funcionario", "Cliente"];
      if (niveis.indexOf(user.nivelAcesso) > niveis.indexOf(minNivel)) {
        alert("Acesso não autorizado.");
        navigate("/inicio");
        return;
      }
    }

    function updateLastActivity() {
      const userData = localStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);
      user.lastActivity = Date.now();
      localStorage.setItem("user", JSON.stringify(user));
    }

    window.addEventListener("mousemove", updateLastActivity);
    window.addEventListener("keydown", updateLastActivity);
    window.addEventListener("scroll", updateLastActivity);

    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener("mousemove", updateLastActivity);
      window.removeEventListener("keydown", updateLastActivity);
      window.removeEventListener("scroll", updateLastActivity);
      clearInterval(interval);
    };
  }, [navigate, minNivel]);
}
