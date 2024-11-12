package com.ssw695.finalproject.what2wear.services;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {

    /**
     * Verifies a Firebase ID token.
     *
     * @param token The Firebase ID token
     * @return FirebaseToken if token is valid, throws FirebaseAuthException if invalid
     * @throws FirebaseAuthException if the token cannot be verified
     */
    public FirebaseToken verifyToken(String token) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().verifyIdToken(token);
    }
}
