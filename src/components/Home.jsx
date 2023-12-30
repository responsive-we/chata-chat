import React,{useContext} from 'react'
import { Sidebar,Chat,GroupChat } from '.'
import '../styles/index.css'
import { AuthContext } from '../context/AuthContext'
const Home = () => {
  const {activeGroup} = useContext(AuthContext);
  const isActiveGroupEmpty = Object.keys(activeGroup).length === 0;
  console.log(activeGroup)
  return (
    <div className='flex h-screen '>
    <Sidebar/>
    {!isActiveGroupEmpty?<GroupChat/>:<Chat/>}
    </div>
  )
}

export default Home