import React,{useState} from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
const AddFriend = () => {
  const [userName, setUserName] = useState("");
  const handleChange = (e) => {
    setUserName(e.target.value);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    
  }
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
    <Input type="text" onChange={handleChange} value={userName} placeholder="Username" />
    <Button onSubmit={handleSearch} size="icon" type="submit"><MagnifyingGlassIcon/></Button>
  </div>
  )
}

export default AddFriend