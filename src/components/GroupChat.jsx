import React, { useContext, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthContext } from "@/context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import emoji from "@/assets/emoji.png";
import { ref, set } from "firebase/database";
import { chatDb, update, get, child,db, getDoc, doc } from "@/firebase";
import { EditGroup } from "@/components";
const getUserNameByID = async (uid)=>{
  const userRef = doc(db, "users" , uid);
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().name;
    }
  }
  catch (err) {
    console.error(err);
  }
}
const Incoming = ({ message, dateTime,sentBy}) => {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    getUserNameByID(sentBy).then(setUserName);
  }, [sentBy]);
  return(
  <div className="w-fit z-0 bg-gray-700 rounded-xl mb-1 p-2 ml-4">
    <div className="text-xs text-left underline">{userName}</div>
    <p className="">{message}</p>
    <div className="text-xs text-right">{dateTime}</div>
  </div>
  )
};
const Outgoing = ({ message, dateTime,sentBy }) => {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    getUserNameByID(sentBy).then(setUserName);
  }, [sentBy]);
  return(
  <div className="w-fit z-0 h-fit bg-gray-500 m-4 min-w-[10em] rounded-xl mb-1 p-2">
<div className="text-xs text-left underline">{userName}</div>
    <p className="">{message}</p>
    <div className="text-xs text-right">{dateTime}</div>
  </div>
  )
};

const GroupChat = () => {
    const {activeGroup,activeFriend} = useContext(AuthContext);
    const {currentUserData} = useContext(AuthContext);
    const [showPicker, setShowPicker] = useState(false);
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    let currentDate = null;
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
        dateTime: currentDate,
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
                      <Outgoing key={index} message={chat.message} dateTime={dateTime} sentBy={chat.sentBy}/>
                    ) : (
                      <Incoming key={index} message={chat.message} dateTime={dateTime} sentBy={chat.sentBy}/>
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