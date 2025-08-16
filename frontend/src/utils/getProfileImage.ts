import { API_CONFIG, APP_CONFIG } from "@/config"

export const getProfileImageUrl = (image: string) => {
  // Debug logging only in development
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('getProfileImageUrl called with:', { 
  //     image, 
  //     API_CONFIG: API_CONFIG.IMAGE_BASE_URL, 
  //     DEFAULT_AVATAR: APP_CONFIG.DEFAULT_AVATAR 
  //   });
  // }
  
  // If no image provided, use default
  if (!image || image === '' || image === null || image === undefined) {
    return APP_CONFIG.DEFAULT_AVATAR;
  }
  
  // If it's already a full URL (starts with http/https), return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // If it's just the default filename (like 'avatar.jpg'), treat it as default
  if (image === 'avatar.jpg' || image === APP_CONFIG.DEFAULT_AVATAR.replace('/', '')) {
    return APP_CONFIG.DEFAULT_AVATAR;
  }
  
  // Ensure we have a valid base URL
  const baseUrl = API_CONFIG.IMAGE_BASE_URL || 'http://localhost:3001/';
  
  // Construct full URL from API base + image path
  const fullUrl = `${baseUrl}${image}`;
  
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('Constructed image URL:', fullUrl);
  // }
  
  return fullUrl;
}
