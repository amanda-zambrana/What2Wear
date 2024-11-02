package com.ssw695.finalproject.what2wear.security;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

	@Bean
	public FirebaseApp initializeFirebase() throws IOException {
	
		ClassPathResource resource = new ClassPathResource("firebase-service.json");
		FileInputStream serviceAccount = new FileInputStream(resource.getFile());
		
		FirebaseOptions options = FirebaseOptions.builder().setCredentials(GoogleCredentials.fromStream(serviceAccount))
				.setDatabaseUrl("https://what2wear-be847.firebaseio.com").build();

		return FirebaseApp.initializeApp(options);
	}
}
