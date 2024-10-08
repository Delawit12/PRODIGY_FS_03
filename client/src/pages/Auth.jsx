import victory from "../assets/victory-hand-svgrepo-com.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import login from "../assets/Fingerprint-cuate.png";
import { toast } from "sonner";
import axios from "../lib/api-client";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
const Auth = () => {
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("password is required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error(" Password and confirm password should be the same");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      const response = await axios.post(
        "api/user/login",
        { email, password },
        { withCredentials: true }
      );
      if (response.data.user._id) {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) navigate("/chat");
        else navigate("/profile");
      }
    }
  };
  const handleSignUp = async () => {
    if (validateSignup()) {
      const response = await axios.post(
        "api/user/register",
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      console.log(response);
      if (response.data.status == "success") {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) navigate("/chat");
        else navigate("/profile");
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={victory} alt="victory Emoji" className="h-[60px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-4/5" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-gray-700 text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:border-b-green-400 p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signUp"
                  className="data-[state=active]:bg-transparent text-gray-700 text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:border-b-green-400 p-3 transition-all duration-300"
                >
                  SignUp
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-6" value="login">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className="rounded-full" onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>
              <TabsContent value="signUp" className="flex flex-col gap-5 ">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-2xl p-5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-2xl p-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-2xl p-5"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full" onClick={handleSignUp}>
                  Sign Up
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <img src={login} alt="login background" className="hidden xl:flex" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
