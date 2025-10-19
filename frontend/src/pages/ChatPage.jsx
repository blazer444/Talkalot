import { useAuthStore } from "../store/useAuthStore";

function ChatPage() {
  const { logout } = useAuthStore();
  return (
    <div className="z-10">
      ChatPage
      <button onClick={logout}>logout</button>
    </div>
  );
}
export default ChatPage;
