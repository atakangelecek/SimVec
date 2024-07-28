package io.gitlab.group23.simvec.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.gitlab.group23.simvec.model.SimvecUser;
import io.gitlab.group23.simvec.model.UserProfileInfo;
import io.gitlab.group23.simvec.model.VectorDatabaseRequest;
import io.gitlab.group23.simvec.service.TranslateText;
import io.gitlab.group23.simvec.service.UserService;
import io.gitlab.group23.simvec.service.ImageSynchronizationService;
import io.gitlab.group23.simvec.service.TranslateText;
import io.gitlab.group23.simvec.service.UserService;
import io.gitlab.group23.simvec.service.*;
import io.gitlab.group23.simvec.service.authentication.jwt.AuthenticationService;
import io.gitlab.group23.simvec.service.vectordb.ImagePopulationService;
import io.gitlab.group23.simvec.service.vectordb.VectorDatabaseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.type.TypeReference; // Import the correct class
import com.fasterxml.jackson.databind.ObjectMapper; // Import ObjectMapper for JSON operations

import java.awt.*;
import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"})
@Slf4j
public class SimvecController {

	private final VectorDatabaseService vectorDatabaseService;
	private final ImagePopulationService imagePopulationService;
	private final TranslateText translateText;
	private final AuthenticationService authenticationService;
	private final UserService userService;

	private final ImageSynchronizationService imageSynchronizationService;

	@Autowired
	public SimvecController(VectorDatabaseService vectorDatabaseService, TranslateText translateText, AuthenticationService authenticationService, UserService userService, ImagePopulationService imagePopulationService, ImageSynchronizationService imageSynchronizationService) {
		this.vectorDatabaseService = vectorDatabaseService;
        this.translateText = translateText;
		this.authenticationService = authenticationService;
		this.userService = userService;
		this.imagePopulationService = imagePopulationService;
		this.imageSynchronizationService = imageSynchronizationService;
	}

	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@Validated @RequestBody SimvecUser simvecUser) {
		//System.out.println("hello");
		return ResponseEntity.ok(authenticationService.register(simvecUser));
	}


	@PostMapping("/image-based-search/{topk}")
	@PreAuthorize("hasAuthority('ROLE_USER')")
	public ResponseEntity<List<byte[]>> imageBasedSearch(@RequestParam("file") MultipartFile image, @PathVariable(name = "topk") String topk) {
		System.out.println("in image based search");
		try {
			return ResponseEntity.ok(vectorDatabaseService.executeImageBasedSearch(image, topk, authenticationService.getCurrentUserByToken().getUsername()));
		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(null);
		} catch (InterruptedException e) {
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
		}
	}


	@PostMapping("/text-based-search")
	@PreAuthorize("hasAuthority('ROLE_USER')")
	public ResponseEntity<List<byte[]>> textBasedSearch(@RequestBody VectorDatabaseRequest vectorDatabaseRequest) throws IOException, InterruptedException {
		System.out.println("Text Based Search Endpoint");
		//String translatedText = translateText.translateText("hidden-marker-416811" , "en", vectorDatabaseRequest.getInput());
		//vectorDatabaseRequest.setInput(translatedText);

		vectorDatabaseRequest.setUsername(authenticationService.getCurrentUserByToken().getUsername());

		List<byte[]> images = vectorDatabaseService.executeTextBasedSearch(vectorDatabaseRequest);
		return ResponseEntity.ok(images);
	}

	@PostMapping("/transfer-images")
	@PreAuthorize("hasAuthority('ROLE_USER')")
	public ResponseEntity<?> transferImages(@RequestParam("images") MultipartFile[] images) {
		if (imagePopulationService.saveImages(images)) {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Images are saved successfully");
		}
		return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("Some images could not be saved!");
	}

	@PostMapping("/synchronize-images")
	public ResponseEntity<?> synchronizeImages(@RequestParam("username") String username) {
		System.out.println("Request received with username: " + username);

		try {
			List<String> imageFiles = imageSynchronizationService.getImages("alper"); // Use the passed username

			return new ResponseEntity<>(imageFiles, HttpStatus.OK);

		} catch (RuntimeException e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// New endpoint to handle image synchronization
	@PostMapping("/add-delete-images")
	public ResponseEntity<?> addDeleteImages(
			@RequestParam("username") String username,
			@RequestPart("images_to_delete") String imagesToDelete,
			@RequestPart(value = "images_to_add", required = false) List<MultipartFile> imagesToAdd // Make optional
	) {
		ObjectMapper objectMapper = new ObjectMapper();

		try {
			// Deserialize JSON into a list of strings
			List<String> imagesToDeleteList = objectMapper.readValue(imagesToDelete, new TypeReference<List<String>>() {});

			imageSynchronizationService.deleteImages(username, imagesToDeleteList);

			// Only attempt to save new images if there are any to add
			if (imagesToAdd != null && !imagesToAdd.isEmpty()) {
				imageSynchronizationService.saveImages(username, imagesToAdd); // Save new images
			}

			return ResponseEntity.ok("Synchronization completed");

		} catch (JsonProcessingException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid JSON format");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
		}
	}

    @GetMapping("/get-user-info")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<UserProfileInfo> getUserInfo() {
        SimvecUser simvecUser = authenticationService.getCurrentUserByToken();
        return ResponseEntity.ok(new UserProfileInfo(
                simvecUser.getUsername(),
                simvecUser.getEmail(),
                simvecUser.getNumberOfPhotos()
        ));
    }

}
