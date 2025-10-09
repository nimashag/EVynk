# Deploy C# (ASP.NET Core) Web API or MVC app to IIS by publishing manually


🧩 Step 1 – Install prerequisites
---------------------------------

Make sure these are installed on your machine (Windows):

1.  **.NET SDK / Runtime** – your app’s target version (e.g., .NET 8 SDK)👉 Download from dotnet.microsoft.com
    
2.  **IIS (Web Server)** – enable from _Windows Features_:
    
    *   Open **“Turn Windows features on or off”**
        
    *   Check ✅ **Internet Information Services**
        
    *   Expand → **World Wide Web Services → Application Development Features**
        
        *   Enable:
            
            *   ASP.NET 4.8
                
            *   .NET Extensibility
                
            *   ISAPI Extensions + ISAPI Filters
                
            *   (Optional) WebSocket Protocol
                
This installs the **ASP.NET Core Module** that lets IIS host Kestrel apps.

3. **ASP.NET Core Hosting Bundle**: Install the Hosting Bundle matching your .NET SDK version.

https://dotnet.microsoft.com/en-us/download/dotnet/8.0

This installs the ASP.NET Core Module (ANCM), which allows IIS to host Kestrel-based applications.
    

⚙️ Step 2 – Build & Publish from VS Code
----------------------------------------

Open a terminal in your project folder and run:

```
cd /c/inetpub/wwwroot/ev-booking-backend/
dotnet publish -c Release -o ./publish
```

This:

*   Builds your app in **Release** configuration
    
*   Places the output in a folder named **publish**
    

After completion, you’ll have files like:

```
publish/
 ├── yourapp.dll
 ├── web.config
 ├── appsettings.json
 ├── wwwroot/
 └── ...

```


🌐 Step 3 – Configure IIS Website
---------------------------------

1.  **Open IIS Manager** (inetmgr)
    
2.  Right-click **Sites → Add Website…**
    
3.  Fill in:
    
    *   **Site name:** EVynk
        
    *   **Physical path:** Browse to your publish folder (`/c/inetpub/wwwroot/ev-booking-backend/publish`)
        
    *   **Port:** e.g., `8099`
        
4.  Click **OK**
    

🔐 Step 4 – Set App Pool Configuration
--------------------------------------

1.  In IIS Manager, open **Application Pools**
    
2.  Find your app’s pool → **Right-click > Advanced Settings**
    
3.  ASP.NET Core runs on Kestrel, not the IIS CLR pipeline.
    
4.  Ensure **Identity = ApplicationPoolIdentity**
    

🧱 Step 5 – Test and Verify
---------------------------

*   On Postman, send a GET request to: http://localhost:8099/api/hello


-------------------------------------------

#### Important Commands

Restart IIS:
```
iisreset
```




