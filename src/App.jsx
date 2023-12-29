import React,{useContext} from "react";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import {Auth, Home} from "./components";
import {AuthContext} from "./context/AuthContext.jsx";
const App= ()=> {
  const {currentUser}=useContext(AuthContext);
  const router = createBrowserRouter([
    {
      path: "/",
      element: currentUser ? <Home/> : <Auth/>,
    }
  ]);
  return (
    <RouterProvider router={router}/>
  )
}

export default App
