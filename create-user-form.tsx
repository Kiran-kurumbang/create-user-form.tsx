import { useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState('');

  const validatePassword = (pwd: string): string[] => {
    const result: string[] = [];
    if (pwd.length < 10) result.push('Password must be at least 10 characters long');
    if (pwd.length > 24) result.push('Password must be at most 24 characters long');
    if (/\s/.test(pwd)) result.push('Password cannot contain spaces');
    if (!/[0-9]/.test(pwd)) result.push('Password must contain at least one number');
    if (!/[A-Z]/.test(pwd)) result.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(pwd)) result.push('Password must contain at least one lowercase letter');
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePassword(password);
    setErrors(validationErrors);
    setApiError('');

    if (!username || validationErrors.length > 0) return;

    try {
      const res = await fetch(
        'https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer YOUR_TOKEN_HERE', // replace with your actual token
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (res.ok) {
        setUserWasCreated(true);
      } else if (res.status === 400) {
        const data = await res.json();
        if (data.error?.includes('password not allowed')) {
          setApiError('Sorry, this password is not allowed.');
        } else {
          setApiError('Validation error, please try again.');
        }
      } else if (res.status === 401 || res.status === 403) {
        setApiError('Not authorized. Check your token.');
      } else {
        setApiError('Something went wrong. Try again.');
      }
    } catch {
      setApiError('Network error. Please try again.');
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        <label htmlFor="username" style={formLabel}>
          Username
        </label>
        <input
          id="username"
          name="username"
          aria-label="Username"
          style={formInput}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password" style={formLabel}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          aria-label="Password"
          aria-invalid={errors.length > 0}
          style={formInput}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors(validatePassword(e.target.value));
            setApiError('');
          }}
        />

        {/* Client-side validation errors */}
        {errors.length > 0 && (
          <ul style={{ color: 'red', margin: 0, paddingLeft: '20px' }}>
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}

        {/* API error */}
        {apiError && <p style={{ color: 'red' }}>{apiError}</p>}

        <button type="submit" style={formButton}>
          Create User
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };


const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};
