import React,{useContext} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "@/context/AuthContext";
const Friend = ({ name, photoURL,uid }) => {
    const {setCombinedId,currentUser}=useContext(AuthContext);
    const handleClickOnFriend=(uid)=>()=>{
        const combinedId = currentUser.uid > uid ? `${currentUser.uid}+${uid}` : `${uid}+${currentUser.uid}`;
        setCombinedId(combinedId);
      }
  return (
    <div className="bg-slate mt-2 pr-2 pl-1 pt-1 cursor-pointer"onClick={handleClickOnFriend(uid)}  >
      <div className="flex justify-center items-center mb-2 ">
        <div className="mr-2 w-10">
          <Avatar>
            <AvatarImage src={photoURL} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <h2 className="">{name}</h2>
      </div>
    </div>
  );
};

export default Friend;
