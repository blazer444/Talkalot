import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore"
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, MailIcon, LockIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";




function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();

    login(formData);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="relative w-full flex flex-col md:flex-row backdrop-blur-xl bg-white/10 border border-white/20 overflow-hidden liquid-glass rounded-2xl">
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Bem vindo de Volta!</h2>
                  <p className="text-slate-400">Faça login para conversar!</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* EMAIL */}
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />

                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="exemplo@gmail.com"
                      />
                    </div>
                  </div>

                  {/* SENHA */}
                  <div>
                    <label className="auth-input-label">Senha</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />

                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Digite sua senha"
                      />
                    </div>
                  </div>

                  {/* BOTÃO DE CONFIRMAÇÃO */}
                  <button className="auth-btn" type="submit" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Fazer Login"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/signup"
                    className="auth-link"
                  >
                    Não tem conta ainda? <span className="font-semibold">Cadastre-se agora!</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/login.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Entre, conecte-se e Talkalot!</h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Conversas ilimitadas</span>
                    <span className="auth-badge">Interface intuitiva</span>
                    <span className="auth-badge">Compatível com todos os dispositivos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default LoginPage;
