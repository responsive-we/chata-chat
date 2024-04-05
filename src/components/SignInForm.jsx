import React from 'react'
import google from "../assets/google.png";

const SignInForm=({formik,err,continueWithGoogle,ErrorDisplay})=>{
    return(
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
          value={formik.values.password}
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
}

export default SignInForm