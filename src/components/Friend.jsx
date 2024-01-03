import React, { useContext, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "@/context/AuthContext";
import { query, db, where, getDocs, collection,doc,arrayRemove,updateDoc,chatDb } from "@/firebase";
import {ref,remove} from "firebase/database"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
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
import { MinusCircledIcon, TrashIcon } from "@radix-ui/react-icons";

const ShowAlertDialog = ({ actionText, descriptionText, open, setOpen, alertType,combinedId,currentUser,uid}) => {
  const removeFriend = async () => {
    try{
    await updateDoc(doc(db, "users", currentUser.uid), {
      friends: arrayRemove(uid)
    }, { merge: true})
    await updateDoc(doc(db, "users", uid), {
      friends: arrayRemove(currentUser.uid)
    }, { merge: true})
    const chatRef = ref(chatDb, `chats/${combinedId}/`);
    await remove(chatRef)
  }catch(error){
    console.log(error)}
  };
  const deleteChats = async () => {
    const chatRef = ref(chatDb, `chats/${combinedId}/`);
    await remove(chatRef)
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{descriptionText}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center items-center">
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive w-52"
            onClick={() => {
              if(alertType === "removeFriend"){
                removeFriend()
              }else if(alertType === "deleteChats"){
                deleteChats()
              }
              setOpen(false);
            }}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
const Friend = ({ name, photoURL, uid }) => {
  const [open, setOpen] = useState(false);
  const { setCombinedId, currentUser, setActiveFriend, setActiveGroup } =
    useContext(AuthContext);
  const [alertType, setAlertType] = useState("");
  const combinedId =
    currentUser.uid > uid
      ? `${currentUser.uid}+${uid}`
      : `${uid}+${currentUser.uid}`;
  const handleClickOnFriend = async (uid) => {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setActiveFriend(doc.data());
      });
    } catch (error) {
      console.log("error");
    }
    setCombinedId(combinedId);
    setActiveGroup({});
  };
  return (
    <ContextMenu>
      {alertType && alertType === "removeFriend" && (
        <ShowAlertDialog
          actionText="Remove"
          descriptionText="This will remove the friend selected from your friend list and delete all the chats. This action can not be undone."
          open={open}
          setOpen={setOpen}
          alertType={alertType}
          uid={uid}
          combinedId={combinedId}
          currentUser={currentUser}
          />
          )}
      {alertType && alertType === "deleteChats" && (
        <ShowAlertDialog
        actionText="Delete"
        descriptionText="This will delete all the chats witho you from the selected friend. This action can not be undone."
        open={open}
        setOpen={setOpen}
        alertType={alertType}
        uid={uid}
        combinedId={combinedId}
        currentUser={currentUser}
        />
      )}
      <ContextMenuTrigger>
        <div
          className="bg-slate mt-2 pr-2 pl-1 pt-1 cursor-pointer"
          onClick={() => handleClickOnFriend(uid)}
        >
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className="bg-destructive"
          onClick={() => {
            setAlertType("removeFriend");
            setOpen(true);
          }}
        >
          Remove Friend <MinusCircledIcon className="ml-2" />
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="bg-slate"
          onClick={() => {
            setAlertType("deleteChats");
            setOpen(true);
          }}
        >
          Delete chats <TrashIcon className="ml-2" />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Friend;
