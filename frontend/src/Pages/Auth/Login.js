import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { loginAPI, forgotPasswordSendOtpAPI, forgotPasswordResetAPI } from "../../utils/ApiRequest";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPwd, setFpNewPwd] = useState('');
  const [fpStep, setFpStep] = useState(1); // 1: email, 2: otp+newpwd
  const [fpLoading, setFpLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = values;
    setLoading(true);

    try {
      const { data } = await axios.post(loginAPI, { email, password });

      if (data.success === true) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast.success(data.message, toastOptions);
        navigate("/");
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPwd = () => {
    setShowForgotPwd(true);
    setFpEmail(''); setFpOtp(''); setFpNewPwd(''); setFpStep(1);
  };

  const handleCloseForgotPwd = () => {
    setShowForgotPwd(false);
    setFpEmail(''); setFpOtp(''); setFpNewPwd(''); setFpStep(1);
  };

  const handleSendFpOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail) { toast.error('Email is required', toastOptions); return; }
    setFpLoading(true);
    try {
      const res = await axios.post(forgotPasswordSendOtpAPI, { email: fpEmail });
      if (res.data.success) {
        toast.success('OTP sent to your email', toastOptions);
        setFpStep(2);
      } else {
        toast.error(res.data.message || 'Failed to send OTP', toastOptions);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP', toastOptions);
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPwd = async (e) => {
    e.preventDefault();
    if (!fpOtp || !fpNewPwd) { toast.error('All fields are required', toastOptions); return; }
    if (fpNewPwd.length < 6) { toast.error('Password must be at least 6 characters', toastOptions); return; }
    setFpLoading(true);
    try {
      const res = await axios.post(forgotPasswordResetAPI, { email: fpEmail, otp: fpOtp, newPassword: fpNewPwd });
      if (res.data.success) {
        toast.success('Password reset successfully', toastOptions);
        handleCloseForgotPwd();
      } else {
        toast.error(res.data.message || 'Failed to reset password', toastOptions);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password', toastOptions);
    } finally {
      setFpLoading(false);
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
          <Col md={{ span: 6, offset: 3 }}>
            <h1 className="text-center mt-5">
              <AccountBalanceWalletIcon
                sx={{ fontSize: 40, color: "white" }}
                className="text-center"
              />
            </h1>
            <h2 className="text-white text-center">Login</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail" className="mt-3">
                <Form.Label className="text-white">Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  onChange={handleChange}
                  value={values.email}
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label className="text-white">Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
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
                <span onClick={handleForgotPwd} style={{ cursor: 'pointer', color: '#fff', textDecoration: 'underline' }}>
                  Forgot Password?
                </span>

                <Button
                  type="submit"
                  className="text-center mt-3 btnStyle"
                  disabled={loading}
                >
                  {loading ? "Signing…" : "Login"}
                </Button>

                <p className="mt-3" style={{ color: "#9d9494" }}>
                  Don't Have an Account?{" "}
                  <Link to="/register" className="text-white lnk">
                    Register
                  </Link>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
        <ToastContainer />
        <Modal show={showForgotPwd} onHide={handleCloseForgotPwd} centered>
          <Modal.Header closeButton><Modal.Title>Forgot Password</Modal.Title></Modal.Header>
          <Modal.Body>
            {fpStep === 1 ? (
              <Form onSubmit={handleSendFpOtp}>
                <Form.Group className="mb-3" controlId="fpEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} required autoFocus />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={fpLoading} style={{ width: '100%' }}>
                  {fpLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleResetPwd}>
                <Form.Group className="mb-3" controlId="fpOtp">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control type="text" value={fpOtp} onChange={e => setFpOtp(e.target.value)} required autoFocus />
                </Form.Group>
                <Form.Group className="mb-3" controlId="fpNewPwd">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" value={fpNewPwd} onChange={e => setFpNewPwd(e.target.value)} required minLength={6} />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={fpLoading} style={{ width: '100%' }}>
                  {fpLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Form>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Login;
