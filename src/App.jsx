import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import {Auth} from "./components";
const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
  {
    path: "/auth",
    element: <Auth/>,
  }
]);
const App= ()=> {
  return (
    <RouterProvider router={router}/>
  )
}

export default App
