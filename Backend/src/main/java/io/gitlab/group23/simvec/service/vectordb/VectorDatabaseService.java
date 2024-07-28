package io.gitlab.group23.simvec.service.vectordb;

import io.gitlab.group23.simvec.model.VectorDatabaseRequest;
import io.gitlab.group23.simvec.service.restservice.RestService;
import io.gitlab.group23.simvec.util.ImageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import static io.gitlab.group23.simvec.util.Constants.SEARCHED_IMAGE_FILE_NAME;

@Service
public class VectorDatabaseService {

	@Value("${vector-database.base-url}")
	private String BASE_URL;

	@Value("${vector-database.endpoints.image-based-search}")
	private String IMAGE_BASED_SEARCH_ENDPOINT;

	@Value("${vector-database.endpoints.text-based-search}")
	private String TEXT_BASED_SEARCH_ENDPOINT;

	@Value("${search.image.save-directory}")
	private String SEARCH_IMAGE_SAVE_DIRECTORY;

	private final RestService<VectorDatabaseRequest, List<String>> vectorDatabaseRequestService;

	@Autowired
	public VectorDatabaseService(RestService<VectorDatabaseRequest, List<String>> vectorDatabaseRequestService) {
		this.vectorDatabaseRequestService = vectorDatabaseRequestService;
	}

	public List<byte[]> executeImageBasedSearch(MultipartFile image, String topk, String username) throws IOException, InterruptedException {
		ImageUtil.saveImage(SEARCHED_IMAGE_FILE_NAME, SEARCH_IMAGE_SAVE_DIRECTORY, image.getBytes());
		List<String> similarImagePaths = vectorDatabaseRequestService.sendPostRequest(
				this.getURI(BASE_URL, IMAGE_BASED_SEARCH_ENDPOINT),
				new VectorDatabaseRequest(SEARCH_IMAGE_SAVE_DIRECTORY + "/" + SEARCHED_IMAGE_FILE_NAME, topk, username)
		);
		return this.getAllImages(similarImagePaths);
	}

	public List<byte[]> executeTextBasedSearch(VectorDatabaseRequest vectorDatabaseRequest) throws IOException, InterruptedException {
		List<String> similarImagePaths = vectorDatabaseRequestService.sendPostRequest(
				this.getURI(BASE_URL, TEXT_BASED_SEARCH_ENDPOINT),
				vectorDatabaseRequest
		);
		return this.getAllImages(similarImagePaths);
	}

	private URI getURI(String baseUrl, String endpoint) {
		return URI.create(baseUrl + endpoint);
	}

	private List<byte[]> getAllImages(List<String> imagePaths) {
		List<byte[]> images = new ArrayList<>();
		for (String imagePath : imagePaths) {
			images.add(getImage(imagePath));
		}
		return images;
	}

	private byte[] getImage(String imagePath) {
		return ImageUtil.getImageData(imagePath);
	}

}
