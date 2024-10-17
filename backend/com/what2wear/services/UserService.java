package com.what2wear.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.*;

import com.what2wear.regestation.UserRegistrationDto;
import com.what2wear.repository.UserRepository;
import com.what2wear.user.User;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder; // For encrypting passwords

	public boolean checkPassword(String rawPassword, String encodedPassword) {
		PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}

	public User registerNewUser(UserRegistrationDto registrationDto) throws Exception {
		if (userRepository.existsByUsername(registrationDto.getUsername())) {
			throw new Exception("Username already exists!");
		}

		if (!isValidPassword(registrationDto.getPassword())) {
			throw new Exception(
					"Password must contain at least one special character, one uppercase letter, and one digit.");
		}

		User user = new User();
		user.setFirstName(registrationDto.getFirstName());
		user.setLastName(registrationDto.getLastName());
		user.setEmail(registrationDto.getEmail());
		user.setUsername(registrationDto.getUsername());
		user.setPassword(passwordEncoder.encode(registrationDto.getPassword())); // Hashing the password

		return userRepository.save(user);
	}

	private boolean isValidPassword(String password) {
		// Regex to check for one uppercase, one special character, and alphanumeric
		String passwordPattern = "^(?=.*[A-Z])(?=.*[@#$%^&+=])(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$";
		return password.matches(passwordPattern);
	}

	public User findUserByUsername(String username) {
		return userRepository.findByUsername(username);
	}

	public void saveUser(User user) {
		userRepository.save(user);
	}

}
