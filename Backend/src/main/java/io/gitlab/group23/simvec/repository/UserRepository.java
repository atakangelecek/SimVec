package io.gitlab.group23.simvec.repository;

import io.gitlab.group23.simvec.model.SimvecUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<SimvecUser, Integer> {

	Optional<SimvecUser> findByUsername(String username);

}
