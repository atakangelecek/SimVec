package io.gitlab.group23.simvec.controller;

import io.gitlab.group23.simvec.model.AuthRequest;
import io.gitlab.group23.simvec.model.SimvecUser;
import io.gitlab.group23.simvec.service.authentication.jwt.AuthenticationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthenticationController {

	private final AuthenticationService authenticationService;

	@Autowired
	public AuthenticationController(AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}

	@PostMapping("/register")
	public String register(@RequestBody SimvecUser simvecUser) {
		log.info("Register: " + simvecUser.toString());
		return authenticationService.register(simvecUser);
	}

	@PostMapping("/login")
	public String login(@RequestBody AuthRequest authRequest) {
		log.info(String.format("Login: %s", authRequest.toString()));
		return authenticationService.login(authRequest);
	}

}
