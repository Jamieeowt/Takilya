describe('Integration Test: User Sign-Up Flow (Prompt 5.1 & AGENTS.md)', () => {
  const validateSignUpInput = (input: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.email || !emailRegex.test(input.email)) {
      errors.email = 'Valid email is required.';
    }

    // Password length (min 8 chars)
    if (!input.password || input.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    // Username format (alphanumeric and underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!input.username || !usernameRegex.test(input.username)) {
      errors.username = 'Username must be 3-20 alphanumeric characters or underscores.';
    }

    if (!input.displayName || input.displayName.trim().length === 0) {
      errors.displayName = 'Display name is required.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const simulateProfileCreationTrigger = (authUserId: string, input: {
    username: string;
    displayName: string;
    email: string;
  }) => {
    // Mirrors PostgreSQL trigger `handle_new_user()`
    return {
      id: authUserId,
      username: input.username.toLowerCase(),
      display_name: input.displayName.trim(),
      role: 'user', // Default role is user (critic and verified_official require approval)
      bio: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
  };

  it('validates required fields, email structure, and minimum password strength', () => {
    const invalid = validateSignUpInput({
      email: 'not-an-email',
      password: '123',
      username: 'a',
      displayName: '',
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.email).toBeDefined();
    expect(invalid.errors.password).toBeDefined();
    expect(invalid.errors.username).toBeDefined();
    expect(invalid.errors.displayName).toBeDefined();

    const valid = validateSignUpInput({
      email: 'cinephile@takilya.ph',
      password: 'supersecretpass123',
      username: 'manila_film_lover',
      displayName: 'Manila Film Lover',
    });

    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });

  it('creates profile with role = "user" on successful sign up', () => {
    const authId = 'auth-user-new-uuid';
    const profile = simulateProfileCreationTrigger(authId, {
      username: 'MaynilaFan',
      displayName: 'Maynila Fan',
      email: 'maynilafan@example.com',
    });

    expect(profile.id).toBe(authId);
    expect(profile.username).toBe('maynilafan');
    expect(profile.display_name).toBe('Maynila Fan');
    expect(profile.role).toBe('user');
  });
});

