import React,{useContext, useEffect,useState} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "@/context/AuthContext";
import { query ,db,where,getDocs,collection,deleteDoc,doc,arrayRemove,updateDoc,chatDb,ref,storage,deleteObject} from "@/firebase";
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
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { ExitIcon, TrashIcon } from "@radix-ui/react-icons";
import {ref as databaseRef,remove} from "firebase/database"
//TODO: Make functionality to delete group like in Friend.jsx
// * 
const ShowAlert=({setShowAlert})=>(
  <Alert className=" w-[100%]">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <div>You can not leave this group as you are the only admin. Please add any other admin or delete the group.</div>
      <Button className="ml-2 w-full" size="icon" variant="ghost" onClick={()=>setShowAlert(false)}>OK</Button>
      </AlertDescription>
    </Alert>
)
const ShowAlertDialog = ({ actionText, descriptionText, open, setOpen, alertType,groupId,currentUser,groupData,isAdmin}) => {
  const [showAlert,setShowAlert]=useState(false);
  const deleteGroup = async () => {
    try{
      const memberPromises = groupData.members.map((member) =>
      updateDoc(doc(db, "users", member), {
        groups: arrayRemove(groupId)
      }, { merge: true})
    );

    const adminPromises = groupData.admins.map((admin) =>
      updateDoc(doc(db, "users", admin), {
        groups: arrayRemove(groupId)
      }, { merge: true})
    );

    await Promise.all([...memberPromises, ...adminPromises]);
    await deleteDoc(doc(db, "groups", groupId));
    const chatRef = databaseRef(chatDb, `groups/${groupId}/`);
    await remove(chatRef);
    const storageRef = ref(storage, groupId);
    await deleteObject(storageRef);
    window.location.reload(false);
    setOpen(false);
  }catch(error){
    console.log(error)}
  };
  const deleteChats = async () => {
    const chatRef = databaseRef(chatDb, `groups/${groupId}/`);
    await remove(chatRef)
    setOpen(false);
    window.location.reload(false);
  };
  const leaveGroup = async () => {
    try{
      if (isAdmin){
        if(groupData.admins.length===1){
          setShowAlert(true);
          return
        }
        else{
        await updateDoc(doc(db, "groups", groupId), {
          admins: arrayRemove(currentUser.uid),
        })}
      }else{
        await updateDoc(doc(db, "groups", groupId), {
          members: arrayRemove(currentUser.uid),
        });
      }
      await updateDoc(doc(db, "users", currentUser.uid), {
        groups: arrayRemove(groupId),
      });
      setOpen(false);
      window.location.reload(false);
    }catch(error){
      console.log(error);
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {showAlert && <ShowAlert setShowAlert={setShowAlert}/>}
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
              if(alertType === "deleteGroup"){
                deleteGroup()
              }else if(alertType === "deleteChats"){
                deleteChats()
              }else if(alertType === "leaveGroup"){
                leaveGroup()
              }
            }}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
const Group = ({ name, photoURL,groupId }) => {
  const {setActiveGroup,setActiveFriend,currentUser}=useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [alertType, setAlertType] = useState("");
    const [groupData,setGroupData]=useState({});
    const [isAdmin,setIsAdmin]=useState(false);
    useEffect(()=>{
      const fetchGroupData=async()=>{
        const q= query(collection(db, "groups"), where("groupId", "==", groupId));
        try{
          const querySnapshot= await getDocs(q);
          querySnapshot.forEach((doc) => {
            setGroupData(doc.data());
            doc.data().admins.forEach((admin)=>{if(admin===currentUser.uid){setIsAdmin(true)}})
          });
        }
        catch(error){
          console.error(error);
        }
      }
      fetchGroupData();
    },[groupId])
    const handleClickOnGroup= async()=>{
        setActiveGroup(groupData);
        setActiveFriend({});
      }

  return (
    <ContextMenu>
      {alertType && alertType === "deleteChats" && (
        <ShowAlertDialog
        actionText="Delete"
        descriptionText="This will delete all the chats in the selected group. This action can not be undone."
        open={open}
        setOpen={setOpen}
        alertType={alertType}
        groupData={groupData}
        groupId={groupId}
        />
      )}
      {alertType && alertType === "deleteGroup" && (
        <ShowAlertDialog
        actionText="Delete Group and Chats"
        descriptionText="This will delete all the chats in the selected group along with the group. This action can not be undone."
        open={open}
        setOpen={setOpen}
        alertType={alertType}
     
        currentUser={currentUser}
        groupData={groupData}
        groupId={groupId}
        />
        )}
      {alertType && alertType === "leaveGroup" && (
        <ShowAlertDialog
        actionText="Leave Group"
        descriptionText="This will remove you from the group.To join this group again you have to request the admins. This action can not be undone."
        open={open}
        setOpen={setOpen}
        alertType={alertType}
        isAdmin={isAdmin}
        currentUser={currentUser}
        groupData={groupData}
        groupId={groupId}
        />
      )}
      
      <ContextMenuTrigger>
    <div className="bg-slate mt-2 pr-2 pl-1 pt-1 cursor-pointer"onClick={()=>handleClickOnGroup()}  >
      <div className="flex justify-center items-center mb-2 ">
        <div className="mr-2 w-10">
          <Avatar>
            <AvatarImage src={photoURL} />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
        </div>
        <h2 className="">{name}</h2>
      </div>
    </div>
    </ContextMenuTrigger>
    <ContextMenuContent>
    <ContextMenuItem
          className="bg-slate"
          onClick={() => {
            setAlertType("leaveGroup");
            setOpen(true);
          }}
          >
          Leave Group <ExitIcon className="ml-2" />
        </ContextMenuItem>
        <ContextMenuSeparator />
      <ContextMenuItem
          className="bg-destructive mb-2"
          onClick={() => {
            setAlertType("deleteChats");
            setOpen(true);
          }}
          disabled={!isAdmin}
          >
          Delete chats <TrashIcon className="ml-2" />
        </ContextMenuItem>
      <ContextMenuItem
          className="bg-destructive"
          onClick={() => {
            setAlertType("deleteGroup");
            setOpen(true);
          }}
          disabled={!isAdmin}
          >
          Delete group <TrashIcon className="ml-2" />
        </ContextMenuItem>
      
    </ContextMenuContent>
    </ContextMenu>
  );
};

export default Group;
