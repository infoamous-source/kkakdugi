export interface AuthError {
  title: string;
  reason: string;
  solution: string;
}

export function parseAuthError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message || '';

    // Supabase 미설정 (환경변수 없음)
    if (message.includes('supabase_not_configured')) {
      return {
        title: '서버 설정 오류 (Server Configuration Error)',
        reason: '서버 연결이 설정되지 않았습니다 (Server connection not configured)',
        solution: '관리자에게 문의해주세요 (Please contact the administrator)',
      };
    }

    // 선생님코드 검증 실패
    if (message.includes('invalid_instructor_code')) {
      return {
        title: '선생님코드 오류 (Teacher Code Error)',
        reason: '유효하지 않은 선생님코드입니다 (Invalid teacher code)',
        solution: '선생님에게 올바른 코드를 확인해주세요 (Please check the correct code with your teacher)',
      };
    }

    // 이미 등록된 이메일
    if (message.includes('already registered') || message.includes('23505') || message.includes('already been registered')) {
      return {
        title: '회원가입 실패 (Registration Failed)',
        reason: '이미 사용 중인 이메일입니다 (This email is already registered)',
        solution: '다른 이메일을 사용하거나 로그인해주세요 (Use a different email or log in)',
      };
    }

    // 비밀번호 약함
    if (message.includes('weak_password') || message.includes('Password should be') || message.toLowerCase().includes('password')) {
      return {
        title: '비밀번호 오류 (Password Error)',
        reason: '비밀번호가 너무 약합니다 (Password is too weak)',
        solution: '영문, 숫자, 특수문자를 포함하여 8자 이상 입력하세요 (Use 8+ chars with letters, numbers, special chars)',
      };
    }

    // 로그인 실패
    if (message.includes('invalid_credentials') || message.includes('Invalid login')) {
      return {
        title: '로그인 실패 (Login Failed)',
        reason: '이메일 또는 비밀번호가 올바르지 않습니다 (Invalid email or password)',
        solution: '입력한 정보를 다시 확인하세요 (Please check your credentials)',
      };
    }

    // DB 에러 (트리거 실패 등)
    if (message.includes('Database error')) {
      return {
        title: '등록 실패 (Registration Failed)',
        reason: '서버에서 사용자 정보를 처리하지 못했습니다 (Could not process user data on server)',
        solution: '이미 등록된 이메일인지 확인하거나, 잠시 후 다시 시도해주세요 (Check if email is already registered, or try again later)',
      };
    }

    // 소셜 로그인 실패
    if (message.includes('oauth') || message.includes('OAuth') || message.includes('provider')) {
      return {
        title: '소셜 로그인 실패 (Social Login Failed)',
        reason: '소셜 로그인에 실패했습니다 (Social login failed)',
        solution: '다시 시도하거나 이메일로 로그인하세요 (Try again or use email login)',
      };
    }

    // 일반적인 등록 실패
    if (message.includes('register_failed')) {
      return {
        title: '등록 실패 (Registration Failed)',
        reason: '회원가입에 실패했습니다 (Registration failed)',
        solution: '잠시 후 다시 시도해주세요 (Please try again later)',
      };
    }
  }

  return {
    title: '오류 발생 (Error)',
    reason: '알 수 없는 오류가 발생했습니다 (An unknown error occurred)',
    solution: '네트워크 연결을 확인하고 다시 시도하세요 (Check your network connection and try again)',
  };
}
