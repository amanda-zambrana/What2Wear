package com.ssw695.finalproject.what2wear.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssw695.finalproject.what2wear.login.LoginDto;
import com.ssw695.finalproject.what2wear.registration.UserRegistrationDto;
import com.ssw695.finalproject.what2wear.services.UserService;
import com.ssw695.finalproject.what2wear.user.User;



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

	@GetMapping("/test")
	public String test() {
		return "test";
	}
}
