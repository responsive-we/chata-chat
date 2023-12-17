import React from 'react'
import { Sidebar,Chat } from '.'
import '../styles/index.css'

const Home = () => {
  return (
    <div className='flex h-screen '>
    <Sidebar/>
    <Chat/>
    </div>
  )
}

export default Home