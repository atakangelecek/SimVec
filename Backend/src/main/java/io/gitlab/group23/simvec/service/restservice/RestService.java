package io.gitlab.group23.simvec.service.restservice;

import java.io.IOException;
import java.net.URI;

public interface RestService<P, R> {

	R sendGetRequest(URI uri);

	R sendPostRequest(URI uri, P entity) throws IOException, InterruptedException;

}
