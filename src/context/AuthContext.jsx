import { createContext, useEffect, useState } from "react";
import { auth,onAuthStateChanged, query ,db,where,getDocs,collection} from "@/firebase";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});
  const [friendsData, setFriendsData] = useState([]);
  const [currentUserData, setCurrentUserData] = useState({});
  const [activeFriend, setActiveFriend] = useState({});
  const [combinedId, setCombinedId] = useState("");
  const [activeGroup, setActiveGroup] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      const q= query(collection(db, "users"), where("uid", "==", user.uid));
      try{
        const querySnapshot= await getDocs(q);
        querySnapshot.forEach((doc) => {
          setCurrentUserData(doc.data());
        });
      }
      catch(error){
        console.log(error);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallScreen = windowWidth < 550;
  return (
    <AuthContext.Provider value={{ currentUser,currentUserData,combinedId,setCombinedId,activeFriend,setActiveFriend,setFriendsData,friendsData,activeGroup,setActiveGroup,isSmallScreen }}>
      {children}
    </AuthContext.Provider>
  );
};