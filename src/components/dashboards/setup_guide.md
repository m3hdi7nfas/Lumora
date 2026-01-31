# Firebase & Microsoft Login Setup Guide

## Step 1: Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.com/).
2. Select your project: **Lumora Learn**.
3. Go to **Build** > **Authentication** > **Sign-in method**.
4. Enable **Microsoft**.
5. Copy the **Redirect URI** provided by Firebase (it looks like `https://lumora-learn-c60f5.firebaseapp.com/__/auth/handler`).

---

## Step 2: Azure App Registration Fix (IMPORTANT)
The error `AADSTS50011` indicates a Redirect URI mismatch. You must add the exact Firebase handler URL to Azure.

1. Go to [Azure Portal](https://portal.azure.com/) > **App Registrations**.
2. Select your app: **'11824409-6b41-48ff-960e-fb8aec5b2ecc'**.
3. Go to **Authentication** (left sidebar).
4. Under **Platform configurations**, find the **Web** section (or add a Web platform if missing).
5. Add the following **Redirect URI** exactly:
   `https://lumora-learn-c60f5.firebaseapp.com/__/auth/handler`
6. Ensure **Multitenant** is enabled (Supported account types: *Accounts in any organizational directory*).
7. Save changes.

---

## Step 3: Add Admin & Moderator Accounts
Once Microsoft Login is fixed, you should also initialize the requested accounts for standard email login.

1. Log in to the app (using the admin fallback `admin@lumora.com` / `AdminPassword123!` if needed).
2. Go to **System Settings**.
3. Click the **"Seed Mahdi & Rigveda Accounts"** button.
4. This will create their profiles in Firestore.
5. They can then **Sign Up** with their emails to set their own passwords.

---

## Troubleshooting
- **Domain Restriction**: If you are blocked after login, check the **System Settings** in the Admin Dashboard to ensure your domain (e.g., `@gmail.com`) is either allowed or the list is empty (allow all).
- **Client Secret**: If login fails with a "Bad Secret" error, generate a new **Client Secret** in Azure (Certificates & Secrets) and update it in the Firebase Console.
