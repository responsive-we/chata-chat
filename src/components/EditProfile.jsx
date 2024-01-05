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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  PlusCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import {ref as chatRef,remove} from "firebase/database"
import {
  storage,
  deleteObject,
  uploadBytesResumable,
  getDownloadURL,
  updateDoc,
  db,
  ref,
  doc,
  updateProfile as updateUserProfile,
  deleteUser,
  deleteDoc,
  arrayRemove,
  chatDb,
  get
} from "@/firebase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {TrashIcon } from "@radix-ui/react-icons";

const ShowAlertDialog = ({setAlertType,setOpen,open,currentUserData,currentUser,setloading,alertType})=>{
  const deleteChats = async (userId) => {
    // Get a reference to the chats in the Realtime Database
    const chatsRef = chatRef(chatDb, 'chats');
  
    // Get all chats
    const snapshot = await get(chatsRef);
  
    // Check each chat to see if its name includes the user's ID
    const chatDeletePromises = [];
    snapshot.forEach((childSnapshot) => {
      const chatName = childSnapshot.key;
      if (chatName.includes(userId)) {
        // If the chat name includes the user's ID, delete it
        const friendsChatRef = chatRef(chatDb, `chats/${chatName}`);
        chatDeletePromises.push(remove(friendsChatRef));
      }
    });
  
    // Wait for all chat delete promises to resolve
    await Promise.all(chatDeletePromises);
  };
  const deleteProfile = async () => {
    try{
      setloading(true)
      const friendDeletePromises = currentUserData.friends.map((friend) => updateDoc(doc(db, "users", friend), {
        friends: arrayRemove(currentUserData.uid)
      } , { merge: true}));
      const groupDeletePromises = currentUserData.groups.map((group) => updateDoc(doc(db, "groups", group), {
        members: arrayRemove(currentUserData.uid)
      } , { merge: true}));
      await deleteChats(currentUserData.uid);
      await Promise.all([...friendDeletePromises, ...groupDeletePromises]);
      const storageRef = ref(storage, currentUserData.uid);
getDownloadURL(storageRef).then(async (url) => {
        if (url){
        await deleteObject(storageRef).then(async () => {
          await deleteUser(currentUser)
          await deleteDoc(doc(db, "users", currentUserData.uid));
          setAlertType("")
          setOpen(false)
          window.location.reload(false);
        })
      }}).catch(async (err) => {
        await deleteUser(currentUser)
          console.error(err)
          await deleteDoc(doc(db, "users", currentUserData.uid));
          setAlertType("")
          setOpen(false)
          window.location.reload(false);
      })
      await deleteUser(currentUser)
      await deleteDoc(doc(db, "users", currentUserData.uid));
      setAlertType("")
      setOpen(false)
      window.location.reload(false);
    }catch(err){
      console.log(err)
    }
  }
  return(
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>Deleting your profile will delete all your chats with friends and the rest of your data from our servers. This action can not be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center items-center">
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive w-52"
            onClick={() => {
              if(alertType === "deleteProfile"){
                deleteProfile()}
            }}
          >
            I understand, delete my profile
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
const EditProfile = () => {
  const { currentUser,currentUserData } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState(currentUser.displayName);
  const [err, setErr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState("");
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  const handleImageChange = (e) => {
    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    setAvatar(e.target.files[0]);
  };

  const updateProfile = async () => {
    const storageRef = ref(storage, currentUser.uid);
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
                getDownloadURL(upload.snapshot.ref).then(async (downloadUrl) => {
                  await updateUserProfile(currentUser, {
                    photoURL: downloadUrl,
                    displayName:name?name:currentUser.displayName
                  });
                  await updateDoc(doc(db, "users", currentUser.uid), {
                    photoURL: downloadUrl,
                    name:name?name:currentUser.displayName
                  });
                  window.location.reload(false);
                });
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
            await updateUserProfile(currentUser, {
              photoURL: downloadUrl,
            });
            await updateDoc(doc(db, "users", currentUser.uid), {
              photoURL: downloadUrl,
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
        await updateUserProfile(currentUser, {
          displayName: name,
        });
        await updateDoc(doc(db, "users", currentUser.uid), {
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

  return (
    <Dialog>
      {alertType==="deleteProfile" && <ShowAlertDialog  setAlertType={setAlertType} open={open} setOpen={setOpen} currentUser={currentUser} currentUserData={currentUserData} setloading={setLoading} alertType={alertType}/>}
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
          <Button type="submit" className="w-full" onClick={updateProfile} disabled={uploading===false?false:true}>
           {uploading<=100&uploading!==false?`Uploading: ${uploading}%`:loading?"Loading...":"Save changes"}
          </Button>
          <Button type="submit" className="w-full bg-destructive" onClick={()=> {setAlertType("deleteProfile")
          setOpen(true)                     
        }} disabled={loading}>
            <TrashIcon/>Delete profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
