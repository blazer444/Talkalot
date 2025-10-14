import { Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";

function App() {

  const {authUser, login, isLoggedIn } = useAuthStore()

  console.log("auth user:", authUser);
  console.log("isLoggedIn:", isLoggedIn);
  
  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[#0a0a0a] bg-[linear-gradient(to_right,#2e2e2e40_1px,transparent_1px),linear-gradient(to_bottom,#2e2e2e40_1px,transparent_1px)] bg-[size:13px_25px]" />
      <div className="absolute top-0 -left-4 size-96 bg-blue-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-neutral-400 opacity-20 blur-[100px]" />

      <button onClick={login} className="z-10">Login</button>

      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </div>
  );
}
export default App
