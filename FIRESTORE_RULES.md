rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Profiles:
    match /profiles/{documentId} {
      // Allow read if:
      // 1. User is reading their own profile (by UID)
      // 2. User is reading a profile where document ID matches their email (case-insensitive)
      // 3. The profile's email field matches the user's email (case-insensitive)
      // 4. The profile's user_id field matches the user's UID
      allow read: if request.auth != null && (
        request.auth.uid == documentId || 
        request.auth.token.email.lower() == documentId.lower() ||
        (resource.data.email != null && resource.data.email.lower() == request.auth.token.email.lower()) ||
        (resource.data.user_id != null && resource.data.user_id == request.auth.uid)
      );
      
      // Allow write if:
      // 1. User owns it by UID
      // 2. Document ID matches user's email (for claiming pre-registered profiles)
      // 3. Profile's user_id matches the authenticated user's UID
      // 4. It's a new profile being created by the user for themselves
      allow write: if request.auth != null && (
        request.auth.uid == documentId ||
        request.auth.token.email.lower() == documentId.lower() ||
        (resource != null && resource.data.user_id == request.auth.uid) ||
        (request.resource.data.user_id == request.auth.uid)
      );
    }
    
    match /schools/{schoolId} {
      allow read: if true;
    }
    
    // Default deny, but allow admins full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/profiles/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
