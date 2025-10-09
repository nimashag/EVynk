# Email Service Setup Instructions

## Overview
The email service has been implemented to automatically send login credentials to station operators when they are created by back office users.

## Configuration

### 1. Update appsettings.json
Update the email settings in `ev-booking-backend/appsettings.json`:

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "EVynk Booking System"
  }
}
```

### 2. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SmtpPassword`

### 3. Alternative SMTP Providers
You can use other SMTP providers by updating the settings:

**Outlook/Hotmail:**
```json
{
  "SmtpServer": "smtp-mail.outlook.com",
  "SmtpPort": 587
}
```

**Custom SMTP:**
```json
{
  "SmtpServer": "your-smtp-server.com",
  "SmtpPort": 587
}
```

## How It Works

### 1. User Creation Flow
When a back office user creates a station operator:
1. User is created in the database
2. If the role is `StationOperator`, an email is automatically sent
3. Email contains login credentials and welcome message

### 2. Email Content
The email includes:
- Welcome message
- Login credentials (email and password)
- Security instructions
- Professional HTML formatting

### 3. Error Handling
- Email failures don't prevent user creation
- Errors are logged for debugging
- Test endpoint available for verification

## Testing

### Test Endpoint
Use the test endpoint to verify email functionality:

```bash
POST /api/auth/test-email
Authorization: Bearer <backoffice-token>
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "testpassword"
}
```

### Manual Testing
1. Login as a back office user
2. Create a new station operator
3. Check the operator's email for credentials

## Security Notes

1. **App Passwords**: Use app-specific passwords, not your main account password
2. **Environment Variables**: Consider using environment variables for production
3. **Email Content**: Credentials are sent in plain text - consider security implications
4. **Rate Limiting**: Implement rate limiting for email sending in production

## Production Considerations

1. **Remove Test Endpoint**: Remove the `/test-email` endpoint before production
2. **Environment Variables**: Move sensitive settings to environment variables
3. **Email Templates**: Consider using external email template services
4. **Monitoring**: Add proper logging and monitoring for email delivery
5. **Queue System**: Consider implementing email queues for better reliability

## Troubleshooting

### Common Issues
1. **Authentication Failed**: Check app password and 2FA settings
2. **Connection Timeout**: Verify SMTP server and port settings
3. **Email Not Received**: Check spam folder and email address
4. **SSL/TLS Issues**: Ensure proper SSL configuration

### Debug Steps
1. Check application logs for email service errors
2. Verify SMTP settings in configuration
3. Test with the test endpoint
4. Check network connectivity to SMTP server
