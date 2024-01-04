import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  PlusCircledIcon,
  ExclamationTriangleIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons";

import {
  storage,
  deleteObject,
  uploadBytesResumable,
  getDownloadURL,
  updateDoc,
  db,
  ref,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "@/firebase";
import {Friend} from ".";

const EditGroup = () => {
  const { activeGroup, currentUser,friendsData,setActiveGroup } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState(currentUser.displayName);
  const [err, setErr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [membersData, setMembersData] = useState([]);
  const [adminsData, setAdminsData] = useState([]);
  useEffect(() => {
    activeGroup.admins.forEach((admin)=>{if(admin===currentUser.uid){setIsAdmin(true)}})
  }, [activeGroup, currentUser]);

  useEffect(() => {
    const getMembersData = async () => {
      const members = activeGroup.members;
      const membersData = [];
      members.forEach(async (member) => {
        const docRef = doc(db, "users", member);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          membersData.push(docSnap.data());
        }
      });
      setMembersData(membersData);
    };
    const getAdminsData = () => {
      const admins = activeGroup.admins;
      const adminsData = [];
      admins.forEach(async (admins) => {
        if (admins === currentUser.uid) {
          return;
        }
        const docRef = doc(db, "users", admins);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          adminsData.push(docSnap.data());
        }
      });
      setAdminsData(adminsData);
    };
    getMembersData();
    getAdminsData();
   
  }, [activeGroup.members, activeGroup.admins, activeGroup.groupId]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  const handleImageChange = (e) => {
    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    setAvatar(e.target.files[0]);
  };
  const fetchGroupData = async () => {
    const docRef = doc(db, "groups", activeGroup.groupId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setActiveGroup(docSnap.data());
    }
  }
  const updateProfile = async () => {
    const storageRef = ref(storage, activeGroup.groupId);
    if (avatar) {
      getDownloadURL(storageRef)
        .then(async () => {
          await deleteObject(storageRef).then(async () => {
            const upload = uploadBytesResumable(storageRef, avatar);
            upload.on(
              "state_changed",
              (snapshot) => {
                setUploading(
                  Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  )
                );
              },
              (err) => {
                console.log(err);
              },
              async () => {
                getDownloadURL(upload.snapshot.ref).then(
                  async (downloadUrl) => {
                    await updateDoc(doc(db, "groups", activeGroup.groupId), {
                      displayPhoto: downloadUrl,
                      name: name ? name : activeGroup.name,
                    });
                    window.location.reload(false);
                  }
                );
                setAvatarUrl(null);
                setAvatar(null);
                setName(null);
                return;
              }
            );
          });
        })
        .catch(async (err) => {
          console.log(err);
          const upload = await uploadBytesResumable(storageRef, avatar);
          getDownloadURL(upload.ref).then(async (downloadUrl) => {
            await updateDoc(doc(db, "groups", activeGroup.groupId), {
              displayPhoto: downloadUrl,
              name: name ? name : activeGroup.name
            });
            setAvatarUrl(null);
            setAvatar(null);
            setName(null);
            setLoading(false);
            setUploading(false);
            window.location.reload(false);
            return;
          });
        });
    }
    if (!avatar && name) {
      try {
        setLoading(true);
        await updateDoc(doc(db, "groups", activeGroup.groupId), {
          name,
        });
        setAvatarUrl(null);
        setAvatar(null);
        setName(null);
        setLoading(false);
        window.location.reload(false);
        return;
      } catch (err) {
        setErr(true);
      }
    }
  };
  const makeAdmin = async (uid) => {
    try {
      await updateDoc(doc(db, "groups", activeGroup.groupId), {
        admins: arrayUnion(uid),
        members: arrayRemove(uid),
      });
      fetchGroupData()

    } catch (err) {
      console.log(err);
    }
  };
  const removeAdmin = async (uid) => {
    try {
      await updateDoc(doc(db, "groups", activeGroup.groupId), {
        admins: arrayRemove(uid),
        members: arrayUnion(uid),
      });
      fetchGroupData()
    } catch (err) {
      console.log(err);
    }
  }
  const addToGroup = async (uid) => {
    console.log(activeGroup.members && activeGroup.members.includes(uid))
    try {
      await updateDoc(doc(db, "groups", activeGroup.groupId), {
        members: arrayUnion(uid),
      });
      fetchGroupData()
    } catch (err) {
      console.log(err);
    }
  }

  const removeFromGroup = async (uid) => {
    console.log(activeGroup.members && activeGroup.members.includes(uid))
    try {
      if(activeGroup.admins.includes(uid)){
      await updateDoc(doc(db, "groups", activeGroup.groupId), {
        admins: arrayRemove(uid),
      });
    }else{
      await updateDoc(doc(db, "groups", activeGroup.groupId), {
        members: arrayRemove(uid),
      });
    }
    fetchGroupData()
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      {!isAdmin && (
        <div className=" bg-slate-800 h-[9%]">
          <div className="flex justify-center items-center">
            <Avatar className="ml-2 mt-2">
              <AvatarImage src={activeGroup.displayPhoto} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h2 className="">{activeGroup.name}</h2>
          </div>
        </div>
      )}
      {isAdmin && (
        <Dialog>
          <DialogTrigger asChild>
            <div className=" bg-slate-800 h-[9%]">
              <div className="flex justify-center items-center">
                <Avatar className="ml-2 mt-2">
                  <AvatarImage src={activeGroup.displayPhoto} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h2 className="">{activeGroup.name}</h2>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Label htmlFor="name" className="mb-1">
              Change your name
            </Label>
            <Input
              type="text"
              onChange={handleNameChange}
              id="name"
              placeholder="Name."
              value={name}
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
                Update your profile picture
                <Avatar className="mt-1 mr-2 h-16 w-16">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    <PlusCircledIcon />
                  </AvatarFallback>
                </Avatar>
              </Label>
            </div>
            <hr />
            Add or remove admins
            {membersData.map((member) => (
              <div
                key={member.uid}
                className="flex justify-center items-center gap-5"
              >
                <Friend
                  key={member.uid}
                  photoURL={member.photoURL}
                  name={member.name}
                />
                <PlusCircledIcon
                  height={24}
                  width={24}
                  className={`cursor-pointer `}
                  onClick={() => {makeAdmin(member.uid)}}

                />
              </div>
            ))}
            {adminsData.map((admin) => (
               <div
               key={admin.uid}
               className="flex justify-center items-center gap-5"
             >
               <Friend
                 key={admin.uid}
                 photoURL={admin.photoURL}
                 name={admin.name}
               />
               <MinusCircledIcon
                 height={24}
                 width={24}
                 className={`cursor-pointer `}
                 onClick={() => {removeAdmin(admin.uid)
                                
                }}
               />
             </div>
            ))}
            <hr />
            Add or remove members   
            {friendsData &&
            friendsData.map((friend) => {
       
            if (
              activeGroup.members.includes(friend.uid) || activeGroup.admins.includes(friend.uid)
            ) {
              return (
                <div   key={friend.uid} className="flex justify-center items-center gap-5">
                  <Friend
                    name={friend.name}
                    photoURL={friend.photoURL}
                    uid={friend.uid}
                  />
                  <MinusCircledIcon
                    height={24}
                    width={24}
                    className={`cursor-pointer `}
                    onClick={() => removeFromGroup(friend.uid)}
                    />
                </div>
              );
            }else{
              return(
                <div   key={friend.uid} className="flex justify-center items-center gap-5">
                  <Friend
                    name={friend.name}
                    photoURL={friend.photoURL}
                    uid={friend.uid}
                    />
                  <PlusCircledIcon
                    height={24}
                    width={24}
                    className={`cursor-pointer `}
                    
                    onClick={() => addToGroup(friend.uid)}
                  />
                </div>
              )
            }
          })}
            {err && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Oops, something went wrong. Please try again later.
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                onClick={updateProfile}
                disabled={uploading === false ? false : true}
              >
                {(uploading <= 100) & (uploading !== false)
                  ? `Uploading: ${uploading}%`
                  : loading
                  ? "Loading..."
                  : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EditGroup;
4