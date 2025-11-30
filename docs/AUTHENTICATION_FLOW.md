# User Authentication Flow Documentation

Yeh document QueztLearn LMS mein user authentication ke complete flow ko explain karta hai, saare API endpoints ke saath.

## Table of Contents

1. [Admin Authentication Flow](#admin-authentication-flow)
2. [Student Authentication Flow (Email/Password)](#student-authentication-flow-emailpassword)
3. [Client/Student OTP Authentication Flow](#clientstudent-otp-authentication-flow)
4. [Token Management](#token-management)
5. [API Endpoints Reference](#api-endpoints-reference)

---

## Admin Authentication Flow

### Flow Overview

Admin users email aur password ke through authenticate hote hain. Flow yeh hai:

1. **Registration** → 2. **Email Verification** → 3. **Set Password** → 4. **Login**

### Step 1: Admin Registration

**API Endpoint:**

```
POST /admin/auth/register
```

**Request Body:**

```json
{
  "organizationId": "string",
  "email": "string",
  "username": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "username": "string"
  },
  "message": "Registration successful"
}
```

**Frontend Implementation:**

- File: `src/app/register-admin/page.tsx`
- Hook: `useRegister()` from `src/hooks/api.ts`
- After successful registration, user ko `/verify-email` page par redirect kiya jata hai

---

### Step 2: Email Verification

**API Endpoint:**

```
POST /admin/auth/verify-email
```

**Request Body:**

```json
{
  "token": "string" // Email verification token from URL
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "message": "Email verified successfully"
  }
}
```

**Frontend Implementation:**

- File: `src/app/verify-email/page.tsx`
- Hook: `useVerifyEmail()` from `src/hooks/api.ts`
- Token URL query parameter se extract hota hai
- Success ke baad automatically `/set-password` page par redirect hota hai

---

### Step 3: Set Password

**API Endpoint:**

```
POST /admin/auth/set-password
```

**Request Body:**

```json
{
  "userId": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password set successfully"
  }
}
```

**Frontend Implementation:**

- File: `src/app/set-password/page.tsx`
- Hook: `useSetPassword()` from `src/hooks/api.ts`
- UserId localStorage ya state se retrieve hota hai

---

### Step 4: Admin Login

**API Endpoint:**

```
POST /admin/auth/login
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "username": "string",
      "role": "ADMIN",
      "organizationId": "string",
      "isVerified": true
    }
  }
}
```

**Frontend Implementation:**

- File: `src/app/login/page.tsx`
- Hook: `useLogin()` from `src/hooks/api.ts`
- Token `QUEZT_AUTH` cookie mein store hota hai
- Success ke baad `/admin/dashboard` par redirect hota hai

---

### Resend Verification Email

**API Endpoint:**

```
POST /admin/auth/resend-verification
```

**Request Body:**

```json
{
  "email": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Verification email sent successfully"
  }
}
```

**Frontend Implementation:**

- Hook: `useResendVerification()` from `src/hooks/api.ts`

---

## Student Authentication Flow (Email/Password)

### Flow Overview

Student users bhi email aur password ke through authenticate ho sakte hain. Flow admin jaisa hi hai, bas endpoints different hain.

### Step 1: Student Registration

**API Endpoint:**

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "organizationId": "string",
  "email": "string",
  "username": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "username": "string"
  }
}
```

**Frontend Implementation:**

- Hook: `useStudentRegister()` from `src/hooks/api.ts`

---

### Step 2: Student Email Verification

**API Endpoint:**

```
POST /api/auth/verify-email
```

**Request Body:**

```json
{
  "token": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "message": "Email verified successfully"
  }
}
```

**Frontend Implementation:**

- File: `src/app/[client]/verify-email/page.tsx`
- Hook: `useStudentVerifyEmail()` from `src/hooks/api.ts`

---

### Step 3: Student Set Password

**API Endpoint:**

```
POST /api/auth/set-password
```

**Request Body:**

```json
{
  "userId": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password set successfully"
  }
}
```

**Frontend Implementation:**

- File: `src/app/[client]/set-password/page.tsx`
- Hook: `useStudentSetPassword()` from `src/hooks/api.ts`

---

### Step 4: Student Login

**API Endpoint:**

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "username": "string",
      "role": "STUDENT",
      "organizationId": "string",
      "isVerified": true
    }
  }
}
```

**Frontend Implementation:**

- Hook: `useStudentLogin()` from `src/hooks/api.ts`
- Success ke baad `/student/my-learning` par redirect hota hai

---

### Student Resend Verification

**API Endpoint:**

```
POST /api/auth/resend-verification
```

**Request Body:**

```json
{
  "email": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Verification email sent successfully"
  }
}
```

**Frontend Implementation:**

- Hook: `useStudentResendVerification()` from `src/hooks/api.ts`

---

## Client/Student OTP Authentication Flow

### Flow Overview

Client-specific students phone number aur OTP ke through authenticate ho sakte hain. Yeh flow 3 steps mein complete hota hai:

1. **Get OTP** → 2. **Verify OTP** → 3. **Set Username** (new users ke liye)

### Step 1: Get OTP

**API Endpoint:**

```
POST /api/auth/get-otp
```

**Request Body:**

```json
{
  "countryCode": "+91",
  "phoneNumber": "string",
  "organizationId": "string"
}
```

**Response (Existing User):**

```json
{
  "success": true,
  "data": {
    "isExistingUser": true
  }
}
```

**Response (New User - 400 status code):**

```json
{
  "success": false,
  "data": {
    "isExistingUser": false
  },
  "message": "New user registered"
}
```

**Note:** New users ke liye API 400 status code return karta hai, lekin OTP successfully send ho jata hai. Frontend isko handle karta hai.

**Frontend Implementation:**

- File: `src/app/[client]/login/page.tsx`
- Component: `PhoneStep` from `src/components/auth/phone-step.tsx`
- Hook: `useGetOtp()` from `src/hooks/api.ts`
- Hook: `useOtpAuth()` from `src/hooks/auth/use-otp-auth.ts`
- OTP send hone ke baad `otp` step par move hota hai
- 60 seconds ka resend timer set hota hai

---

### Step 2: Verify OTP

**API Endpoint:**

```
POST /api/auth/verify-otp
```

**Request Body:**

```json
{
  "countryCode": "+91",
  "phoneNumber": "string",
  "otp": "string", // 6-digit OTP
  "organizationId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "string",
      "phoneNumber": "string",
      "countryCode": "+91",
      "username": "string",
      "role": "STUDENT",
      "organizationId": "string",
      "isVerified": true
    }
  }
}
```

**Frontend Implementation:**

- Component: `OtpStep` from `src/components/auth/otp-step.tsx`
- Hook: `useVerifyOtp()` from `src/hooks/api.ts`
- Token aur user data `QUEZT_AUTH` cookie mein store hota hai
- Agar user existing hai, to directly `/student/my-learning` par redirect
- Agar new user hai, to `username` step par move hota hai

---

### Step 3: Set Username (New Users Only)

**API Endpoint:**

```
PUT /api/profile
```

**Request Body:**

```json
{
  "username": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "STUDENT",
    "organizationId": "string",
    "isVerified": true
  }
}
```

**Frontend Implementation:**

- Component: `UsernameStep` from `src/components/auth/username-step.tsx`
- Hook: `useUpdateProfile()` from `src/hooks/api.ts`
- Username set hone ke baad `/student/my-learning` par redirect hota hai

---

### Resend OTP

Resend OTP ke liye same `getOtp` endpoint use hota hai. Frontend mein 60 seconds ka timer hota hai jo expire hone ke baad hi resend allow karta hai.

**Frontend Implementation:**

- `handleResendOtp()` function in `useOtpAuth` hook
- Timer countdown `resendTimer` state se manage hota hai

---

## Token Management

### Token Storage

- **Storage Method:** HTTP-only cookies (via `cookies-next`)
- **Cookie Name:** `QUEZT_AUTH`
- **Cookie Structure:**

```json
{
  "token": "string", // Access token
  "refreshToken": "string", // Refresh token (OTP auth ke liye)
  "user": {
    "id": "string",
    "email": "string",
    "username": "string",
    "role": "ADMIN | TEACHER | STUDENT",
    "organizationId": "string",
    "phoneNumber": "string",
    "countryCode": "string"
  },
  "timestamp": 1234567890
}
```

### Token Manager Functions

**Location:** `src/lib/api/client.ts`

**Available Functions:**

- `tokenManager.setAuthData(token, user, refreshToken?)` - Auth data store karta hai
- `tokenManager.getToken()` - Access token retrieve karta hai
- `tokenManager.getRefreshToken()` - Refresh token retrieve karta hai
- `tokenManager.getUser()` - User data retrieve karta hai
- `tokenManager.getAuthData()` - Complete auth data retrieve karta hai
- `tokenManager.clearAuthData()` - Auth data clear karta hai
- `tokenManager.isAuthenticated()` - Authentication status check karta hai

---

### Token Refresh

**API Endpoint:**

```
POST /api/auth/refresh-token
```

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "user": {
      // User object
    }
  }
}
```

**Frontend Implementation:**

- Automatic token refresh axios interceptor mein handle hota hai
- 401 error aane par automatically refresh token call hota hai
- File: `src/lib/api/client.ts` (lines 83-154)
- Hook: `useRefreshToken()` from `src/hooks/api.ts`

**Admin Token Refresh:**

```
POST /admin/auth/refresh
```

---

## API Endpoints Reference

### Admin Authentication Endpoints

| Method | Endpoint                          | Description                 |
| ------ | --------------------------------- | --------------------------- |
| POST   | `/admin/auth/register`            | Admin registration          |
| POST   | `/admin/auth/verify-email`        | Email verification          |
| POST   | `/admin/auth/set-password`        | Set password                |
| POST   | `/admin/auth/login`               | Admin login                 |
| POST   | `/admin/auth/resend-verification` | Resend verification email   |
| POST   | `/admin/auth/refresh`             | Refresh access token        |
| POST   | `/admin/auth/invite-user`         | Invite user (Admin/Teacher) |

### Student Authentication Endpoints (Email/Password)

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| POST   | `/api/auth/register`            | Student registration      |
| POST   | `/api/auth/verify-email`        | Email verification        |
| POST   | `/api/auth/set-password`        | Set password              |
| POST   | `/api/auth/login`               | Student login             |
| POST   | `/api/auth/resend-verification` | Resend verification email |

### Client/Student OTP Authentication Endpoints

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| POST   | `/api/auth/get-otp`       | Get OTP on phone number   |
| POST   | `/api/auth/verify-otp`    | Verify OTP and get tokens |
| POST   | `/api/auth/refresh-token` | Refresh access token      |

### Profile Endpoints

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| GET    | `/api/profile` | Get user profile    |
| PUT    | `/api/profile` | Update user profile |

---

## Authentication Flow Diagrams

### Admin Flow

```
Registration → Email Verification → Set Password → Login → Dashboard
```

### Student Flow (Email/Password)

```
Registration → Email Verification → Set Password → Login → My Learning
```

### Student Flow (OTP)

```
Phone Number → Get OTP → Verify OTP → [New User: Set Username] → My Learning
```

---

## Frontend Hooks Reference

### Admin Hooks

- `useRegister()` - Admin registration
- `useVerifyEmail()` - Email verification
- `useSetPassword()` - Set password
- `useLogin()` - Admin login
- `useResendVerification()` - Resend verification email
- `useLogout()` - Logout user

### Student Hooks (Email/Password)

- `useStudentRegister()` - Student registration
- `useStudentVerifyEmail()` - Email verification
- `useStudentSetPassword()` - Set password
- `useStudentLogin()` - Student login
- `useStudentResendVerification()` - Resend verification email

### OTP Authentication Hooks

- `useGetOtp()` - Get OTP
- `useVerifyOtp()` - Verify OTP
- `useOtpAuth()` - Complete OTP auth flow manager
- `useUpdateProfile()` - Update username/profile

### Utility Hooks

- `useAuth()` - Get current authentication state
- `useCurrentUser()` - Get current user data
- `useRequireAuth()` - Require authentication for route
- `useRequireRole(role)` - Require specific role for route
- `useRefreshToken()` - Refresh access token

---

## Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

**401 Unauthorized:**

- Token invalid ya expired
- Automatic token refresh attempt hota hai
- Agar refresh fail ho, to login page par redirect

**403 Forbidden:**

- User ke paas required permissions nahi hain

**404 Not Found:**

- Resource nahi mila

### Frontend Error Handling

- `getFriendlyErrorMessage()` function se user-friendly error messages generate hote hain
- Location: `src/lib/utils/error-handling.ts`
- All hooks mein proper error handling implement hai

---

## Security Features

1. **Token Storage:** HTTP-only cookies (secure in production)
2. **Token Refresh:** Automatic token refresh on 401 errors
3. **Email Verification:** Required before password setup
4. **OTP Verification:** 6-digit OTP with 60-second resend timer
5. **Role-based Access:** Role-based route protection
6. **Organization Isolation:** Users organization-specific hote hain

---

## Notes

1. **OTP Flow Special Case:** New users ke liye `getOtp` API 400 status code return karta hai, lekin OTP successfully send ho jata hai. Frontend isko handle karta hai.

2. **Token Expiry:** Access tokens ki expiry backend se determine hoti hai. Refresh tokens use karke automatically renew hote hain.

3. **Organization Context:** Client-specific routes (`/[client]/login`) organization context require karte hain.

4. **Cookie Settings:**
   - `maxAge`: 7 days
   - `httpOnly`: false (client-side access ke liye)
   - `secure`: true in production
   - `sameSite`: "lax"

---

## Related Files

### Core Files

- `src/lib/api/client.ts` - API client, token manager, endpoints
- `src/hooks/api.ts` - All authentication hooks
- `src/hooks/auth/use-otp-auth.ts` - OTP authentication hook
- `src/hooks/auth.ts` - Auth utility hooks

### Page Components

- `src/app/login/page.tsx` - Admin login
- `src/app/register-admin/page.tsx` - Admin registration
- `src/app/verify-email/page.tsx` - Admin email verification
- `src/app/set-password/page.tsx` - Admin password setup
- `src/app/[client]/login/page.tsx` - Client student login (OTP)
- `src/app/[client]/verify-email/page.tsx` - Student email verification
- `src/app/[client]/set-password/page.tsx` - Student password setup

### UI Components

- `src/components/auth/phone-step.tsx` - Phone number input
- `src/components/auth/otp-step.tsx` - OTP input
- `src/components/auth/username-step.tsx` - Username input
- `src/components/auth/auth-layout.tsx` - Auth layout wrapper

---

**Last Updated:** 2024
**Version:** 1.0
