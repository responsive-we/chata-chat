import React, { useState } from "react";
import "../styles/auth.css";

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
  getDoc,
} from "../firebase";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { SignInForm, SignUpForm } from "./";

const ErrorDisplay = ({ err }) => (
  <div className="error__display">
    <span>{err}</span>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const styleClass = isSignUp ? "cont s--signup" : "cont";

  const signUpWithEmailAndPassword = async (
    auth,
    { email, password, name }
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const storageRef = ref(storage, res.user.uid);
      await uploadBytesResumable(storageRef, avatar);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(res.user, {
        name,
        photoURL: downloadURL,
      });
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name,
        email,
        photoURL: res.user.photoURL,
        friends: [],
        groups: [],
      });
      navigate("/");
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
      name: "",
      email: "",
      password: "",
    },
    validationSchema: isSignUp ? signUpSchema : signInSchema,
    onSubmit: async (values, { resetForm }) => {
      if (isSignUp) {
        await signUpWithEmailAndPassword(auth, values);
        resetForm();
      } else {
        await signInUser(auth, values);
        resetForm();
      }
    },
  });

  return (
    <div className={`bg-slate-700 ${styleClass}`}>
      {isSignUp ? (
        <SignUpForm
          formik={formik}
          handleAvatar={handleAvatar}
          avatarUrl={avatarUrl}
          err={err}
          avatar={avatar}
          continueWithGoogle={continueWithGoogle}
          ErrorDisplay={ErrorDisplay}
        />
      ) : (
        <SignInForm
          formik={formik}
          continueWithGoogle={continueWithGoogle}
          err={err}
          ErrorDisplay={ErrorDisplay}
        />
      )}
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
