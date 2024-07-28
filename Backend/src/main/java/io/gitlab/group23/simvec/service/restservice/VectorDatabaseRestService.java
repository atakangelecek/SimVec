package io.gitlab.group23.simvec.service.restservice;

import com.google.gson.Gson;
import io.gitlab.group23.simvec.model.VectorDatabaseRequest;
import io.gitlab.group23.simvec.model.VectorDatabaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
@Slf4j
public class VectorDatabaseRestService implements RestService<VectorDatabaseRequest, List<String>> {

	private final Gson gson = new Gson();

	@Override
	public List<String> sendGetRequest(URI uri) {
		return null;
	}

	@Override
	public List<String> sendPostRequest(URI uri, VectorDatabaseRequest entity) throws IOException, InterruptedException {

		String jsonRequest = gson.toJson(entity);
		log.info("JSON request to be send: " + jsonRequest);

		HttpRequest postRequest = HttpRequest.newBuilder()
				.uri(uri)
				.POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
				.build();

		HttpClient httpClient = HttpClient.newHttpClient();

		HttpResponse<String> postResponse = httpClient.send(postRequest, HttpResponse.BodyHandlers.ofString());
		log.info("JSON response received: " + postResponse.body());

		VectorDatabaseResponse vectorDatabaseResponse = gson.fromJson(postResponse.body(), VectorDatabaseResponse.class);
		log.info("Vector Database Response: " + vectorDatabaseResponse.toString());

		return vectorDatabaseResponse.getResults();
	}

}
