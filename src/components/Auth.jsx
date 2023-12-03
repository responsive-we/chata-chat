import React, { useState } from "react";
import "../styles/auth.css";
import Add from "../assets/addAvatar.png";
import google from "../assets/google.png";
import apple from "../assets/apple.png";
import {auth,createUserWithEmailAndPassword,googleProvider,signInWithPopup,signInWithEmailAndPassword,updateProfile} from "../firebase";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";


const ErrorDisplay = ({ err }) => (
    <div className="error__display">
      <span>{err}</span>
    </div>
)

const Auth = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  //Using validdation with formik and yup

  const signUpWithEmailAndPassword = async(auth,{email,password,name},avatarUrl) => {
    try{
    const res= await createUserWithEmailAndPassword(auth, email, password)
    console.log(res.user);
    setPassword("");
    setEmail("");
    setAvatar("");
    setName("");
    setAvatarUrl("");
    navigate("/")
  }
  catch{
    setErr(true);
  }}
  // Sign in with email and password
  const signInUser = async(auth,{email,password}) => {
    try {
      console.log("signInUser called with values:", email, password);
      const res= await signInWithEmailAndPassword(auth, email, password)
      console.log(res.user);
    } catch (error) {
      setErr(true);
    }
  }
  // Defingin validation schema using yup
  const signUpSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
    email: Yup.string().email("Please enter a valid email").required("This field is required"),
    password: Yup.string()
      .required("This field is required")
      .min(8, "Pasword must be 8 or more characters")
      .matches(/(?=.*[a-z])(?=.*[A-Z])\w+/, "Password ahould contain at least one uppercase and lowercase character")
      .matches(/\d/, "Password should contain at least one number")
      .matches(/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/, "Password should contain at least one special character"),
  });
  const signInSchema = Yup.object().shape({
    email: Yup.string().email("Please enter a valid email").required("This field is required"),
    password: Yup.string()
      .required("This field is required")
      .min(8, "Pasword must be 8 or more characters")
      .matches(/(?=.*[a-z])(?=.*[A-Z])\w+/, "Password ahould contain at least one uppercase and lowercase character")
      .matches(/\d/, "Password should contain at least one number")
      .matches(/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/, "Password should contain at least one special character"),
  });

  const formik = useFormik({
    initialValues: {
      name,
      email,
      password
    },
    validationSchema:isSignUp ? signUpSchema : signInSchema,
    onSubmit: async(values,{resetForm}) => {
      console.log("Form submitted with values:", values);
      if (isSignUp) {
        await signUpWithEmailAndPassword(auth, values);
      } else {
        console.log(values);
        await signInUser(auth, values);
      }
    },
  });
  // Creating User with Email and Password
  // Function to handle avatar
  const handleAvatar = (e) => {
    setAvatar((e.target.files[0]))
    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
  }
  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };
  // Function to continue with google 
  const continueWithGoogle = async() => {
    auth.useDeviceLanguage();
    const res = await signInWithPopup(auth, googleProvider);
    setNewUser({name:res.user.displayName,email:res.user.email,photoURL:res.user.photoURL});
    navigate("/");
  }
  const styleClass = isSignUp ? "cont s--signup" : "cont";
  
  return (
    <div className={styleClass}>
        <form  onSubmit={formik.handleSubmit}>
      <div className="form sign-in">
        <h2>Welcome</h2>
        <label>
          <span>Email</span>
          <input onChange={formik.handleChange} type="email" name="email" value={formik.values.email}   />
          {formik.errors.email  && <ErrorDisplay err={formik.errors.email} />}
        </label>
        <label>
          <span>Password</span>
          <input onChange={formik.handleChange} type="password" name="password" />
        </label>
        {err && <ErrorDisplay err="Invalid credentials" />}
    
        <button type="submit" className="submit">
          Sign In
        </button>
        <hr />
        <div className="continue__with__wrapper">
            <button className="continue__with" onClick={continueWithGoogle}>
              <img src={google} alt="" />
              <span>Continue with Google</span>
            </button>
          </div>
      </div>
      </form>
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
        <form onSubmit={formik.handleSubmit}>
        <div className="form sign-up">
          <h2>Create your Account</h2>
          <label>
            <span>Name</span>
            <input onChange={formik.handleChange}  type="text" name="name" value={formik.values.name}   />
            {formik.errors.name  && <ErrorDisplay err={formik.errors.name} />}
          </label>
          <label>
            <span>Email</span>
            <input onChange={formik.handleChange} type="email" name="email" value={formik.values.email} />
            {formik.errors.email  && <ErrorDisplay err={formik.errors.email} />}
          </label>
          <label>
            <span>Password</span>
            <input onChange={formik.handleChange} type="password" name="password" value={formik.values.password}  />
            {formik.errors.password  && <ErrorDisplay err={formik.errors.password} />}
          </label>
          <input style={{ display: "none" }} name="avatar" onChange={handleAvatar} accept="image/*" type="file" id="file" />
          <label htmlFor="file" className="labelForFile">
            <img src={avatarUrl?avatarUrl:Add} alt="Avatar" />
            <span>{avatar?"Looking good": "Add an avatar"}</span>
          </label>
          {err && <ErrorDisplay err="Something went wrong, Could not Sign up. Please try again later" />}
          <button type="submit" className="submit">
            Sign Up
          </button>
          <hr />
          <div className="continue__with__wrapper">
            <button className="continue__with" type="button" onClick={continueWithGoogle}>
              <img src={google} alt="" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
