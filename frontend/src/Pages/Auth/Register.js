// src/pages/auth/register.js

import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./auth.css";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerAPI, sendOtpAPI, verifyOtpAPI } from "../../utils/ApiRequest";
import axios from "axios";

const Register = () => {
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: false,
    draggable: true,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!values.email) {
      toast.error("Please enter your email first", toastOptions);
      return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      toast.error("Please enter a valid email address", toastOptions);
      return;
    }
    try {
      setLoadingOtp(true);
      const response = await axios.post(sendOtpAPI, { email: values.email });
      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent to your email", toastOptions);
      } else {
        toast.error(response.data.message || "Failed to send OTP", toastOptions);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP", toastOptions);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP", toastOptions);
      return;
    }
    try {
      setLoadingVerifyOtp(true);
      const response = await axios.post(verifyOtpAPI, { email: values.email, otp });
      if (response.data.success) {
        setIsEmailVerified(true);
        toast.success("Email verified successfully", toastOptions);
      } else {
        toast.error(response.data.message || "OTP verification failed", toastOptions);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed", toastOptions);
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = values;

    if (!name || !email || !password) {
      toast.error("All fields are required", toastOptions);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", toastOptions);
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please verify your email with OTP before registering", toastOptions);
      return;
    }

    try {
      setLoadingRegister(true);
      const response = await axios.post(registerAPI, { name, email, password });
      const data = response.data;

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast.success(data.message || "Registered successfully", toastOptions);
        navigate("/");
      } else {
        toast.error(data.message || "Registration failed", toastOptions);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong. Try again.",
        toastOptions
      );
    } finally {
      setLoadingRegister(false);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#000" } },
          fpsLimit: 60,
          particles: {
            number: { value: 200, density: { enable: true, value_area: 800 } },
            color: { value: "#ffcc00" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: { enable: true, minimumValue: 1 } },
            links: { enable: false },
            move: { enable: true, speed: 2 },
            life: {
              duration: { sync: false, value: 3 },
              count: 0,
              delay: { random: { enable: true, minimumValue: 0.5 }, value: 1 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          zIndex: -1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <Container className="mt-5" style={{ position: "relative", zIndex: 2 }}>
        <Row>
          <h1 className="text-center">
            <AccountBalanceWalletIcon
              sx={{ fontSize: 40, color: "white" }}
              className="text-center"
            />
          </h1>
          <h1 className="text-center text-white">Welcome to Expense Management System</h1>
          <Col md={{ span: 6, offset: 3 }}>
            <h2 className="text-white text-center mt-5">Registration</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicName" className="mt-3">
                <Form.Label className="text-white">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={values.name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formBasicEmail" className="mt-3">
                <Form.Label className="text-white">Email address</Form.Label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={values.email}
                    onChange={handleChange}
                    disabled={isEmailVerified}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleSendOtp}
                    disabled={loadingOtp || isEmailVerified}
                    style={{ minWidth: 100 }}
                  >
                    {loadingOtp ? "Sending..." : (otpSent && !isEmailVerified ? "Resend OTP" : "Send OTP")}
                  </Button>
                </div>
              </Form.Group>

              {otpSent && !isEmailVerified && (
                <Form.Group controlId="formBasicOtp" className="mt-3">
                  <Form.Label className="text-white">Enter OTP</Form.Label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Form.Control
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                    />
                    <Button
                      variant="success"
                      onClick={handleVerifyOtp}
                      disabled={loadingVerifyOtp}
                      style={{ minWidth: 100 }}
                    >
                      {loadingVerifyOtp ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                </Form.Group>
              )}

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label className="text-white">Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={values.password}
                  onChange={handleChange}
                  disabled={!isEmailVerified}
                />
              </Form.Group>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
                className="mt-4"
              >
                <Link to="/forgotPassword" className="text-white lnk">
                  Forgot Password?
                </Link>

                <Button
                  type="submit"
                  className="text-center mt-3 btnStyle"
                  disabled={loadingRegister}
                >
                  {loadingRegister ? "Registering..." : "Signup"}
                </Button>

                <p className="mt-3" style={{ color: "#9d9494" }}>
                  Already have an account?{" "}
                  <Link to="/login" className="text-white lnk">
                    Login
                  </Link>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Register;
