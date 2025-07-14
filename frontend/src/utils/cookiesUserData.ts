import Cookies from 'js-cookie'

export function getUserData() {
  const cookies = Cookies.get('user');
  if (cookies) {
    try {
      return JSON.parse(cookies);
    } catch (error) {
      console.error('Error parsing user data from cookies:', error);
      return null;
    }
  }
  return null;
}