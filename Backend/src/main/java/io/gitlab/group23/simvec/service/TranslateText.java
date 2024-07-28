package io.gitlab.group23.simvec.service;
// Imports the Google Cloud Translation library.
import com.google.cloud.translate.v3.LocationName;
import com.google.cloud.translate.v3.TranslateTextRequest;
import com.google.cloud.translate.v3.TranslateTextResponse;
import com.google.cloud.translate.v3.Translation;
import com.google.cloud.translate.v3.TranslationServiceClient;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class TranslateText {

    // Set and pass variables to overloaded translateText() method for translation.
    public String translateText() throws IOException {
        String projectId =  "hidden-marker-416811";
        String targetLanguage = "en";
        String text = "¡Hola Mundo!";
        String t = "";
        t = translateText(projectId, targetLanguage, text);
        return t;
    }

    // Translate text to target language.
    public String translateText(String projectId, String targetLanguage, String text)
            throws IOException {

        // Initialize client that will be used to send requests. This client only needs to be created
        // once, and can be reused for multiple requests. After completing all of your requests, call
        // the "close" method on the client to safely clean up any remaining background resources.
        try (TranslationServiceClient client = TranslationServiceClient.create()) {
            // Supported Locations: `global`, [glossary location], or [model location]
            // Glossaries must be hosted in `us-central1`
            // Custom Models must use the same location as your model. (us-central1)
            LocationName parent = LocationName.of(projectId, "global");

            // Supported Mime Types: https://cloud.google.com/translate/docs/supported-formats
            TranslateTextRequest request =
                    TranslateTextRequest.newBuilder()
                            .setParent(parent.toString())
                            .setMimeType("text/plain")
                            .setTargetLanguageCode(targetLanguage)
                            .addContents(text)
                            .build();

            TranslateTextResponse response = client.translateText(request);
            String finalResult  = "";
            // Display the translation for each input text provided
            for (Translation translation : response.getTranslationsList()) {
                System.out.printf("Translated text: %s\n", translation.getTranslatedText());
                finalResult = finalResult.concat(translation.getTranslatedText());
            }
            return finalResult;
        }
    }
}