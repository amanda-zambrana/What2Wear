package com.ssw695.finalproject.what2wear.user;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String uid;       // Firebase UID
    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String password;   // Only if you need to store the hashed password, otherwise omit this

    
}
