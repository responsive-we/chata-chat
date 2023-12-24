import React, { useContext, useEffect,useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AddFriend,EditProfile, Friend } from ".";
import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button"
import {signOut,auth,query,getDocs,db,where,collection} from "@/firebase"

const sidebar = () => {
  const {currentUserData } = useContext(AuthContext);
  const [friendsData, setFriendsData] = useState([]);
  useEffect(() => {
    if (currentUserData.friends){
      currentUserData.friends.forEach(async (friend)=>{
        const q= query(collection(db, "users"), where("uid", "==", friend));
        try{
          const querySnapshot= await getDocs(q);
          querySnapshot.forEach((doc) => {
            setFriendsData((prev)=>[...prev,doc.data()]);
           
          });
        }
        catch(error){
          console.log("error");
        }
      })
    }
  }, [currentUserData,currentUserData.friends]);
 
  return (
    <div className=" bg-slate-700 pr-2 pl-1 pt-1">
      <div className="flex justify-center items-center mb-2 ">
        <div className="mr-2 w-10">
         <EditProfile />
        </div>
        <h2 className="">{currentUserData.name}</h2>
        <Button size="icon" onClick={()=>signOut(auth)} type="button"><ExitIcon/></Button>
      </div>
      <hr className="mb-2" />
      <div className="flex w-full max-w-sm items-center space-x-2">
        <AddFriend />
      </div>
      {friendsData && friendsData.map((friend)=>(
        <Friend key={friend.uid} name={friend.name} photoURL={friend.photoURL} uid={friend.uid}/>
      ))}
    </div>
  );
};

export default sidebar;
