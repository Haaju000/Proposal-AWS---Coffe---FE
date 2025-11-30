const imageService = {
  // Validate S3 URL from Swagger upload
  validateImageUrl: (url) => {
    if (!url || url.trim() === '') return { valid: true }; // Empty is OK
    
    try {
      const urlObj = new URL(url);
      
      // Check if it's a valid S3 URL
      if (urlObj.hostname.includes('s3.amazonaws.com') || 
          urlObj.hostname.includes('.s3.')) {
        return { valid: true };
      }
      
      // Check if it's a valid image URL with proper extension
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname)) {
        return { valid: true };
      }
      
      return { 
        valid: false, 
        error: 'Vui lòng sử dụng S3 URL từ Swagger upload hoặc URL ảnh hợp lệ' 
      };
    } catch {
      return { 
        valid: false, 
        error: 'URL không đúng định dạng. Ví dụ: https://coffeeshop-product-images.s3.amazonaws.com/drinks/abc.jpg' 
      };
    }
  },

  // Check if URL is an S3 URL  
  isS3Url: (url) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('s3.amazonaws.com') || urlObj.hostname.includes('.s3.');
    } catch {
      return false;
    }
  }
};

export default imageService;