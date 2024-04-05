import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import google from "../assets/google.png";
const SignUpForm=({formik,err,handleAvatar,avatarUrl,avatar,continueWithGoogle,ErrorDisplay})=>{
    return(
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
      }
export default SignUpForm