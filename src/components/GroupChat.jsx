import React, { useContext, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthContext } from "@/context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import emoji from "@/assets/emoji.png";
import { ref } from "firebase/database";
import { chatDb, update, get, child } from "@/firebase";
import { EditGroup } from "@/components";
const Incoming = ({ message }) => (
  <div className="w-fit z-0 bg-gray-700 rounded-xl mb-1 p-2 ml-4">
    <p>{message}</p>
  </div>
);
const Outgoing = ({ message }) => (
  <div className="w-fit z-0 bg-gray-500 m-4 rounded-xl mb-1 p-2">
    <p>{message}</p>
  </div>
);

const GroupChat = () => {
    const {activeGroup,activeFriend} = useContext(AuthContext);
    const {currentUserData} = useContext(AuthContext);
    const [showPicker, setShowPicker] = useState(false);
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
  
    const scrollAreaRef = useRef(null);
    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollIntoView({ behavior: "smooth" })
    }},[message]);
    useEffect(() => {
      const getChats = async () => {
        if (!activeGroup.groupId) return;
        const chatRef = ref(chatDb);
        const chatSnap = await get(child(chatRef, `groups/${activeGroup.groupId}`));
        try {
          if (chatSnap.exists()) {
            setChats(Object.values(chatSnap.val()));
          }
        } catch (err) {
          console.log(err);
        }
      };
      getChats();
    }, [message,activeGroup.groupId,activeFriend]);
    const handleSend = async () => {
      const currentDate = Date.now();
      if (message.length === 0) return;
      await update(ref(chatDb, "groups/" + activeGroup.groupId + "/" + currentDate), {
        message,
        sentBy: currentUserData.uid,
      });
      setMessage("");
      setShowPicker(false);
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollIntoView({ behavior: "smooth" })}
    };
    return (
      <div className="w-full">
        {activeGroup.groupId && (
          <>
            <EditGroup />
            <ScrollArea  className="flex min-h-[84%] max-h-[84%] flex-col gap-2">
              {chats.map((chat,index) => {
                return (
                  <div ref={scrollAreaRef}>
                    {chat.sentBy === currentUserData.uid ? (
                      <Outgoing key={index} message={chat.message} />
                    ) : (
                      <Incoming key={index} message={chat.message} />
                    )}
                  </div>
                );
              })}
              {showPicker && (
                <EmojiPicker
                  autoFocusSearch={true}
                  onEmojiClick={(sel__emoji) =>
                    setMessage((prev) => prev + sel__emoji.emoji)
                  }
                  className=" self-end z-30"
                />
              )}
            </ScrollArea>
            <div className=" h-[7%] ">
              <div className="flex justify-center items-center">
                <img
                  src={emoji}
                  className="w-8 h-8"
                  onClick={() => setShowPicker((prev) => !prev)}
                />
                <input
                  value={message}
                  className="w-11/12 h-10  border-2 border-slate-800 pl-4"
                  onChange={(e) => setMessage(e.target.value)}
                  type="text"
                  placeholder="Type your message here"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && message.length > 0) {
                      handleSend();
                      e.preventDefault(); // Prevents the addition of a new line in the input when pressing Enter
                    }
                  }}
                />
                <Button
                  className="w-1/12 h-10"
                  disabled={message.length > 0 ? false : true}
                  
                  onClick={handleSend}
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
}

export default GroupChat