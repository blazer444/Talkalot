import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainerner from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActivateTabSwitch from "../components/ActivateTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceHolder from "../components/NoConversationPlaceHolder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  return (
    <div className="relative w-full max-w-6xl h-[800px]">

      <BorderAnimatedContainerner>
        {/* LADO ESQUERDO */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActivateTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> :<ContactList />}
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="flex-1 flex flcxe-col bg-slate-900/50 backdrop-blusr-sm">
        {selectedUser ? <ChatContainer /> :<NoConversationPlaceHolder />}


        </div>

      </BorderAnimatedContainerner>

    </div>
  );
}
export default ChatPage;
