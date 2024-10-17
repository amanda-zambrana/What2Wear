package com.what2wear.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.what2wear.user.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByUsername(String username);

	User findByUsername(String username);
}