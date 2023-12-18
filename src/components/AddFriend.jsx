import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthContext } from "@/context/AuthContext";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { db, query, collection, where, getDocs, setDoc, doc } from "@/firebase";
const AddFriend = () => {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [sameUser, setSameUser] = useState(false);
  const [err, setErr] = useState(false);
  const { currentUser, setCombinedId } = useContext(AuthContext);
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
    const combinedId =
      currentUser.uid > user.uid
        ? `${currentUser.uid}+${user.uid}`
        : `${user.uid}+${currentUser.uid}`;
    const friends = Array.isArray(currentUser.friends)
      ? [...currentUser.friends, user.uid]
      : [user.uid];
    await setDoc(
      doc(db, "users", currentUser.uid),
      { friends },
      { merge: true }
    );
    await setDoc(doc(db, "chats", combinedId), {});
    setCombinedId(combinedId);
    setEmail("");
    setUser(null);
  };
  return (
    <div className="w-full max-w-sm  ">
      <div className="flex space-x-2 items-center">
        <Input
          type=" email"
          onChange={handleChange}
          value={email}
          placeholder="Email"
        />
        <Button
          onSubmit={handleSearch}
          size="icon"
          onClick={handleSearch}
          type="submit"
        >
          <MagnifyingGlassIcon />
        </Button>
      </div>
      {sameUser && (
        <Alert variant="destructive" className="mt-4">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Friend can not be added</AlertTitle>
        <AlertDescription>
          You can not add yourself as a friend.
        </AlertDescription>
      </Alert>
      
      )}
      
      {user && !sameUser && (
        <div className="bg-slate mt-2 pr-2 pl-1 pt-1">
          <div className="flex justify-center items-center mb-2" disabled={true}>
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
