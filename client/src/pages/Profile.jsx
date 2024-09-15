import { useAppStore } from "../store";

const Profile = () => {
  const { userInfo } = useAppStore();
  console.log(userInfo);
  return (
    <div>
      Profile
      <div>{userInfo.email}</div>
    </div>
  );
};

export default Profile;
