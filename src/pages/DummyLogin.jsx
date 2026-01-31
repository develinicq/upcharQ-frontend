import React, { useState } from 'react'
import axios from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

const DummyLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    // Basic email format check
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      // Adjust endpoint/shape to your backend's login
      const res = await axios.post('/superAdmin/login', { emailId: email, password })
      const data = res?.data
      // Try common token paths
      const token = data?.token || data?.accessToken || data?.data?.token
      const user = data?.user || data?.data?.user || null
      if (!token) {
        throw new Error('No token in response')
      }
      setToken(token)
      if (user) setUser(user)
  // Redirect to absolute dashboard URL on current origin
  window.location.replace(`${window.location.origin}/dashboard`)
    } catch (e) {
      const raw = e?.response?.data?.message ?? e?.message ?? 'Login failed';
      const msg = typeof raw === 'string' ? raw : (raw?.message || raw?.error || JSON.stringify(raw));
      setError(msg);
      // Helpful for debugging complex server errors without breaking UI
      console.error('Login failed:', e);
    }
  }

  return (
    <div style={{ maxWidth: '360px', margin: '40px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '20px' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>Password</span>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563eb' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <div style={{ color: '#dc2626', fontSize: '14px' }}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <button
            type="submit"
            style={{ padding: '10px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  )
}

export default DummyLogin
