package io.gitlab.group23.simvec.service.authentication.jwt;

import io.gitlab.group23.simvec.model.AuthRequest;
import io.gitlab.group23.simvec.model.SimvecUser;
import io.gitlab.group23.simvec.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

	private static final String ROLE_USER = "ROLE_USER";

	private final UserService userService;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthenticationService(UserService userService, AuthenticationManager authenticationManager, JwtService jwtService) {
		this.userService = userService;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	public String register(SimvecUser simvecUser) {
		simvecUser.setRoles(ROLE_USER);
		return userService.addUser(simvecUser);
	}

	public String login(AuthRequest authRequest) {
		Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
		if (authentication.isAuthenticated()) {
			return jwtService.generateToken(authRequest.getUsername());
		} else {
			throw new UsernameNotFoundException("invalid user request !");
		}
	}

	public SimvecUser getCurrentUserByToken() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username =  auth.getName();
		return userService.getUserByUsername(username);
	}

}
