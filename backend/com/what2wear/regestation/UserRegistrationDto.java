package com.what2wear.regestation;
import lombok.Data;

@Data
public class UserRegistrationDto {
    private String firstName;
    private String lastName;
    private String email;
	private String username;
    private String password;

   
}