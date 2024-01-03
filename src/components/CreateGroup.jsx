import React, { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "../context/AuthContext";
import { Friend } from ".";
import {v4 as uuid} from "uuid"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import {doc,setDoc,uploadBytesResumable,getDownloadURL,updateDoc,ref,storage,db} from "@/firebase";
import { useNavigate } from "react-router-dom";
import { arrayUnion } from "@/firebase";

const CreateGroup = () => {
  const navigate = useNavigate();
  const { friendsData,currentUserData } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [members, setMembers] = useState([]);
  
  const handleChange = (e) => {
    setName(e.target.value);
  };
  const handleImageChange = (e) => {
    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    setAvatar(e.target.files[0]);
  };
  const addToGroup = (uid) => {
    setMembers((prev) => [...prev, uid]);
  };
  const handleCreateGroup = async () => {
    const groupId=uuid();
    const storageRef = ref(storage, groupId);
    await uploadBytesResumable(storageRef, avatar).then(() => {
      getDownloadURL(storageRef).then(async (downloadURL) => {
        try {
          //create group on firestore
          await setDoc(doc(db, "groups", groupId), {
            groupId,
            name,
            displayPhoto:downloadURL,
            members: [...members],
            admins:[currentUserData.uid]
          });
          members.forEach(async (member) => {
            await updateDoc(doc(db, "users", member.uid), {
              groups: arrayUnion(groupId)
            },{merge:true});
          })
          await updateDoc(doc(db, "users", currentUserData.uid), {
            groups: arrayUnion(groupId)
          }, { merge: true });
          navigate("/")
          window.location.reload(false);
        } catch (err) {
          console.error(err);
          // setErr(true);
        }
      });
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="relative left-2 ">Create group</DialogTitle>
          <DialogDescription>
            Create a group to chat with your friends.
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="name" className="mb-1">
          Group Name
        </Label>
        <Input
          type="text"
          onChange={handleChange}
          id="name"
          placeholder="Name."
        />
        <div className="flex flex-row-reverse items-center justify-center ">
          <Input
            id="picture"
            onChange={handleImageChange}
            accept="image/*"
            type="file"
            style={{ display: "none" }}
          />
          <Label
            htmlFor="picture"
            className="mb-1 flex justify-center items-center flex-row-reverse"
          >
           Pick a display photo
            <Avatar className="mt-1 mr-2 h-16 w-16">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                <PlusCircledIcon />
              </AvatarFallback>
            </Avatar>
          </Label>
        </div>
        <hr />
        Add Friends to your group
        {friendsData &&
          friendsData.map((friend) => {
            if(members.length === 0) return (
               <div   key={friend.uid} className="flex justify-center items-center gap-5">
                  <Friend
                    name={friend.name}
                    photoURL={friend.photoURL}
                    uid={friend.uid}
                  />
                  <PlusCircledIcon
                    height={24}
                    width={24}
                    className={`cursor-pointer ${
                    members && members.includes(friend.uid)?"hidden":""
                    }`}
                    onClick={() => addToGroup(friend.uid)}
                  />
                </div>
            )
            if (
              members && members.includes(friend.uid)
            ) {
              return (
                <div   key={friend.uid} className="flex justify-center items-center gap-5">
                  <Friend
                    name={friend.name}
                    photoURL={friend.photoURL}
                    uid={friend.uid}
                  />
                  <PlusCircledIcon
                    height={24}
                    width={24}
                    className={`cursor-pointer ${
                      members && members.includes(friend.uid)?"hidden":""
                    }`}
                    onClick={() => addToGroup(friend.uid)}
                  />
                </div>
              );
            }
          })}
        No. of members: {members.length}
        <DialogFooter>
          <Button type="submit" className="w-full" onClick={handleCreateGroup}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
