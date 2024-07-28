package io.gitlab.group23.simvec.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserProfileInfo {

	private String username;
	private String email;
	private int photoCount;

}
