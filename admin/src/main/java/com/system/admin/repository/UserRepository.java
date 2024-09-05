package com.system.admin.repository;

import com.system.admin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

//    @Query("SELECT COUNT(*) FROM User u WHERE u.email = ?1")
    public boolean existsByEmail(String email);
    public boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);


    @Query("SELECT u FROM User u where u.email = :email")
    public User getUserByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE u.username LIKE %:keyword% " +
            "OR u.email LIKE %:keyword% " +
            "OR CAST(u.enabled AS string) LIKE %:keyword% " +
            "OR r.name LIKE %:keyword%")
    List<User> searchUsers(@Param("keyword") String keyword);
}
