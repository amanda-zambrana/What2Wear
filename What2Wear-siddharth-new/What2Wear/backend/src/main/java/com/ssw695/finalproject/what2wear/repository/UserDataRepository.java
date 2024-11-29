package com.ssw695.finalproject.what2wear.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ssw695.finalproject.what2wear.user.User;


@Repository
public interface UserDataRepository extends JpaRepository<User, Long> {
	boolean existsByUsername(String username);

	User findByUsername(String username);
}