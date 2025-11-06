const awsmobile = {
  "aws_project_region": "ap-southeast-1",
  "aws_cognito_region": "ap-southeast-1",
  "aws_user_pools_id": "ap-southeast-1_na1YdboYh",
  "aws_user_pools_web_client_id": "473si0l6cuskan47l80j0m1qb7",
  "oauth": {},
  "aws_cognito_username_attributes": ["USERNAME"],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": ["USERNAME"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": ["SMS"],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": [
      "REQUIRES_LOWERCASE",
      "REQUIRES_UPPERCASE", 
      "REQUIRES_NUMBERS",
      "REQUIRES_SYMBOLS"
    ]
  },
  "aws_cognito_verification_mechanisms": ["EMAIL"]
};

export default awsmobile;