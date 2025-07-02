import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Navbar, Nav, Button, Modal, Form } from 'react-bootstrap';
import "./style.css";
import { useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Avatar from '@mui/material/Avatar';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import axios from '../utils/axiosInstance';
import { changePasswordAPI } from '../utils/ApiRequest';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();
  const handleShowLogin = () => navigate("/login");

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const dropdownRef = useRef(null);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loadingPwd, setLoadingPwd] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleChangePassword = () => {
    setShowChangePwd(true);
  };

  const handleClosePwd = () => {
    setShowChangePwd(false);
    setOldPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (!oldPwd || !newPwd || !confirmPwd) {
      toast.error('All fields are required');
      return;
    }
    if (newPwd.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('Passwords do not match');
      return;
    }
    setLoadingPwd(true);
    try {
      const res = await axios.post(changePasswordAPI, { oldPassword: oldPwd, newPassword: newPwd });
      if (res.data.success) {
        toast.success('Password changed successfully');
        handleClosePwd();
      } else {
        toast.error(res.data.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setLoadingPwd(false);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async () => { }, []);

  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: { color: { value: '#000' } },
          fpsLimit: 60,
          particles: {
            number: { value: 200, density: { enable: true, value_area: 800 } },
            color: { value: '#ffcc00' },
            shape: { type: 'circle' },
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
          position: 'fixed',
          zIndex: 0,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />

      <Navbar className="navbarCSS" collapseOnSelect expand="lg" style={{ position: 'relative', zIndex: 10 }}>
        <Navbar.Brand href="/" className="text-white navTitle">Expense Management System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ backgroundColor: "transparent", borderColor: "transparent" }}>
          <span className="navbar-toggler-icon" style={{ background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")` }}></span>
        </Navbar.Toggle>

        <div>
          <Navbar.Collapse id="responsive-navbar-nav" style={{ color: "white" }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', position: 'absolute', right: 32, top: 24, zIndex: 20 }}>
                {/* Theme Toggle */}
                <div className="custom-theme-toggle">
                  <div
                    className={`theme-switch ${theme === 'dark' ? 'dark' : 'light'}`}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      width: 70,
                      height: 36,
                      borderRadius: 22,
                      background: theme === 'dark' ? '#181818' : '#f5f5f5',
                      border: '2.5px solid #2323a7',
                      position: 'relative',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme === 'dark' ? '#fff' : '#2323a7' }}>
                      <WbSunnyIcon style={{ fontSize: 20, opacity: theme === 'dark' ? 0.5 : 1 }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme === 'dark' ? '#2323a7' : '#888' }}>
                      <NightlightIcon style={{ fontSize: 20, opacity: theme === 'dark' ? 1 : 0.5 }} />
                    </div>
                    <div
                      className="theme-switch-knob"
                      style={{
                        position: 'absolute',
                        top: 2.5,
                        left: theme === 'dark' ? 36 : 4,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#2323a7',
                        boxShadow: '0 2px 8px rgba(60,60,120,0.10)',
                        transition: 'left 0.22s cubic-bezier(.4,2,.6,1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}

                    >
                      {theme === 'dark' ? <NightlightIcon style={{ color: '#fff', fontSize: 18 }} /> : <WbSunnyIcon style={{ color: '#fff', fontSize: 18 }} />}
                    </div>
                  </div>
                </div>

                {/* Avatar and Dropdown */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', zIndex: 25 }}>
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <Avatar src={user?.avatarImage} alt={user?.name || 'U'} style={{ background: '#ede9fe', color: '#3b0764' }} />
                    <ArrowDropDownIcon style={{ color: 'var(--primary)' }} />
                  </div>

                  {dropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="profile-dropdown"
                      style={{
                        position: 'absolute',
                        top: '110%',
                        right: 0,
                        transform: 'none',
                        background: 'var(--card-bg)',
                        color: 'var(--foreground)',
                        borderRadius: 18,
                        boxShadow: '0 8px 32px rgba(60,60,120,0.18)',
                        width: 'min(270px, 90vw)',
                        padding: 0,
                        zIndex: 30,
                        border: '1.5px solid var(--primary)',
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: 'auto'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        right: 16,
                        width: 0,
                        height: 0,
                        borderLeft: '12px solid transparent',
                        borderRight: '12px solid transparent',
                        borderBottom: '14px solid var(--card-bg)',
                        zIndex: 31,
                      }} />
                      <div style={{ display: 'flex', alignItems: 'center', padding: '1.2rem 1.2rem 0.7rem 1.2rem', borderBottom: '1.5px solid #e5e7eb22' }}>
                        <Avatar src={user?.avatarImage} alt={user?.name || 'U'} style={{ marginRight: 14, width: 52, height: 52, background: '#ede9fe', color: '#3b0764' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name || 'User'}</div>
                          <div style={{ fontSize: 14, color: 'var(--primary)' }}>{user?.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', padding: '0.7rem 0' }}>
                        <DropdownButton icon={<LockIcon />} label="Change Password" onClick={handleChangePassword} />
                      </div>
                      <div style={{ borderTop: '1.5px solid #e5e7eb22', padding: '0.7rem 0' }}>
                        <DropdownButton icon={<LogoutIcon style={{ color: '#b91c1c' }} />} label="Log out" onClick={handleLogout} color="#b91c1c" hover="#fef2f2" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Nav><Button variant="primary" onClick={handleShowLogin} className="ml-2">Login</Button></Nav>
            )}
          </Navbar.Collapse>
        </div>
      </Navbar>

      <Modal show={showChangePwd} onHide={handleClosePwd} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePwdSubmit}>
            <Form.Group className="mb-3" controlId="oldPassword">
              <Form.Label>Old Password</Form.Label>
              <Form.Control type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} autoFocus required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={6} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required minLength={6} />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loadingPwd} style={{ width: '100%' }}>
              {loadingPwd ? 'Changing...' : 'Change Password'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

const DropdownButton = ({ icon, label, onClick = () => { }, color = 'var(--foreground)', hover = '#ede9fe' }) => (
  <button
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'none',
      border: 'none',
      color,
      fontWeight: 600,
      fontSize: 16,
      padding: '0.8rem 1.6rem',
      cursor: 'pointer',
      borderLeft: '4px solid transparent',
      transition: 'background 0.15s'
    }}
    onClick={onClick}
    onMouseOver={e => e.currentTarget.style.background = hover}
    onMouseOut={e => e.currentTarget.style.background = 'none'}
  >
    {icon} {label}
  </button>
);

export default Header;
