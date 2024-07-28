package io.gitlab.group23.simvec.util;

import lombok.extern.slf4j.Slf4j;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
public class ImageUtil {

	public static void saveImage(String fileName, String directoryPath, byte[] data) {
		Path filePath = Paths.get(directoryPath);
		try {
			Files.createDirectories(filePath);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		String path = filePath.resolve(fileName).toString();
		log.info("File Path: " + path);
		try (FileOutputStream fileOutputStream = new FileOutputStream(path)) {
			fileOutputStream.write(data);
		} catch (IOException e) {
			throw new RuntimeException("Image could not be saved");
		}
	}

	public static byte[] getImageData(String imagePath) {
		try {
			System.out.println(imagePath);
			return Files.readAllBytes(Path.of(imagePath));
		} catch (Exception e) {
			throw new RuntimeException("Image could not be read");
		}
	}

}
