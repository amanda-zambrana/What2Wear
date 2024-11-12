package com.ssw695.finalproject.what2wear.registration;

import lombok.Data;

@Data
public class UserRegistrationDto {
    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String password;
}
