import React, { useContext, useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthContext } from "@/context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import emoji from "@/assets/emoji.png";
import { ref } from "firebase/database";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import { chatDb, update, get, child,onValue,chatRef} from "@/firebase";
const Incoming = ({ message, dateTime }) => (
  <div className="w-fit z-0 bg-gray-700 rounded-xl mb-1 p-2 ml-4">
    <p>{message}</p>
    <div className="text-xs text-right">{dateTime}</div>
  </div>
);
const Outgoing = ({ message, dateTime }) => (
  <div className="w-fit z-0 h-fit bg-gray-500 m-4 min-w-[10em] rounded-xl mb-1 p-2">
    <p>{message}</p>
    <div className="text-xs text-right">{dateTime}</div>
  </div>
);
const Chat = () => {
  const { combinedId, activeFriend, currentUserData,setCombinedId } = useContext(AuthContext);
  const [showPicker, setShowPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  let currentDate = null;
  const scrollAreaRef = useRef(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);
  useEffect(() => {
    const chatRef = ref(chatDb, `chats/${combinedId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const chat = snapshot.val();
      if (!!chat) {
        console.log(chat)
        setChats(Object.values(chat))
      } else {
        console.log("No chat found");
      }
    });
  
    return () => unsubscribe();
  }, [combinedId]);

  const handleSend = async () => {
    const currentDate = Date.now();
    if (message.length === 0) return;
    await update(ref(chatDb, "chats/" + combinedId + "/" + currentDate), {
      message,
      sentBy: currentUserData.uid,
      dateTime: currentDate,
    });
    setMessage("");
    setShowPicker(false);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="w-full flex flex-col justify-center">
      {!combinedId && (
        <div className="w-full h-[100%] flex justify-center items-center">
          <h1 className="text-3xl">Select a friend to chat</h1>
        </div>
      )}
      {combinedId && (
        <>
          <div className=" bg-slate-800 p-2 flex justify-center items-center">
            <ChevronLeftIcon className="w-8 h-8 text-white cursor-pointer" onClick={() => setCombinedId(null)} />  
              <Avatar className="ml-2">
                <AvatarImage src={activeFriend.photoURL} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h2 className="">{activeFriend.name}</h2>
          </div>
            
          <ScrollArea className="flex h-screen flex-col gap-2">
            {!chats.length == 0 ? chats.map((chat, index) => {
              const dateTime = new Date(chat.dateTime).toLocaleString("en-us", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });
              const dateString = new Date(chat.dateTime).toLocaleDateString(
                "en-US"
              );
              const isNewDate = dateString != currentDate;
              currentDate = dateString;
              
              return (
                <div ref={scrollAreaRef}>
                  {isNewDate && <div className=" mt-1 bg-green-700 w-fit p-1 rounded-lg relative left-[50%] right-[50%]">{dateString}</div>}
                  {chat.sentBy === currentUserData.uid ? (
                    <Outgoing
                      key={index}
                      message={chat.message}
                      dateTime={dateTime}
                    />
                  ) : (
                    <Incoming
                      key={index}
                      message={chat.message}
                      dateTime={dateTime}
                    />
                  )}
                </div>
              );
            }):<div className="w-full h-screen flex justify-center items-center"> No chats yet</div>}
            {showPicker && (
              <EmojiPicker
                autoFocusSearch={true}
                onEmojiClick={(sel__emoji) =>
                  setMessage((prev) => prev + sel__emoji.emoji)
                }
                className=" self-end z-100"
              />
            )}
          </ScrollArea>
          <div>
            <div className="flex justify-center items-center">
              <img
                src={emoji}
                className="w-8 h-8"
                onClick={() => setShowPicker((prev) => !prev)}
              />
              <input
                value={message}
                className="w-11/12  border-2 border-slate-800 pl-4"
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                placeholder="Type your message here"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && message.length > 0) {
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
};

export default Chat;
