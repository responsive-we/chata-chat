import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthContext } from "@/context/AuthContext";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { ref } from "firebase/database";
import {
  db,
  query,
  collection,
  where,
  getDocs,
  setDoc,
  doc,
  set,
  chatDb,
} from "@/firebase";
const AddFriend = () => {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [sameUser, setSameUser] = useState(false);
  const [err, setErr] = useState(false);
  const [friendExist, setFriendExist] = useState(false);
  const { currentUser, setCombinedId, currentUserData } =
    useContext(AuthContext);
  const handleChange = (e) => {
    setEmail(e.target.value);
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query(collection(db, "users"), where("email", "==", email));
    try {
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    } catch (err) {
      setErr(true);
    }
  };

  const addFriend = async () => {
    if (email === currentUser.email) {
      setSameUser(true);
      return;
    }
    if (currentUserData.friends.includes(user.uid)) {
      setFriendExist(true);
      setEmail("");
      return;
    }
    const combinedId =
      currentUser.uid > user.uid
        ? `${currentUser.uid}+${user.uid}`
        : `${user.uid}+${currentUser.uid}`;
    const friends = Array.isArray(currentUserData.friends)
      ? [...currentUserData.friends, user.uid]
      : [user.uid];
    await setDoc(
      doc(db, "users", currentUser.uid),
      { friends },
      { merge: true }
    );
    await set(ref(chatDb, "chats/" + combinedId), {});
    setCombinedId(combinedId);
    setEmail("");
    setUser(null);
    window.location.reload(false);
  };
  return (
    <div className="w-full">
      <div className="flex">
        <Input
          type=" email"
          onChange={handleChange}
          value={email}
          placeholder="Email"
          className=" w-11/12"
        />
        <Button
          onSubmit={handleSearch}
          size="icon"
          onClick={handleSearch}
          type="submit"
          className="w-1/12"
        >
          <MagnifyingGlassIcon />
        </Button>
      </div>
      {sameUser && (
        <Alert className="mt-4 bg-transparent">
          <ExclamationTriangleIcon color="red" className="h-4 w-4" />
          <AlertTitle>Friend can not be added</AlertTitle>
          <AlertDescription>
            You can not add yourself as a friend.
          </AlertDescription>
          <Button
            onClick={() => {
              setSameUser(false);
              setEmail("");
              setUser(null);
            }}
          >
            Ok
          </Button>
        </Alert>
      )}
      {friendExist && (
        <Alert className="mt-4 bg-transparent">
          <ExclamationTriangleIcon color="red" className="h-4 w-4" />
          <AlertTitle className="text-white">Friend can not be added</AlertTitle>
          <AlertDescription className="text-white"  >
            Friend already exist in your friend list.
          </AlertDescription>
          <Button
            onClick={() => {
              setFriendExist(false);
              setEmail("");
              setUser(null);
            }}
          >
            Ok
          </Button>
        </Alert>
      )}

      {user && !sameUser && !friendExist && (
        <div className="bg-slate mt-2 pr-2 pl-1 pt-1">
          <div
            className="flex justify-center items-center mb-2"
            disabled={true}
          >
            <div className="mr-2 w-10">
              <Avatar>
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="">{user.name}</h2>
            <PlusCircledIcon
              height={24}
              width={24}
              className=" cursor-pointer"
              onClick={addFriend}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFriend;
