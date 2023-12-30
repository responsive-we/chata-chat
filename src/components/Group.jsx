import React,{useContext} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "@/context/AuthContext";
import { query ,db,where,getDocs,collection} from "@/firebase";
const Group = ({ name, photoURL,groupId }) => {
    const {setActiveGroup,setActiveFriend}=useContext(AuthContext);
    const handleClickOnGroup= async(groupId)=>{
        const q= query(collection(db, "groups"), where("groupId", "==", groupId));
        try{
          const querySnapshot= await getDocs(q);
          querySnapshot.forEach((doc) => {
            setActiveGroup(doc.data());
            setActiveFriend({});
          });
        }
        catch(error){
          console.log("error");
        }
      }
  return (
    <div className="bg-slate mt-2 pr-2 pl-1 pt-1 cursor-pointer"onClick={()=>handleClickOnGroup(groupId)}  >
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

export default Group;
