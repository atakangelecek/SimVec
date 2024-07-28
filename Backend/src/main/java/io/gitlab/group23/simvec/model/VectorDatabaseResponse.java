package io.gitlab.group23.simvec.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class VectorDatabaseResponse {

	private String message;
	private List<String> results;

}
