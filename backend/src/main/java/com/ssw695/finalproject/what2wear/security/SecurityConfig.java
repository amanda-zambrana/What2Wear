/*package com.ssw695.finalproject.what2wear.security;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorizeRequests ->
                authorizeRequests
                    .requestMatchers("/api/auth/register").permitAll()
                    .requestMatchers("/api/auth/login").permitAll()// Allow access to /test
                    .anyRequest().authenticated()          // Secure other endpoints
            )
            .csrf().disable()  // Optional: Disable CSRF for non-browser clients
            .httpBasic()       // Enable basic authentication
            .and()
            .securityContext().requireExplicitSave(false) // Optional debug setting
            .and()
            .formLogin()
            .defaultSuccessUrl("/"); // Optional: default page after login

        
        return http.build();
    }
    @Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}*/
