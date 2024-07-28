package io.gitlab.group23.simvec.service.vectordb;

import io.gitlab.group23.simvec.model.SimvecUser;
import io.gitlab.group23.simvec.service.UserService;
import io.gitlab.group23.simvec.service.authentication.jwt.AuthenticationService;
import io.gitlab.group23.simvec.util.ImageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ImagePopulationService {

	@Value("${gallery.images.save-directory}")
	private String SAVE_DIRECTORY;

	private final AuthenticationService authenticationService;
	private final UserService userService;

	@Autowired
	public ImagePopulationService(AuthenticationService authenticationService, UserService userService) {
		this.authenticationService = authenticationService;
		this.userService = userService;
	}

	public boolean saveImages(MultipartFile[] images) {
		SimvecUser simvecUser = authenticationService.getCurrentUserByToken();
		int numberOfSavedImages = saveImages(images, simvecUser.getUsername());
		simvecUser.setNumberOfPhotos(simvecUser.getNumberOfPhotos() + numberOfSavedImages);
		userService.updateUser(simvecUser);
		return images.length == numberOfSavedImages;
	}

	private int saveImages(MultipartFile[] images, String saveFolder) {
		int numberOfSavedImages = 0;
		for (MultipartFile image : images) {
			try {
				ImageUtil.saveImage(
						image.getOriginalFilename(),
						getImageSavePath(saveFolder),
						image.getBytes()
				);
				numberOfSavedImages++;
			} catch (IOException e) {
				throw new RuntimeException("Image bytes could not be read", e);
			}
		}
		return numberOfSavedImages;
	}

	private String getImageSavePath(String saveFolder) {
		return SAVE_DIRECTORY + "/" + saveFolder + "/";
	}

}
