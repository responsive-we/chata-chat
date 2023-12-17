import React,{useState,useContext} from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon,PlusCircledIcon } from '@radix-ui/react-icons'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthContext } from "@/context/AuthContext"
import { db,query,collection,where,getDocs, setDoc,doc  } from "@/firebase"
const AddFriend = () => {
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState(null); 
  const [err, setErr] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const handleChange = (e) => {
    setUserName(e.target.value);
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query(
      collection(db, "users"),
      where("name", "==", userName)
      );
      try {
        const querySnapshot = await getDocs(q);
        console.log(querySnapshot);
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
          console.log(doc.data());
        });
      } catch (err) {
        setErr(true);
      }
    
  }

  const addFriend = async () => {
    const friends = Array.isArray(currentUser.friends) ? [...currentUser.friends, user.uid] : [user.uid];
    await setDoc(doc(db, "users", currentUser.uid), { friends }, { merge: true });
    setUserName("");
    setUser(null);
  }
  return (
    <div className="w-full max-w-sm  ">
      <div className='flex space-x-2 items-center'>
    <Input type="text" onChange={handleChange} value={userName} placeholder="Username" />
    <Button onSubmit={handleSearch} size="icon" onClick={handleSearch} type="submit"><MagnifyingGlassIcon/></Button>
    </div>
    {user && (
     <div className="bg-slate mt-2 pr-2 pl-1 pt-1">
     <div className="flex justify-center items-center mb-2 ">
       <div className="mr-2 w-10">
       <Avatar>
       <AvatarImage src={user.photoURL} />
       <AvatarFallback>CN</AvatarFallback>
     </Avatar>
       </div>
       <h2 className="">{user.name}</h2>
   <PlusCircledIcon height={24} width={24} className=' cursor-pointer' onClick={addFriend}/>
     </div>
     </div>
    )}
  </div>
  )
}

export default AddFriend