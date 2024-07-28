package io.gitlab.group23.simvec.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImageSynchronizationService {

    @Value("${gallery.images.save-directory}")
    private String SAVE_DIRECTORY;

    public List<String> getImages(String username) {
        try {
            Path userFolder = Paths.get(SAVE_DIRECTORY, username);

            return Files.list(userFolder)
                    .filter(Files::isRegularFile)
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .filter(name -> name.endsWith(".jpg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".jpeg"))
                    .collect(Collectors.toList());

        } catch (NoSuchFileException e) {
            throw new RuntimeException("Folder not found for user: " + username, e);

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving image files for user: " + username, e);
        }
    }

    public void deleteImages(String username, List<String> imageNames) {
        Path userFolder = Paths.get(SAVE_DIRECTORY, username);

        for (String imageName : imageNames) {
            try {
                Path imagePath = userFolder.resolve(imageName);
                if (Files.exists(imagePath)) {
                    Files.delete(imagePath);
                }
            } catch (IOException e) {
                throw new RuntimeException("Error deleting image: " + imageName, e);
            }
        }
    }

    // New method to save uploaded images
    public void saveImages(String username, List<MultipartFile> images) {
        Path userFolder = Paths.get(SAVE_DIRECTORY, username);

        if (!Files.exists(userFolder)) {
            try {
                Files.createDirectories(userFolder);
            } catch (IOException e) {
                throw new RuntimeException("Error creating directory for user: " + username, e);
            }
        }

        for (MultipartFile image : images) {
            Path targetPath = userFolder.resolve(image.getOriginalFilename());

            try {
                image.transferTo(targetPath.toFile());
            } catch (IOException e) {
                throw new RuntimeException("Error saving image: " + image.getOriginalFilename(), e);
            }
        }
    }
}
