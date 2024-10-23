package com.what2wear.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.what2wear.Login.LoginDto;
import com.what2wear.regestation.UserRegistrationDto;
import com.what2wear.services.UserService;
import com.what2wear.user.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
	private UserService userService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto registrationDto) {
		try {
			User newUser = userService.registerNewUser(registrationDto);
			return new ResponseEntity<>(newUser, HttpStatus.CREATED);
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginUser(@RequestBody LoginDto loginDto) {
		User user = userService.findUserByUsername(loginDto.getUsername());
		if (user != null && passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
			return new ResponseEntity<>("Login successful!", HttpStatus.OK);
		}
		return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
	}
}
