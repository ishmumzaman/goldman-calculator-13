# How To Run The App

This guide is for someone using **Windows** who may not be comfortable with coding tools.

You will start:
- the **backend** (the server that does the calculations)
- the **frontend** (the website you open in your browser)

You need to keep **both** running while you use the app.

## Before You Start

You need these installed on your computer:
- **Java 21**
- **Maven**
- **Node.js**

If you are not sure whether they are installed, follow the steps below anyway. The checks will tell you.

## Folder You Should Have

These instructions assume the project is already on your computer here:

```text
c:\goldman-stuff\goldman-calculator-13
```

If your folder is somewhere else, replace that path in the commands below with your real folder path.

## Step 1: Open The First PowerShell Window

1. Click the **Start** menu.
2. Type **PowerShell**.
3. Click **Windows PowerShell**.

Leave this window open.

## Step 2: Go To The Project Folder

Copy and paste this into PowerShell, then press **Enter**:

```powershell
cd c:\goldman-stuff\goldman-calculator-13
```

## Step 3: Make Sure Java 21 Is Being Used

The backend must use **Java 21**. If your computer still uses Java 8, the backend will fail.

First, check your current Java version:

```powershell
java -version
```

If you see **21** in the result, go to **Step 4**.

If you do **not** see Java 21, try this exact command:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

Then check again:

```powershell
java -version
mvn -version
```

What you want to see:
- `java -version` should show **21**
- `mvn -version` should work without errors

If that Java folder does not exist on your computer, ask the teammate who set up the machine where Java 21 is installed, then replace the path above.

## Step 4: Start The Backend

In the same PowerShell window, run:

```powershell
cd backend
mvn spring-boot:run
```

Wait. This can take a little time the first time.

When it is ready, the backend should be running on:

```text
http://localhost:8080
```

Important:
- **Do not close this PowerShell window**
- Leave it running the whole time you use the app

## Step 5: Test The Backend Quickly

Open your browser and visit:

```text
http://localhost:8080/api/v1/funds
```

If the backend is working, you should see raw text or JSON in the browser. It does not need to look pretty.

If that page does not load, stop and fix the backend before moving on.

## Step 6: Open A Second PowerShell Window

1. Open **another** PowerShell window.
2. Do not close the first one.

You should now have:
- one window for the backend
- one window for the frontend

## Step 7: Go To The Frontend Folder

In the **second** PowerShell window, run:

```powershell
cd c:\goldman-stuff\goldman-calculator-13\frontend
```

## Step 8: Create The Frontend Environment File

You need a small settings file so the website knows where the backend is.

### Option A: Using File Explorer

1. Open this folder in File Explorer:

```text
c:\goldman-stuff\goldman-calculator-13\frontend
```

2. Create a new file named:

```text
.env
```

3. Open the file in Notepad.
4. Paste this into it:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_DEFAULT_RISK_FREE_RATE=0.0435
```

5. Save the file.

### Option B: Using PowerShell

If you prefer, you can create the file by running this command:

```powershell
@'
VITE_API_BASE_URL=http://localhost:8080
VITE_DEFAULT_RISK_FREE_RATE=0.0435
'@ | Set-Content .env
```

## Step 9: Install Frontend Packages

Still in the **second** PowerShell window, run:

```powershell
npm install
```

This may take a minute.

You only need to do this again if packages are deleted or changed.

## Step 10: Start The Frontend

Run:

```powershell
npm run dev
```

After it starts, PowerShell should show a local website address, usually:

```text
http://localhost:5173
```

## Step 11: Open The Website

Open your browser and go to:

```text
http://localhost:5173
```

You should see the mutual fund calculator interface.

## Step 12: Use The App

Basic flow:

1. Open the **Calculator** page.
2. Choose a fund.
3. Enter an initial investment amount.
4. Enter the number of years.
5. Click **Calculate Future Value**.
6. Review the results page.
7. Try **Compare Funds**, **Saved History**, and **Portfolio**.

## Very Important: Keep Both Windows Open

While you are using the app:
- keep the **backend PowerShell** window open
- keep the **frontend PowerShell** window open

If you close either one, part of the app will stop working.

## How To Stop Everything

When you are done:

1. Click the backend PowerShell window.
2. Press **Ctrl + C**
3. Click the frontend PowerShell window.
4. Press **Ctrl + C**

That stops both programs.

## Common Problems And Fixes

### Problem: `java -version` shows Java 8

Cause:
- your computer is using the wrong Java version

Fix:
- follow **Step 3** carefully
- make sure Java 21 is active before starting the backend

### Problem: `mvn spring-boot:run` fails immediately

Cause:
- Java 21 is not active
- Maven is not installed

Fix:
- run these again:

```powershell
java -version
mvn -version
```

### Problem: The website opens, but calculations fail

Cause:
- the backend is not running
- the `.env` file is missing or incorrect

Fix:
- make sure the backend window is still open
- check that this works in your browser:

```text
http://localhost:8080/api/v1/funds
```

- check that `frontend\.env` contains:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_DEFAULT_RISK_FREE_RATE=0.0435
```

### Problem: `http://localhost:5173` does not open

Cause:
- the frontend did not start correctly

Fix:
- go back to the second PowerShell window
- make sure `npm run dev` is still running
- if needed, run:

```powershell
npm install
npm run dev
```

### Problem: I closed one of the PowerShell windows by accident

Fix:
- reopen PowerShell
- repeat the steps for whichever part you closed

## Quick Start Summary

If you already know the basics, these are the only commands you need.

### Backend window

```powershell
cd c:\goldman-stuff\goldman-calculator-13
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd backend
mvn spring-boot:run
```

### Frontend window

```powershell
cd c:\goldman-stuff\goldman-calculator-13\frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```
