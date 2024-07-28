package io.gitlab.group23.simvec.service;

import io.gitlab.group23.simvec.model.SimvecUser;
import io.gitlab.group23.simvec.repository.UserRepository;
import io.gitlab.group23.simvec.service.authentication.jwt.UserInfoDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class UserService implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Optional<SimvecUser> userDetail = userRepository.findByUsername(username);
		return userDetail.map(UserInfoDetails::new)
				.orElseThrow(() -> new UsernameNotFoundException("User not found " + username));
	}

	public SimvecUser getUserByUsername(String username) {
		Optional<SimvecUser> simvecUser = userRepository.findByUsername(username);
		if (simvecUser.isEmpty()) {
			throw new RuntimeException("No user exists with the given username");
		}
		return simvecUser.get();
	}

	public String addUser(SimvecUser userInfo) {
		userInfo.setPassword(passwordEncoder.encode(userInfo.getPassword()));
		userRepository.save(userInfo);
		return "User Added Successfully";
	}

	public void updateUser(SimvecUser simvecUser) {
		userRepository.save(simvecUser);
	}

}
