package com.ssw695.finalproject.what2wear.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.google.firebase.auth.FirebaseToken;
import com.ssw695.finalproject.what2wear.services.FirebaseService;

@RestController
@RequestMapping("/api/auth")
public class AuthControllerFirebase {

    @Autowired
    private FirebaseService firebaseService;

    /**
     * Verifies the Firebase ID Token and returns the user's UID if valid.
     */
    @PostMapping("/verifyToken")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            // Remove "Bearer " prefix from token if present
            FirebaseToken decodedToken = firebaseService.verifyToken(token.replace("Bearer ", ""));
            String uid = decodedToken.getUid();
            return ResponseEntity.ok("Token verified for user: " + uid);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token: " + e.getMessage());
        }
    }
}
