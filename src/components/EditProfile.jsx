import React, { useContext, useState } from "react";
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
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
 
import { PlusCircledIcon,ExclamationTriangleIcon } from "@radix-ui/react-icons";

import {
  storage,
  deleteObject,
  uploadBytesResumable,
  getDownloadURL,
  updateDoc,
  db,
  ref,
  doc
} from "@/firebase";

const EditProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState(currentUser.displayName);
  const [err, setErr] = useState(false);
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  const handleImageChange = (e) => {
    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    setAvatar(e.target.files[0]);
  };

  const updateProfile = async () => {
    const storageRef = ref(storage, currentUser.uid);
    await storageRef.getDownloadURL().then(()=>{});
    try {
      await deleteObject(storageRef).then(async () => {
        try{
        await uploadBytesResumable(storageRef, avatar).then(() => {
          getDownloadURL(storageRef).then(async (downloadUrl) => {
            await updateProfile(currentUser, {
              name,
              photoURL: downloadUrl,
            });
            await updateDoc(doc(db, "users", currentUser.uid), {
              name,
              photoURL: downloadUrl,
            });
          });
        })}catch(err){
          setErr(true);
        };
      });
    } catch (err) {
        await uploadBytesResumable(storageRef, avatar).then(() => {
          getDownloadURL(storageRef).then(async (downloadUrl) => {
            await updateProfile(currentUser, {
              name,
              photoURL: downloadUrl,
            });
            await updateDoc(doc(db, "users", currentUser.uid), {
              name,
              photoURL: downloadUrl,
            });
          });
        })
        setErr(false);
        return
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Avatar>
          <AvatarImage src={currentUser.photoURL} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
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
          <Button type="submit" className="w-full" onClick={updateProfile}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
