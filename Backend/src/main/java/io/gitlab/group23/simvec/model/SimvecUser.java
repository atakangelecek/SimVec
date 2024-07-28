package io.gitlab.group23.simvec.model;

import io.gitlab.group23.simvec.service.authentication.passwordvalidation.ValidPassword;
import jakarta.persistence.*;
import lombok.*;

@Entity
@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimvecUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@Column(unique = true)
	private String username;

	@Column(unique = true)
	private String email;

	@ValidPassword
	private String password;

	private String roles;

	private int numberOfPhotos;

}
