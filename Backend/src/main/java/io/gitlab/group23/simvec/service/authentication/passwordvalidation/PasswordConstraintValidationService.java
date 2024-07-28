package io.gitlab.group23.simvec.service.authentication.passwordvalidation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.stereotype.Service;

@Service
public class PasswordConstraintValidationService implements ConstraintValidator<ValidPassword, String> {

	@Override
	public void initialize(ValidPassword constraintAnnotation) {
	}

	@Override
	public boolean isValid(String password, ConstraintValidatorContext context) {
		if (password == null) {
			return false;
		}

		return applyValidationLogic(password);
	}

	private boolean applyValidationLogic(String password) {
		boolean hasUppercase = !password.equals(password.toLowerCase());
		boolean hasLowercase = !password.equals(password.toUpperCase());
		boolean isAtLeast12   = password.length() >= 12;

		return hasUppercase && hasLowercase && isAtLeast12;
	}

}
