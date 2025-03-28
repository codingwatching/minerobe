 ![logo](https://github.com/oleklukasiewicz/minerobe/assets/69370471/f9277a21-f817-47bd-b242-0770ed38f14a)

<h1 align="center">Digital wardrobe for minecraft skins</h1>

Minerobe is a project that allows for the customization of Minecraft skins through an advanced digital wardrobe. Designed with ease of sharing and combining different clothing items in mind, this program opens up new possibilities for the Minecraft community.

## Features:

### 1. Skin Customization: 
Users can tailor their skins by combining various clothing elements into unique combinations.

### 2. Sharing Outfits: 
With the sharing feature, players can share their created outfits with other community members.

### 3. Open Source Code: 
The entire project is available on GitHub, enabling the community to report bugs, propose features, and collaboratively develop Minerobe.

## Building project

### 1. Clone the repository
It will create copy of the repository on your local machine.

### 2. Setup database  
Create database called `minerobe` on your local SQL Server instance.
Run `update-database` or `script-migration` in Visual Studio for database structure migration.

### 3. Add environment variables
Create `.env` file in root directory of the project (minerobe.client) and add environment variables. You can find them in firebase settings.
```
Firebase (client side)
VITE_API_KEY=<value>
VITE_AUTH_DOMAIN=<value>
VITE_PROJECT_ID=<value>
VITE_STORAGE_BUCKET=<value>
VITE_MESSAGING_SENDER_ID=<value>
VITE_APP_ID=<value>
VITE_MEASUREMENT_ID=<value>
VITE_API_URL=<url to backend>
```
Add appsettings file in minerobe.api project and add connection to your firebase app for user authentication.
```
"Jwt": {
  "Authority": "https://securetoken.google.com/<your_app_id>",
  "Audience": "<your_app_id>"
}
```

Optionally you can add parameters for integration with minecraft services using MSAL.
```
 "MicrosoftAuth": {
   "ClientId": "<your-client-id>",
   "OriginUri": "<your-origin-uri (only for self hosted instances)>",
   "CacheDirectory": "<your-cache-directory>",
   "CacheFileName": "<your-cache-file-name>"
 }
```

## Screeenshots

![image](https://github.com/user-attachments/assets/eb087265-e79f-4fb7-9de2-ccca09647e02)
![image](https://github.com/user-attachments/assets/f4adb2ba-608b-4917-b499-cf825418ef27)
![image](https://github.com/user-attachments/assets/1d33f47a-ead1-4cd5-9b2d-3bd5ca70daea)






<!--# icons 
https://iconduck.com/search?query=vectorSetIds:140
](url)--!>
