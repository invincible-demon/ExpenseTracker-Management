import React, { useEffect, useState } from "react";
import "./avatar.css";
import axios from "../../utils/axiosInstance";
import { setAvatarAPI } from "../../utils/ApiRequest";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loader from "../../assets/loader.gif";
import avatars from "./avatarData"; // assume you're importing avatar URLs from a helper

const SetAvatar = () => {
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [avatarsList, setAvatarsList] = useState([]);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    theme: "dark",
  };

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    } else {
      // Simulate fetching avatars
      setAvatarsList(avatars); // replace with actual API if you use one
      setLoading(false);
    }
  }, [navigate]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const { data } = await axios.post(`${setAvatarAPI}/${user._id}`, {
        image: avatarsList[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("Avatar set successfully!", toastOptions);
        navigate("/");
      } else {
        toast.error("Failed to set avatar. Try again.", toastOptions);
      }
    } catch (error) {
      toast.error("Error while setting avatar", toastOptions);
    }
  };

  return (
    <>
      {loading ? (
        <div className="loader-container">
          <img src={loader} alt="loading" className="loader" />
        </div>
      ) : (
        <div className="avatarContainer">
          <h1 className="title">Pick an Avatar</h1>
          <div className="avatars">
            {avatarsList.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${selectedAvatar === index ? "selected" : ""
                  }`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img src={avatar} alt="avatar" />
              </div>
            ))}
          </div>
          <button onClick={setProfilePicture} className="btnStyle">
            Set Avatar
          </button>
          <ToastContainer />
        </div>
      )}
    </>
  );
};

export default SetAvatar;
