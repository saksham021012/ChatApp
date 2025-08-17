import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import nhost from "@/nhost"

export default function Landing() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [showEmailCheckMessage, setShowEmailCheckMessage] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Please enter email and password.')
      return
    }

    setLoading(true)
    try {
      const { session, error: loginError } = await nhost.auth.signIn({
        email,
        password
      })

      if (loginError) {
        if (loginError.status === 429) {
          setError("Too many login attempts. Please try again in a few minutes.")
        } else if (loginError.message.includes('email-not-verified')) {
          setError("Please verify your email address before signing in. Check your inbox and spam folder.")
        } else {
          setError(loginError.message)
        }
        return
      }

      if (session) {
        navigate("/chatapp");
      }
    } catch (err) {
      setError('Unexpected error occurred.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setError('');
    setVerificationSent(false);
    setShowEmailCheckMessage(false);
    
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { session, user, error: signupError } = await nhost.auth.signUp({
        email,
        password,
        options: {
          // Ensure email verification is required
          allowedRoles: ['user'],
          defaultRole: 'user'
        }
      });

      if (signupError) {
        if (signupError.status === 429) {
          setError("Too many signup attempts. Please try again in a few minutes.");
        } else if (signupError.message.includes('already exists')) {
          setError("An account with this email already exists. Please try signing in instead.");
        } else {
          setError(signupError.message);
        }
        return;
      }

      // If signup returns a session immediately, redirect (no verification needed)
      if (session) {
        navigate('/chatapp');
      } 
      // If user is created but no session (verification required)
      else if (user) {
        setSignupEmail(email);
        setVerificationSent(true);
        setEmail('');
        setPassword('');
      }
      
      // Show email check message and keep it visible
      setShowEmailCheckMessage(true);
      
    } catch (err) {
      setError('Unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!signupEmail) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { error: resendError } = await nhost.auth.resetPassword({
        email: signupEmail
      });
      
      if (resendError) {
        setError('Failed to resend verification email.');
      } else {
        setError(''); // Clear any previous errors
        // Show a brief success message
        const originalText = 'Verification email sent again!';
        setError(originalText);
        setTimeout(() => {
          if (error === originalText) setError('');
        }, 3000);
      }
    } catch (err) {
      setError('Failed to resend verification email.', err);
    } finally {
      setLoading(false);
    }
  };

  const backToSignup = () => {
    setVerificationSent(false);
    setSignupEmail('');
    setError('');
  };

  // Verification pending view
  if (verificationSent) {
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600">We've sent a verification link to</p>
            <p className="text-blue-600 font-medium">{signupEmail}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-blue-800 font-medium mb-1">Next Steps:</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Click the verification link in your email</li>
                      <li>• Check your spam/junk folder if you don't see it</li>
                      <li>• You'll be redirected to sign in after verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && !error.includes('sent again') && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {error && error.includes('sent again') && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleResendVerification}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Resend Verification Email
                    </>
                  )}
                </button>
                
                <button
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  onClick={backToSignup}
                >
                  Back to Signup
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try resending
          </div>
        </div>
      </div>
    )
  }

  // Main signup/login view
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ChatApp</h1>
          <p className="text-gray-600">Sign in to your account or create a new one</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {showEmailCheckMessage && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-blue-800 text-sm">Please check your email (including spam folder) for verification link</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Loading...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
              <button
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Loading...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          By signing in, you agree to our terms of service and privacy policy
        </div>
      </div>
    </div>
  )
}