package com.ssw695.finalproject.what2wear.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ssw695.finalproject.what2wear.registration.UserRegistrationDto;
import com.ssw695.finalproject.what2wear.services.UserService;
import com.ssw695.finalproject.what2wear.user.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * Registers a new user by adding them to Firebase Authentication and storing additional details.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto registrationDto) {
        try {
            User newUser = userService.registerNewUser(registrationDto);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Verifies a Firebase ID token to authenticate the user.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestHeader("Authorization") String token) {
        boolean isAuthenticated = userService.verifyFirebaseToken(token.replace("Bearer ", ""));
        if (isAuthenticated) {
            return new ResponseEntity<>("Login successful!", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid token", HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/test")
    public String test() {
        return "Test endpoint is working!";
    }
}
