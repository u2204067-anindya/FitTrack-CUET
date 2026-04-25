import smtplib
from email.message import EmailMessage
from app.core.config import settings

def send_verification_email(to_email: str, token: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("Warning: SMTP_USER or SMTP_PASSWORD not set. Skipping verification email.")
        return False
        
    msg = EmailMessage()
    msg['Subject'] = 'Verify your FitTrack CUET Email'
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    
    html_content = f"""
    <html>
      <body>
        <h2>Welcome to FitTrack CUET!</h2>
        <p>Please use the following One-Time Password (OTP) to verify your email address and activate your account:</p>
        <h3 style="letter-spacing: 5px; color: #ff3333; font-size: 24px; font-weight: bold;">{token}</h3>
        <p>Enter this code on the verification page.</p>
        <p>This OTP will expire in 15 minutes.</p>
      </body>
    </html>
    """
    
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')
    
    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email logic: {str(e)}")
        return False
