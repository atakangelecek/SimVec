package io.gitlab.group23.simvec.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VectorDatabaseRequest {

	private String input;
	private String topk;
	private String username;
}
