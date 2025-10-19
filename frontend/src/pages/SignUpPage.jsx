import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore"
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, UsersIcon, MailIcon, LockIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();

    signup(formData);
  }

  return <div className="w-full flex items-center justify-center p-4 bg-slate-900">
    <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
      <BorderAnimatedContainer>
        <div className="relative w-full flex flex-col md:flex-row backdrop-blur-xl bg-white/10 border border-white/20 overflow-hidden liquid-glass rounded-2xl">
          <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-200 mb-2">Cadastre-se</h2>
                <p className="text-slate-400">Cadastre-se para uma nova conta</p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* NOME COMPLETO */}
                <div>
                  <label className="auth-input-label">Nome Completo</label>
                  <div className="relative">
                    <UsersIcon className="auth-input-icon" />

                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                </div>

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
                <button className="auth-btn" type="submit" disabled={isSigningUp}>
                  {isSigningUp ? (
                    <LoaderIcon className="w-full h-5 animate-spin text-center" />
                  ) : (
                    "Criar Conta"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="auth-link"
                >
                  Já tem conta? <span className="font-semibold">Fazer login</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
            <div>
              <img
                src="/signup.png"
                alt="People using mobile devices"
                className="w-full h-auto object-contain"
              />
              <div className="mt-6 text-center">
                <h3 className="text-xl font-medium text-cyan-400">Sua próxima conversa começa aqui!</h3>

                <div className="mt-4 flex justify-center gap-4">
                  <span className="auth-badge">100% Gratuito</span>
                  <span className="auth-badge">Rápido e fácil</span>
                  <span className="auth-badge">Privado & Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BorderAnimatedContainer>
    </div>
  </div>;
};
export default SignUpPage;

