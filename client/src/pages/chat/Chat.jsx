import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { useEffect } from "react";
import { toast } from "sonner";
import ContactsContainer from "./components/ContactsContainer";
import EmptyChatContainer from "./components/EmptyChatContainer";
import ChatContainer from "./components/ChatContainer";

const Chat = () => {
  const { userInfo } = useAppStore();

  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please setup profile to continue ");
      navigate("/profile");
    }
  }, [userInfo, navigate]);
  return (
    <div className="flex h-[100vh] text-white overflow-hidden ">
      <ContactsContainer />
      <EmptyChatContainer />
      <ChatContainer />
    </div>
  );
};

export default Chat;
