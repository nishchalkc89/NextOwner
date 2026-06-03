import api from './api'

/** Send OTP to student email — must be institutional (not Gmail etc.) */
export async function sendVerificationOtp(studentEmail) {
  const { data } = await api.post('/verify/send-otp', { studentEmail })
  return data
}

/** Submit 6-digit OTP to confirm email ownership */
export async function checkVerificationOtp(otp) {
  const { data } = await api.post('/verify/check-otp', { otp })
  return data
}

/** Upload student ID card after email is verified */
export async function submitStudentId(formData) {
  const { data } = await api.post('/verify/submit-id', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
