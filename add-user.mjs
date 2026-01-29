// Quick script to add a user to Microsoft Access
// This adds the email to Firestore so they can log in with Microsoft

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config from your .env
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addMicrosoftUser() {
    const email = '2915@diyafahinternationalschool.com';
    const lowerEmail = email.toLowerCase();

    console.log('📧 Adding user to Microsoft Access:', lowerEmail);

    try {
        // Create profile with email as document ID
        const profileData = {
            email: lowerEmail,
            display_name: '2915', // Using the email prefix as display name
            role: 'student',
            school_id: 'diyafah-international-school', // Assuming this is the school ID
            is_active: true,
            score: 0,
            progress: 0,
            avatar_id: null,
            user_id: null, // Will be linked when they log in with Microsoft
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        };

        const profileRef = doc(db, 'profiles', lowerEmail);
        await setDoc(profileRef, profileData, { merge: true });

        console.log('✅ Successfully added user to Microsoft Access!');
        console.log('📝 Profile created with ID:', lowerEmail);
        console.log('👤 Display Name:', profileData.display_name);
        console.log('🎓 Role:', profileData.role);
        console.log('🏫 School ID:', profileData.school_id);
        console.log('\n🎉 User can now log in with Microsoft using:', email);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding user:', error);
        process.exit(1);
    }
}

addMicrosoftUser();
