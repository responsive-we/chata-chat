import React, { useState } from "react";
import "../styles/auth.css";
import Add from "../assets/addAvatar.png";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import google from "../assets/google.png";
import {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  updateProfile,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  doc,
  setDoc,
  db,
  storage,
  getDoc
} from "../firebase";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const ErrorDisplay = ({ err }) => (
  <div className="error__display">
    <span>{err}</span>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const styleClass = isSignUp ? "cont s--signup" : "cont";

//Creating acount using email and password
  const signUpWithEmailAndPassword = async (
    auth,
    { email, password, name },
  ) => {
    try {
      //creat a user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const storageRef = ref(storage, res.user.uid);
      await uploadBytesResumable(storageRef, avatar).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile with the name and avatar(photoURL)
            await updateProfile(res.user, {
              name,
              photoURL: downloadURL,
            });
            //create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              name,
              email,
              photoURL: res.user.photoURL,
              friends: [],
              groups: [],
            });
            navigate("/");
          } catch (err) {
            console.error(err);
            setErr(true);
          }
        });
      });
    } catch (error) {
      console.error(error);
      setErr(true);
    }
  };
  // Sign in with email and password
  const signInUser = async (auth, { email, password }) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      console.log(res.user);
    } catch (error) {
      setErr(true);
    }
  };

  // Function to continue with google
  const continueWithGoogle = async () => {
    auth.useDeviceLanguage();
    const res = await signInWithPopup(auth, googleProvider);
    const userDocRef = doc(db, "users", res.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    //create user on firestore
    if (!userDocSnap.exists()) {
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      name: res.user.displayName,
      email: res.user.email,
      photoURL: res.user.photoURL,
      friends: [],
      groups: [],
    });

    navigate("/");
  }
    navigate("/");
  };

  // Function to handle avatar
  const handleAvatar = (e) => {
    setAvatar(e.target.files[0]);
    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };
  
  // Defining validation schema using yup (for signup form)
  const signUpSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
    email: Yup.string()
      .email("Please enter a valid email")
      .required("This field is required"),
    password: Yup.string()
      .required("This field is required")
      .min(8, "Pasword must be 8 or more characters")
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])\w+/,
        "Password ahould contain at least one uppercase and lowercase character"
      )
      .matches(/\d/, "Password should contain at least one number")
      .matches(
        /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/,
        "Password should contain at least one special character"
      ),
  });

  // Defining validation schema using yup (for signin form)
  const signInSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email")
      .required("This field is required"),
    password: Yup.string()
      .required("This field is required")
      .min(8, "Pasword must be 8 or more characters")
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])\w+/,
        "Password ahould contain at least one uppercase and lowercase character"
      )
      .matches(/\d/, "Password should contain at least one number")
      .matches(
        /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/,
        "Password should contain at least one special character"
      ),
  });

  //Using formik with validation schema
  const formik = useFormik({
    initialValues: {
      name,
      email,
      password,
    },
    validationSchema: isSignUp ? signUpSchema : signInSchema,
    onSubmit: async (values, { resetForm }) => {
      if (isSignUp) {
        await signUpWithEmailAndPassword(auth, values);
        resetForm()
      } else {
        await signInUser(auth, values);
        resetForm()
      }
    },
  });

const SignInForm=()=>(
  <form onSubmit={formik.handleSubmit}>
  <div className="form sign-in">
    <h2>Welcome</h2>
    <label>
      <span>Email</span>
      <input
        onChange={formik.handleChange}
        type="email"
        name="email"
        value={formik.values.email}
      />
      {formik.errors.email && <ErrorDisplay err={formik.errors.email} />}
    </label>
    <label className="mb-3">
      <span>Password</span>
      <input
        onChange={formik.handleChange}
        type="password"
        name="password"
      />
    </label>
    {err && <ErrorDisplay err="Invalid credentials" />}
    <hr/>
    <div className="flex justify-center items-center flex-col">
    <button type="submit" className=" mt-4 h-9 w-28 bg-transparent text-white cursor-pointer border-solid border-white border-2 "> 
      Sign In
    </button>
    <div className="continue__with__wrapper">
      <button type="button" className="continue__with" onClick={continueWithGoogle}>
        <img src={google} alt="" />
        <span>Continue with Google</span>
      </button>
    </div>
    </div>
  </div>
</form>
)

const SignUpForm=()=>(
  <form onSubmit={formik.handleSubmit}>
  <div className="form sign-up">
    <h2>Create your Account</h2>
    <label>
      <span>Name</span>
      <input
        onChange={formik.handleChange}
        type="text"
        name="name"
        value={formik.values.name}
      />
      {formik.errors.name && <ErrorDisplay err={formik.errors.name} />}
    </label>
    <label>
      <span>Email</span>
      <input
        onChange={formik.handleChange}
        type="email"
        name="email"
        value={formik.values.email}
      />
      {formik.errors.email && (
        <ErrorDisplay err={formik.errors.email} />
      )}
    </label>
    <label>
      <span>Password</span>
      <input
        onChange={formik.handleChange}
        type="password"
        name="password"
        value={formik.values.password}
      />
      {formik.errors.password && (
        <ErrorDisplay err={formik.errors.password} />
      )}
    </label>
    <input
      style={{ display: "none" }}
      accept="image/*"
      name="avatar"
      onChange={handleAvatar}
      type="file"
      id="file"
    />
    <label htmlFor="file" className="labelForFile mb-3">
      <Avatar>
        {avatarUrl &&
        <AvatarImage src={avatarUrl}/>}
        <PlusCircledIcon height={30} width={30}/>
      </Avatar>
      {/* <img src={avatarUrl ? avatarUrl : Add} alt="Avatar" className="" /> */}
      <span className="ml-2">{avatar ? "Looking good !" : "Add an avatar"}</span>
    </label>
    {err && (
      <ErrorDisplay err="Something went wrong, Could not Sign up. Please try again later" />
    )}

    <hr />
    <div className="flex justify-center items-center flex-col">
    <button type="submit" className="mt-4 h-9 w-28 bg-transparent text-white cursor-pointer border-solid border-white border-2 ">
      Sign Up
    </button>
    <div className="continue__with__wrapper">
      <button
        className="continue__with"
        type="button"
        onClick={continueWithGoogle}
      >
        <img src={google} alt="" />
        <span>Continue with Google</span>
      </button>
    </div>
    </div>
  </div>
</form>
  )
  return (
    <div className={`bg-slate-700 ${styleClass}`}>
  {isSignUp?<SignUpForm/>:<SignInForm/>}
      <div className="sub-cont">
        <div className="img">
          <div className="img__text m--up">
            <h3>Don't have an account? Please Sign up!</h3>
          </div>
          <div className="img__text m--in">
            <h3>If you already have an account, just sign in.</h3>
          </div>
          <div className="img__btn" onClick={toggleSignUp}>
            <span className="m--up">Sign Up</span>
            <span className="m--in">Sign In</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
