const host = "http://localhost:5000";

export const setAvatarAPI = `${host}/api/auth/setAvatar`;
export const registerAPI = `${host}/api/auth/register`;
export const loginAPI = `${host}/api/auth/login`;
export const addTransaction = `${host}/api/v1/addTransaction`;
export const getTransactions = `${host}/api/v1/getTransaction`;
export const editTransactions = `${host}/api/v1/updateTransaction`;
export const deleteTransactions = `${host}/api/v1/deleteTransaction`;
export const sendOtpAPI = `${host}/api/auth/send-otp`;
export const verifyOtpAPI = `${host}/api/auth/verify-otp`;
export const changePasswordAPI = `${host}/api/auth/change-password`;
export const forgotPasswordSendOtpAPI = `${host}/api/auth/forgot-password/send-otp`;
export const forgotPasswordResetAPI = `${host}/api/auth/forgot-password/reset`;
