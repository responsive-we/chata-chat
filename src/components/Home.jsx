import React,{useContext} from 'react'
import { Sidebar,Chat,GroupChat } from '.'
import '../styles/index.css'
import { AuthContext } from '../context/AuthContext'
const Home = () => {
  const {activeGroup,isSmallScreen,combinedId} = useContext(AuthContext);
  const isActiveGroupEmpty = Object.keys(activeGroup).length === 0;
  
  return (
    <div className='flex h-screen '>
    <Sidebar/>
    {isSmallScreen?combinedId?<Chat/>:!isActiveGroupEmpty?<GroupChat/>:null:!isActiveGroupEmpty && !isSmallScreen?<GroupChat/>:<Chat/>}
    </div>
  )
}

export default Home