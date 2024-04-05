import React, { useContext, useEffect,useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AddFriend,CreateGroup,EditProfile, Friend, Group } from ".";
import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button"
import {signOut,auth,query,getDocs,db,where,collection, getDoc,doc} from "@/firebase"
const Sidebar = () => {
  const {currentUserData,setFriendsData,isSmallScreen,combinedId,activeGroup} = useContext(AuthContext);
  const [friendsData, setFriendData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const isActiveGroupEmpty = Object.keys(activeGroup).length === 0;
  useEffect(() => {
    if (currentUserData.friends){
      currentUserData.friends.forEach(async (friend)=>{
        const q= query(collection(db, "users"), where("uid", "==", friend));
        try{
          const querySnapshot= await getDocs(q);
          querySnapshot.forEach((doc) => {
            setFriendData((prev)=>[...prev,doc.data()]);
           setFriendsData((prev)=>[...prev,doc.data()]);
          });
        }
        catch(error){
          console.log("error");
        }
      })
    }
    const fetchGroupData = async () => {
      const newGroupData = [];
      if (Array.isArray(currentUserData.groups)){
      for (const group of currentUserData.groups) {
        const docSnap = await getDoc(doc(db, "groups", group));
        if (docSnap.exists()) {
          newGroupData.push(docSnap.data());
        }
      }
    }
      setGroupData(newGroupData);
    };
  
    fetchGroupData();
  }, [currentUserData,currentUserData.friends,currentUserData.groups]);
  return (
    <div className={ `bg-slate-900 pr-2 pl-1 pt-1 ${isSmallScreen?combinedId?" hidden":!isActiveGroupEmpty?"hidden":"w-full":"w-4/12"}`}>
      <div className="flex justify-center items-center mb-2 ">
        <div className="mr-2 w-10">
         <EditProfile />
        </div>
        <h2 className="">{currentUserData.name}</h2>
        <Button size="icon" onClick={()=>signOut(auth)} type="button"><ExitIcon/></Button>
      </div>
      <hr className="mb-2" />
      <div className="flex justify-center items-center mb-2 ">
        <AddFriend />
      </div>
      {friendsData && friendsData.map((friend)=>(
        <Friend key={friend.uid} name={friend.name} photoURL={friend.photoURL} uid={friend.uid}/>
      ))}
      <hr/>
      <h2 className="text-center text-white">Groups</h2>
      {groupData.map((group) => (
  <Group key={group.groupId} name={group.name} photoURL={group.displayPhoto} groupId={group.groupId}/>
))}
      <CreateGroup />
    </div>
  );
};

export default Sidebar;
