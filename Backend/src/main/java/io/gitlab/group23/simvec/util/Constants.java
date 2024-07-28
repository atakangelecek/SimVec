package io.gitlab.group23.simvec.util;

public class Constants {

	public static final String HOST_URL = "http://localhost:8080";
	public static final String API = "/api";

	public final static String COMPANY_EMAIL = "simvec_project@outlook.com";
	public final static String MAIL_SUBJECT = "Please verify your registration";
	public final static String MAIL_TEMPLATE = "<p>Dear %s,</p>"
			+ "<p>Please click the link below to verify your registration:</p>"
			+ "<h3><a href='%s/verify?code=%s'>VERIFY</a></h3>"
			+ "<p>Thank you<br>The Your Company Team</p>";

	public final static String SEARCHED_IMAGE_FILE_NAME = "searched-image.jpeg";

}
