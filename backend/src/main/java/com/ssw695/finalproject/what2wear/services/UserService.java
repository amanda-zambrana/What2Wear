package com.ssw695.finalproject.what2wear.services;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.FirebaseToken;
import com.ssw695.finalproject.what2wear.registration.UserRegistrationDto;
import com.ssw695.finalproject.what2wear.repository.UserDataRepository;
import com.ssw695.finalproject.what2wear.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserDataRepository userRepository;

    @Autowired
    private FirebaseService firebaseService; // Inject FirebaseService

    /**
     * Registers a new user in Firebase Authentication and stores additional details in the database.
     */
    public User registerNewUser(UserRegistrationDto registrationDto) throws Exception {
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new Exception("Username already exists!");
        }

        if (!isValidPassword(registrationDto.getPassword())) {
            throw new Exception("Password must contain at least one special character, one uppercase letter, and one digit.");
        }

        // Create Firebase Authentication user
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(registrationDto.getEmail())
                .setPassword(registrationDto.getPassword())
                .setDisplayName(registrationDto.getFirstName() + " " + registrationDto.getLastName());

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);

        // Save user details in the database with Firebase UID
        User user = new User();
        user.setUid(userRecord.getUid()); // Firebase UID
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setEmail(registrationDto.getEmail());
        user.setUsername(registrationDto.getUsername());

        return userRepository.save(user);
    }

    /**
     * Validates the password against a defined pattern.
     */
    private boolean isValidPassword(String password) {
        String passwordPattern = "^(?=.*[A-Z])(?=.*[@#$%^&+=])(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$";
        return password.matches(passwordPattern);
    }

    /**
     * Finds a user by their username in the database.
     */
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Verifies a Firebase token to authenticate a user.
     */
    public boolean verifyFirebaseToken(String token) {
        try {
            FirebaseToken decodedToken = firebaseService.verifyToken(token);
            return decodedToken != null; // Return true if token is valid
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
            return false; // Return false if token verification fails
        }
    }

    /**
     * Saves or updates user details in the database.
     */
    public void saveUser(User user) {
        userRepository.save(user);
    }
}
