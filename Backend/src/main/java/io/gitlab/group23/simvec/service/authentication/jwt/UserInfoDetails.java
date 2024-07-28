package io.gitlab.group23.simvec.service.authentication.jwt;

import io.gitlab.group23.simvec.model.SimvecUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UserInfoDetails implements UserDetails {

	private final String username;
	private final String password;
	private final List<GrantedAuthority> authorities;

	// HERE IS THE SIMVEC USER ATTRIBUTES
	public UserInfoDetails(SimvecUser simvecUser) {
		username = simvecUser.getUsername();
		password = simvecUser.getPassword();
		authorities = Arrays.stream(simvecUser.getRoles().split(","))
				.map(SimpleGrantedAuthority::new)
				.collect(Collectors.toList());
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

}
