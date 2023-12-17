import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AddFriend,EditProfile } from ".";
import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button"
import {signOut,auth} from "@/firebase"

const sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="bg-slate pr-2 pl-1 pt-1">
      <div className="flex justify-center items-center mb-2 ">
        <div className="mr-2 w-10">
         <EditProfile />
        </div>
        <h2 className="">{currentUser.displayName}</h2>
        <Button size="icon" onClick={()=>signOut(auth)} type="button"><ExitIcon/></Button>
      </div>
      <hr className="mb-2" />
      <div className="flex w-full max-w-sm items-center space-x-2">
        <AddFriend />
      </div>
    </div>
  );
};

export default sidebar;
