import React,{useContext, useEffect} from 'react'
import { AuthContext } from "@/context/AuthContext"
const Chat = () => {
  const { combinedId } = useContext(AuthContext);
  useEffect(() => {
    console.log(combinedId);
  }, [combinedId]);
  return (
    <div className=' w-full text-white'>{combinedId}</div>
  )
}

export default Chat