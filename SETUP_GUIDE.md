# OrthoSync - Complete Setup Guide

### A Step-by-Step Guide for First-Time Developers

**App:** OrthoSync - Dental Practice Management App
**Built by:** Dr. Pooja Gangare
**Tech Stack:** React Native (Expo SDK 55), TypeScript, Firebase, Zustand
**Platforms:** iOS, Android, Web
**Repository:** https://github.com/zxrrcpandey/OrthoSync

---

> **Who is this guide for?**
> This guide is written for someone who has NEVER set up a development environment before.
> Every single step includes: what to do, what you will see, and what to do if something goes wrong.
> Read it top to bottom. Do not skip steps. Each step builds on the previous one.

---

## Table of Contents

1. [Section 1: macOS Software Installation](#section-1-macos-software-installation)
   - 1.1 [Install Homebrew](#11-install-homebrew)
   - 1.2 [Install Node.js (v20+)](#12-install-nodejs-v20)
   - 1.3 [Install Git](#13-install-git)
   - 1.4 [Install Watchman](#14-install-watchman-for-react-native)
   - 1.5 [Install VS Code](#15-install-vs-code-recommended-editor)
   - 1.6 [Install Xcode (for iOS)](#16-install-xcode-for-ios)
   - 1.7 [Install Android Studio (for Android)](#17-install-android-studio-for-android)
   - 1.8 [Install Expo CLI](#18-install-expo-cli)
2. [Section 2: Project Setup](#section-2-project-setup)
   - 2.1 [Clone the Repository](#21-clone-the-repository)
   - 2.2 [Install Dependencies](#22-install-dependencies)
   - 2.3 [Verify TypeScript](#23-verify-typescript)
   - 2.4 [Start the App](#24-start-the-app)
   - 2.5 [Running on Each Platform](#25-running-on-each-platform)
3. [Section 3: Firebase Setup (Backend)](#section-3-firebase-setup-backend)
   - 3.1 [Create Firebase Project](#31-create-firebase-project)
   - 3.2 [Enable Authentication](#32-enable-authentication)
   - 3.3 [Create Firestore Database](#33-create-firestore-database)
   - 3.4 [Enable Storage](#34-enable-storage)
   - 3.5 [Enable Cloud Messaging (FCM)](#35-enable-cloud-messaging-fcm)
   - 3.6 [Add Web App to Firebase](#36-add-web-app-to-firebase)
   - 3.7 [Update App Config](#37-update-app-config)
   - 3.8 [Add Android App to Firebase](#38-add-android-app-to-firebase)
   - 3.9 [Add iOS App to Firebase](#39-add-ios-app-to-firebase)
   - 3.10 [Install Firebase SDK](#310-install-firebase-sdk)
4. [Section 4: Push Notifications Setup](#section-4-push-notifications-setup)
   - 4.1 [Expo Push Notifications](#41-expo-push-notifications)
   - 4.2 [FCM for Android](#42-fcm-for-android)
   - 4.3 [APNs for iOS](#43-apns-for-ios)
5. [Section 5: WhatsApp Integration](#section-5-whatsapp-integration)
   - 5.1 [How WhatsApp Notifications Work](#51-how-whatsapp-notifications-work-in-orthosync)
   - 5.2 [Testing WhatsApp](#52-testing-whatsapp)
   - 5.3 [WhatsApp Business API (Optional)](#53-whatsapp-business-api-optional-advanced)
6. [Section 6: Building for Production](#section-6-building-for-production)
   - 6.1 [Configure app.json](#61-configure-appjson--appconfigjs)
   - 6.2 [Build for Android](#62-build-for-android-apkaab)
   - 6.3 [Build for iOS](#63-build-for-ios-ipa)
   - 6.4 [Submit to Google Play Store](#64-submit-to-google-play-store)
   - 6.5 [Submit to Apple App Store](#65-submit-to-apple-app-store)
7. [Section 7: Troubleshooting Guide](#section-7-troubleshooting-guide)
8. [Section 8: Environment Variables and Security](#section-8-environment-variables--security)

---

## Section 1: macOS Software Installation

Before you can run OrthoSync, you need to install several pieces of software on your Mac. This section walks you through every installation, one by one.

### Prerequisites

- A Mac computer running macOS 13 (Ventura) or later
- At least 50 GB of free disk space (Xcode alone needs ~15 GB)
- A stable internet connection
- Administrator access to your Mac (you need to be able to enter your password)

### How to Open Terminal

You will be using Terminal a lot. Here is how to open it:

1. Press `Command + Space` on your keyboard (this opens Spotlight Search)
2. Type `Terminal`
3. Press `Enter`
4. A window with a black or white background and a blinking cursor will appear -- this is Terminal

> **Tip:** Right-click the Terminal icon in your Dock and select "Options > Keep in Dock" so you can find it easily later.

---

### 1.1 Install Homebrew

#### What is Homebrew?

Homebrew is a "package manager" for macOS. Think of it like an App Store, but for developer tools. Instead of downloading installers from websites, you type a single command and Homebrew downloads and installs the software for you.

#### Step 1: Install Homebrew

Open Terminal and paste this entire command (copy it all at once), then press `Enter`:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### What you will see:

```
==> Checking for `sudo` access (which may request your password)...
Password:
```

Type your Mac login password. **You will NOT see any characters appear as you type** -- this is normal for security. Just type your password and press `Enter`.

Then you will see a long output like this:

```
==> This script will install:
/opt/homebrew/bin/brew
/opt/homebrew/share/doc/homebrew
/opt/homebrew/share/man/man1/brew.1
/opt/homebrew/share/zsh/site-functions/_brew
/opt/homebrew/etc/bash_completion.d/brew
...

Press RETURN/ENTER to continue or any other key to abort:
```

Press `Enter` to continue.

The installation will take 2-5 minutes. You will see lots of text scrolling. Wait until you see something like:

```
==> Installation successful!

==> Homebrew has enabled anonymous aggregate formulae and cask analytics.
...

==> Next steps:
- Run these commands in your terminal to add Homebrew to your PATH:
    echo >> /Users/yourusername/.zprofile
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/yourusername/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
```

**IMPORTANT:** If you see "Next steps" telling you to run additional commands, you MUST run them. Copy and paste each line one at a time into Terminal and press `Enter`:

```bash
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

#### Step 2: Verify Homebrew is installed

```bash
brew --version
```

**Expected output:**

```
Homebrew 4.x.x
```

(The exact version number does not matter, as long as you see a version.)

#### Troubleshooting

**Problem: `command not found: brew`**

This means Homebrew is not in your PATH. Run:

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Then try `brew --version` again.

If you are on an older Intel Mac (pre-2020), the path is different:

```bash
eval "$(/usr/local/bin/brew shellenv)"
```

**Problem: "Permission denied"**

Run the install command with `sudo`:

```bash
sudo /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Problem: "curl: command not found"**

This is extremely rare on macOS. Install Xcode Command Line Tools first:

```bash
xcode-select --install
```

Then try the Homebrew install command again.

---

### 1.2 Install Node.js (v20+)

#### What is Node.js and why v20+?

Node.js is a runtime that lets you run JavaScript code on your computer (not just in a browser). React Native and Expo use Node.js to build your app.

OrthoSync uses **Expo SDK 55**, which requires **Node.js version 20 or higher**. Older versions (16, 18) will cause build errors.

#### Step 1: Install Node.js 20

```bash
brew install node@20
```

**Expected output (takes 1-3 minutes):**

```
==> Downloading https://ghcr.io/v2/homebrew/core/node/20/manifests/20.x.x
...
==> Installing node@20
==> Pouring node@20--20.x.x.arm64_sonoma.bottle.tar.gz
...
==> Summary
🍺  /opt/homebrew/Cellar/node@20/20.x.x: 2,232 files, 61.3MB
```

If Homebrew tells you that node@20 is "keg-only" (meaning it is not automatically added to your PATH), run the command it suggests:

```bash
brew link node@20
```

If that gives an error about an existing node version, force it:

```bash
brew link --overwrite node@20
```

#### Step 2: Verify Node.js

```bash
node --version
```

**Expected output:**

```
v20.18.1
```

(Any version starting with `v20` or higher is fine.)

#### Step 3: Verify npm (comes with Node.js)

```bash
npm --version
```

**Expected output:**

```
10.8.2
```

(Any version starting with `10` is fine.)

#### Troubleshooting

**Problem: `command not found: node`**

Node was installed but not linked to your PATH. Run:

```bash
brew link node@20
```

If that fails:

```bash
brew link --overwrite --force node@20
```

Then close Terminal completely (Command + Q) and reopen it. Try `node --version` again.

**Problem: Already have an older version of Node (e.g., v16 or v18)**

Unlink the old version and install the new one:

```bash
brew unlink node@18
brew install node@20
brew link node@20
```

Or if you installed Node without a version specifier:

```bash
brew unlink node
brew install node@20
brew link node@20
```

**Problem: "Warning: node@20 is keg-only"**

This means Node was installed but not added to your PATH. The fix:

```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Then verify with `node --version`.

**Problem: Using nvm (Node Version Manager)**

If you use nvm, install Node 20 through nvm instead:

```bash
nvm install 20
nvm use 20
nvm alias default 20
```

---

### 1.3 Install Git

#### What is Git?

Git is a "version control system." It keeps track of all changes to your code, lets you undo mistakes, and lets multiple people work on the same project. You need Git to download (clone) the OrthoSync code from GitHub.

#### Step 1: Install Git

macOS may already have Git installed. Check first:

```bash
git --version
```

If you see a version number (e.g., `git version 2.39.3 (Apple Git-146)`), you can skip to Step 2.

If you see `command not found`, install Git:

```bash
brew install git
```

**Expected output:**

```
==> Downloading https://ghcr.io/v2/homebrew/core/git/manifests/2.x.x
...
==> Installing git
==> Pouring git--2.x.x.arm64_sonoma.bottle.tar.gz
...
==> Summary
🍺  /opt/homebrew/Cellar/git/2.x.x: 1,652 files, 51.1MB
```

#### Step 2: Verify Git

```bash
git --version
```

**Expected output:**

```
git version 2.43.0
```

(Any version 2.x is fine.)

#### Step 3: Configure Git (first time only)

Tell Git who you are. This information is attached to every change you make:

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

Replace `Your Full Name` with your actual name, and `your.email@example.com` with your actual email. Use the same email you use for your GitHub account.

Verify your settings:

```bash
git config --global user.name
git config --global user.email
```

**Expected output:**

```
Your Full Name
your.email@example.com
```

#### Troubleshooting

**Problem: `command not found: git` even after installing**

Close Terminal and reopen it, then try again. If that does not work:

```bash
brew link git
```

**Problem: "xcrun: error: invalid active developer path"**

This means you need Xcode Command Line Tools:

```bash
xcode-select --install
```

A dialog box will appear. Click "Install" and wait for it to complete, then try `git --version` again.

---

### 1.4 Install Watchman (for React Native)

#### What is Watchman?

Watchman is a tool made by Facebook (Meta) that watches your files for changes. When you edit a file, Watchman tells the React Native development server to reload the app instantly. Without it, the development server may be slow or miss changes.

#### Step 1: Install Watchman

```bash
brew install watchman
```

**Expected output:**

```
==> Downloading https://ghcr.io/v2/homebrew/core/watchman/manifests/...
...
==> Installing watchman
==> Pouring watchman--2024.x.x.arm64_sonoma.bottle.tar.gz
...
==> Summary
🍺  /opt/homebrew/Cellar/watchman/2024.x.x: 24 files, 10.2MB
```

#### Step 2: Verify Watchman

```bash
watchman --version
```

**Expected output:**

```
2024.07.15.00
```

(The exact version does not matter.)

#### Troubleshooting

**Problem: `command not found: watchman`**

```bash
brew link watchman
```

If that does not work, try reinstalling:

```bash
brew reinstall watchman
```

**Problem: Watchman consuming too much memory later during development**

```bash
watchman watch-del-all
```

This clears all watches and can fix issues with Watchman using too much RAM.

---

### 1.5 Install VS Code (Recommended Editor)

#### What is VS Code?

Visual Studio Code (VS Code) is a free code editor made by Microsoft. It is the most popular editor for React Native development. You will use it to view and edit the OrthoSync source code.

#### Step 1: Install VS Code

**Option A: Using Homebrew (recommended)**

```bash
brew install --cask visual-studio-code
```

**Expected output:**

```
==> Downloading https://update.code.visualstudio.com/...
...
==> Installing Cask visual-studio-code
==> Moving App 'Visual Studio Code.app' to '/Applications/Visual Studio Code.app'
...
🍺  visual-studio-code was successfully installed!
```

**Option B: Download from website**

1. Go to https://code.visualstudio.com
2. Click the big blue "Download for Mac" button
3. Open the downloaded `.zip` file
4. Drag "Visual Studio Code" to your Applications folder

#### Step 2: Open VS Code

- Press `Command + Space`, type `Visual Studio Code`, press `Enter`
- Or find it in your Applications folder

#### Step 3: Enable the `code` command in Terminal

This lets you open files and folders from Terminal by typing `code .`:

1. Open VS Code
2. Press `Command + Shift + P` (opens the Command Palette)
3. Type `shell command`
4. Click "Shell Command: Install 'code' command in PATH"
5. You should see a notification saying "Shell command 'code' successfully installed in PATH"

Verify:

```bash
code --version
```

**Expected output:**

```
1.87.2
...
```

#### Step 4: Install Recommended Extensions

Open VS Code, then press `Command + Shift + X` to open the Extensions panel. Search for and install each of these:

1. **ES7+ React/Redux/React-Native snippets** (by dsznajder)
   - Gives you shortcuts for React code. Type `rnf` and press Tab to create a component.

2. **Prettier - Code formatter** (by Prettier)
   - Automatically formats your code to look clean and consistent.

3. **TypeScript Importer** (by pmneo)
   - Automatically adds import statements when you use a function or component.

4. **React Native Tools** (by Microsoft)
   - Adds debugging support for React Native apps.

5. **Error Lens** (by Alexander)
   - Shows errors inline in your code, right next to the problem line.

6. **Material Icon Theme** (by Philipp Kief)
   - Makes file icons in the sidebar colorful and easier to identify.

To install each extension: Type its name in the search box, click on it, and click the blue "Install" button.

---

### 1.6 Install Xcode (for iOS)

#### What is Xcode?

Xcode is Apple's official development tool for building iOS apps. Even though OrthoSync uses React Native (not native Swift/Objective-C), you still need Xcode because it includes the iOS Simulator and the build tools that compile your app for iPhones and iPads.

> **WARNING:** Xcode is very large (approximately 12-15 GB). The download and installation will take 30-60 minutes depending on your internet speed. Plan accordingly.

> **Note:** You can skip this section if you only want to develop for Android and Web. But you will need Xcode eventually for iOS testing and deployment.

#### Step 1: Install Xcode from the Mac App Store

1. Open the **App Store** on your Mac (click the blue App Store icon in your Dock, or press `Command + Space` and type "App Store")
2. In the search bar at the top, type `Xcode`
3. Find **Xcode** by Apple (it has a blue hammer icon)
4. Click **Get** (or the download icon)
5. You may need to sign in with your Apple ID
6. Wait for the download to complete (this takes 20-45 minutes)
7. Wait for the installation to complete (another 5-10 minutes)

**What you will see:** A progress bar in the App Store. The download is roughly 12 GB.

#### Step 2: Open Xcode and Accept the License

1. Open Xcode (from Applications folder or Spotlight)
2. You will see a dialog: "Xcode and iOS SDK License Agreement"
3. Click **Agree**
4. Xcode may ask for your Mac password to install additional components -- enter it
5. Wait for "Installing components..." to finish (2-5 minutes)
6. Xcode will open to its Welcome screen

#### Step 3: Install Xcode Command Line Tools

Open Terminal and run:

```bash
xcode-select --install
```

**What you will see:**

If the tools are not installed, a dialog appears:
```
xcode-select: note: install requested for command line developer tools
```

A popup window will appear asking "Install Command Line Developer Tools?" Click **Install**, then **Agree** to the license.

If the tools are already installed (because you installed Xcode), you will see:
```
xcode-select: error: command line tools are already installed, use "Software Update" in System Settings to install updates
```

This "error" is actually fine -- it means they are already installed.

#### Step 4: Install iOS Simulator

1. Open Xcode
2. Go to menu: **Xcode > Settings** (or press `Command + ,`)
3. Click the **Platforms** tab at the top
4. Click the **+** button at the bottom left
5. Select **iOS...**
6. Choose the latest iOS version (e.g., iOS 18.x)
7. Click **Download & Install**
8. Wait for the download (approximately 5 GB, takes 10-20 minutes)

**What you will see:** A progress bar showing the simulator download.

#### Step 5: Verify Xcode installation

```bash
xcodebuild -version
```

**Expected output:**

```
Xcode 16.2
Build version 16C5032a
```

(Any version 15.x or 16.x is fine.)

Also verify the simulator is available:

```bash
xcrun simctl list devices available
```

**Expected output (partial):**

```
== Devices ==
-- iOS 18.2 --
    iPhone 16 (XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX) (Shutdown)
    iPhone 16 Plus (XXXXXXXX-...) (Shutdown)
    iPhone 16 Pro (XXXXXXXX-...) (Shutdown)
    iPhone 16 Pro Max (XXXXXXXX-...) (Shutdown)
    iPad Pro 13-inch (XXXXXXXX-...) (Shutdown)
...
```

You should see at least one iPhone device listed. If you see devices, the simulator is ready.

#### Troubleshooting

**Problem: "xcode-select: error: tool 'xcodebuild' requires Xcode"**

Xcode is installed but not selected. Run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

Enter your password when prompted.

**Problem: No devices listed in `simctl list`**

You need to download a simulator runtime. Open Xcode > Settings > Platforms and download an iOS simulator as described in Step 4.

**Problem: "Xcode is too old" or Expo requires a newer version**

Update Xcode through the Mac App Store. Open App Store > Updates > Update Xcode.

**Problem: Not enough disk space for Xcode**

Xcode needs about 15 GB free. Check your disk space: Apple Menu > About This Mac > Storage. Delete large files or old applications to free up space.

---

### 1.7 Install Android Studio (for Android)

#### What is Android Studio?

Android Studio is Google's official development tool for building Android apps. Like Xcode for iOS, you need Android Studio for its Android Emulator and SDK (Software Development Kit), even though OrthoSync is built with React Native.

> **Note:** You can skip this section if you only want to develop for iOS and Web.

#### Step 1: Install Android Studio

**Option A: Using Homebrew (recommended)**

```bash
brew install --cask android-studio
```

**Expected output:**

```
==> Downloading https://dl.google.com/android/studio/...
...
==> Installing Cask android-studio
==> Moving App 'Android Studio.app' to '/Applications/Android Studio.app'
...
🍺  android-studio was successfully installed!
```

**Option B: Download from website**

1. Go to https://developer.android.com/studio
2. Click "Download Android Studio"
3. Accept the terms
4. Open the downloaded `.dmg` file
5. Drag "Android Studio" to Applications

#### Step 2: First Launch Setup Wizard

1. Open Android Studio (from Applications or Spotlight)
2. If asked "Import settings from a previous installation," select **Do not import settings** and click **OK**
3. The **Android Studio Setup Wizard** will appear
4. Click **Next**
5. Select **Standard** installation type and click **Next**
6. Select your preferred UI theme (Light or Dark) and click **Next**
7. Review the components to be downloaded. You should see:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
8. Click **Next**
9. Review and accept the license agreements (click "Accept" for each one)
10. Click **Finish**
11. Wait for downloads to complete (this takes 5-15 minutes)

**What you will see:** Progress bars for downloading the Android SDK, build tools, and emulator images.

#### Step 3: Install Required SDK Components

1. On the Android Studio Welcome screen, click **More Actions** (or the three-dot menu) > **SDK Manager**
   - If you already have a project open: **Android Studio > Settings > Languages & Frameworks > Android SDK**

2. **SDK Platforms tab:**
   - Check the box next to **Android 14.0 ("UpsideDownCake") - API Level 34**
   - This is the target API level for Expo SDK 55

3. **SDK Tools tab** (click the tab at the top):
   - Make sure these are checked:
     - **Android SDK Build-Tools** (latest version)
     - **Android Emulator**
     - **Android SDK Platform-Tools**
     - **Android SDK Command-line Tools (latest)**

4. Click **Apply**, then **OK** to download and install

**What you will see:** A download dialog showing the SDK components being installed.

#### Step 4: Set Environment Variables

Android development tools need to know where the Android SDK is installed. You need to add this to your shell configuration.

Open Terminal and run this command to edit your shell config:

```bash
open -e ~/.zshrc
```

If the file does not exist, create it:

```bash
touch ~/.zshrc
open -e ~/.zshrc
```

A TextEdit window will open. Add these lines at the very bottom of the file:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Save the file (`Command + S`) and close TextEdit.

Now reload the configuration:

```bash
source ~/.zshrc
```

#### Step 5: Verify Android SDK

```bash
adb --version
```

**Expected output:**

```
Android Debug Bridge version 1.0.41
Version 35.0.2-12147458
```

Also verify the SDK location:

```bash
echo $ANDROID_HOME
```

**Expected output:**

```
/Users/yourusername/Library/Android/sdk
```

#### Step 6: Create an Android Virtual Device (AVD)

An AVD is a simulated Android phone that runs on your Mac.

1. Open Android Studio
2. On the Welcome screen, click **More Actions** > **Virtual Device Manager**
   - Or if you have a project open: **Tools > Device Manager**
3. Click **Create Virtual Device**
4. In the "Select Hardware" screen:
   - Category: **Phone**
   - Select **Pixel 7** (or any recent Pixel device)
   - Click **Next**
5. In the "System Image" screen:
   - Select the **API 34** image (you may need to click "Download" next to it first)
   - Wait for the download (approximately 1-2 GB)
   - Select the downloaded image and click **Next**
6. In the "Verify Configuration" screen:
   - AVD Name: `Pixel_7_API_34` (or leave the default)
   - Click **Finish**

#### Step 7: Test the Emulator

1. In the Virtual Device Manager, find your new device
2. Click the **Play** button (triangle icon) next to it
3. Wait 30-60 seconds for the emulator to start

**What you will see:** A virtual Android phone appears on your screen. It will show the Android lock screen or home screen. This means the emulator is working.

Close the emulator for now (you will use it later).

#### Troubleshooting

**Problem: `command not found: adb`**

Your environment variables are not set. Make sure you added the lines to `~/.zshrc` and ran `source ~/.zshrc`. Close and reopen Terminal if needed.

**Problem: Emulator is extremely slow**

On Apple Silicon Macs (M1, M2, M3, M4), the emulator should run fast because it uses ARM natively. If it is slow:
- Make sure you downloaded an **arm64** system image (not x86_64)
- Close other memory-heavy applications
- In the AVD settings, increase RAM to 4096 MB

**Problem: "HAXM is not installed" (Intel Macs only)**

HAXM (Hardware Accelerated Execution Manager) speeds up the emulator on Intel Macs:

```bash
brew install intel-haxm
```

You may need to allow it in System Preferences > Security & Privacy.

Note: Apple Silicon Macs (M1/M2/M3/M4) do NOT need HAXM.

**Problem: "The emulator process has terminated"**

1. Open Android Studio > Virtual Device Manager
2. Click the dropdown arrow next to your device > **Wipe Data**
3. Try starting the emulator again
4. If that fails, delete the AVD and create a new one

**Problem: Emulator starts but shows a black screen**

Wait 1-2 minutes. Sometimes the first boot is slow. If it stays black:
1. Close the emulator
2. In Virtual Device Manager, edit the device
3. Under "Emulated Performance," change Graphics to **Software**
4. Try again

---

### 1.8 Install Expo CLI

#### What is Expo?

Expo is a framework built on top of React Native that makes it much easier to build mobile apps. OrthoSync uses Expo SDK 55. Instead of installing Expo CLI globally, you use `npx` which runs it directly.

#### Step 1: Verify npx is available

`npx` comes with npm (which you installed with Node.js):

```bash
npx --version
```

**Expected output:**

```
10.8.2
```

(Any version is fine -- it just needs to exist.)

#### Step 2: Verify Expo works

```bash
npx expo --version
```

**Expected output (first time may take a moment to download):**

```
0.22.x
```

(The exact version depends on your project. This just confirms Expo is accessible.)

#### Step 3: Install Expo Go on Your Physical Device (Optional but Recommended)

Expo Go is an app for your phone that lets you run your development app instantly, without building a full APK/IPA.

**For iPhone:**
1. Open the App Store on your iPhone
2. Search for "Expo Go"
3. Download and install it

**For Android:**
1. Open the Google Play Store on your Android phone
2. Search for "Expo Go"
3. Download and install it

> **Note:** Expo SDK 55 requires Expo Go version 55+. Make sure you have the latest version.

#### Step 4: Create an Expo Account (Optional)

Creating an Expo account lets you access additional features like EAS Build:

1. Go to https://expo.dev/signup
2. Create a free account
3. In Terminal, log in:

```bash
npx expo login
```

You will be prompted for your username and password.

**Expected output after login:**

```
Logged in as yourusername
```

#### Troubleshooting

**Problem: "npx: command not found"**

This means npm was not installed correctly. Reinstall Node.js:

```bash
brew reinstall node@20
```

**Problem: Expo Go app crashes on phone**

Make sure you have the latest version of Expo Go from the App Store / Play Store. Older versions are not compatible with Expo SDK 55.

---

## Section 2: Project Setup

Now that all the required software is installed, it is time to download and run OrthoSync.

---

### 2.1 Clone the Repository

#### What does "clone" mean?

Cloning creates a copy of the entire OrthoSync project from GitHub onto your Mac. This includes all the source code, configuration files, and assets.

#### Step 1: Choose where to put the project

Open Terminal. Navigate to where you want the project folder. A common choice is your home directory or a "Projects" folder:

```bash
mkdir -p ~/Projects
cd ~/Projects
```

#### Step 2: Clone the repository

```bash
git clone https://github.com/zxrrcpandey/OrthoSync.git
```

**Expected output:**

```
Cloning into 'OrthoSync'...
remote: Enumerating objects: 150, done.
remote: Counting objects: 100% (150/150), done.
remote: Compressing objects: 100% (98/98), done.
remote: Total 150 (delta 45), reused 143 (delta 40), pack-reused 0
Receiving objects: 100% (150/150), 1.25 MiB | 2.50 MiB/s, done.
Resolving deltas: 100% (45/45), done.
```

#### Step 3: Navigate into the project folder

```bash
cd OrthoSync
```

#### Step 4: Verify the project files

```bash
ls -la
```

**Expected output:**

```
total XX
drwxr-xr-x  14 yourusername  staff   448 Mar 15 10:00 .
drwxr-xr-x   5 yourusername  staff   160 Mar 15 10:00 ..
drwxr-xr-x  12 yourusername  staff   384 Mar 15 10:00 .git
-rw-r--r--   1 yourusername  staff   450 Mar 15 10:00 .gitignore
-rw-r--r--   1 yourusername  staff  2500 Mar 15 10:00 App.tsx
-rw-r--r--   1 yourusername  staff   885 Mar 15 10:00 app.json
drwxr-xr-x   8 yourusername  staff   256 Mar 15 10:00 assets
-rw-r--r--   1 yourusername  staff    52 Mar 15 10:00 index.ts
-rw-r--r--   1 yourusername  staff   XXX Mar 15 10:00 package-lock.json
-rw-r--r--   1 yourusername  staff   XXX Mar 15 10:00 package.json
drwxr-xr-x  14 yourusername  staff   448 Mar 15 10:00 src
-rw-r--r--   1 yourusername  staff    93 Mar 15 10:00 tsconfig.json
```

You should see `App.tsx`, `package.json`, `app.json`, `src/` folder, and `assets/` folder. If you see these, the clone was successful.

#### Step 5: Open the project in VS Code

```bash
code .
```

**What you will see:** VS Code opens with the OrthoSync project. In the left sidebar (Explorer), you can see all the folders and files.

The project structure looks like this:

```
OrthoSync/
  App.tsx                    -- Main app entry point
  app.json                   -- Expo configuration
  index.ts                   -- JavaScript entry point
  package.json               -- Dependencies and scripts
  tsconfig.json              -- TypeScript configuration
  assets/                    -- Icons, splash screens
  src/
    components/ui/           -- Reusable UI components (GlassCard, GlassButton, etc.)
    config/firebase.ts       -- Firebase configuration (YOU WILL EDIT THIS)
    hooks/                   -- Custom React hooks
    i18n/                    -- Hindi/English translations
    navigation/              -- Screen navigation (tabs, stacks)
    screens/                 -- All app screens
      auth/                  -- Login, Register, Forgot Password, OTP
      billing/               -- Bills, Commission, Fees
      calendar/              -- Appointments, Calendar
      doctor/                -- Doctor profile, setup
      location/              -- Clinic locations
      main/                  -- Dashboard, Patients, Calendar, Billing, More tabs
      notification/          -- Notification center, Send notification
      patient/               -- Add/View patient details
      reports/               -- Reports dashboard
      treatment/             -- Treatments, Visits
      web/                   -- Web-specific admin dashboard
    services/                -- Notification service, Sync service
    store/                   -- Zustand state management
    theme/                   -- Colors, spacing
    types/                   -- TypeScript type definitions
```

#### Troubleshooting

**Problem: "fatal: repository not found"**

Make sure you have the exact URL: `https://github.com/zxrrcpandey/OrthoSync.git`

If the repository is private, you need access. Ask the repository owner to add you as a collaborator on GitHub.

**Problem: "fatal: could not create work tree dir"**

You do not have write permission to the current directory. Try a different location:

```bash
cd ~
git clone https://github.com/zxrrcpandey/OrthoSync.git
```

**Problem: Clone is very slow**

This could be a network issue. Try:

```bash
git clone --depth 1 https://github.com/zxrrcpandey/OrthoSync.git
```

This downloads only the latest version (not the full history), which is much faster.

---

### 2.2 Install Dependencies

#### What are dependencies?

Dependencies are other software packages that OrthoSync uses. For example, `react-native`, `expo`, `zustand`, and `react-navigation` are all dependencies. The `package.json` file lists all of them, and `npm install` downloads them all.

#### Step 1: Make sure you are in the project directory

```bash
cd ~/Projects/OrthoSync
```

(Adjust the path if you cloned it elsewhere.)

#### Step 2: Install all dependencies

```bash
npm install
```

**Expected output (takes 1-3 minutes):**

```
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'some-package@x.x.x',
npm warn EBADENGINE   required: { node: '>=16' },
npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
npm warn EBADENGINE }

added 892 packages, and audited 893 packages in 45s

150 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

> **IMPORTANT: Warnings are OK.** You will likely see yellow "WARN" messages about engines, deprecated packages, or funding. These are informational and do NOT mean something is broken. Only red "ERROR" messages are problems.

**What happened:** npm downloaded approximately 892 packages into a `node_modules` folder. This folder is about 200-400 MB. It is automatically excluded from Git (listed in `.gitignore`).

#### Step 3: Verify node_modules exists

```bash
ls node_modules | head -20
```

**Expected output (a list of package folders):**

```
@babel
@expo
@react-native-async-storage
@react-native-community
@react-navigation
@types
expo
expo-blur
expo-camera
expo-image-picker
...
```

If you see folders listed, the installation was successful.

#### Troubleshooting

**Problem: `npm ERR! code ERESOLVE` (dependency conflict)**

Try installing with the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

**Problem: `npm ERR! code EACCES` (permission error)**

Do NOT use `sudo npm install`. Instead, fix npm permissions:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install
```

**Problem: Installation is stuck (no progress for 5+ minutes)**

Press `Control + C` to cancel, then:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

This deletes the partial installation and starts fresh.

**Problem: "No space left on device"**

The `node_modules` folder needs about 400 MB. Free up disk space and try again.

**Problem: Network errors ("ETIMEDOUT", "ENOTFOUND")**

Check your internet connection. If you are behind a corporate proxy:

```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

---

### 2.3 Verify TypeScript

#### What is TypeScript?

TypeScript adds type checking to JavaScript. It catches errors before you run the code. OrthoSync is written entirely in TypeScript (`.ts` and `.tsx` files).

#### Step 1: Run the TypeScript compiler in check mode

```bash
npx tsc --noEmit
```

**Expected output if everything is OK:**

```
(no output -- just returns to the command prompt)
```

No output means zero errors. This is what you want.

**If you see errors** like:

```
src/screens/auth/LoginScreen.tsx(15,5): error TS2322: Type 'string' is not assignable to type 'number'.
```

This means there is a type error in the code. For an initial clone, there should be no errors. If you see errors:

1. Make sure you ran `npm install` first (dependencies include type definitions)
2. Try deleting and reinstalling:

```bash
rm -rf node_modules
npm install
npx tsc --noEmit
```

3. If errors persist, they may be known issues. You can still run the app -- TypeScript errors do not prevent the app from running in development mode.

---

### 2.4 Start the App

This is the moment of truth. You are going to start the OrthoSync development server and see the app running.

#### Step 1: Start the Expo development server

```bash
npx expo start
```

**Expected output:**

```
Starting project at /Users/yourusername/Projects/OrthoSync
Starting Metro Bundler

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀▄▀█ ██▀█ ▄▄▄▄▄ █
█ █   █ █▄▀ █▄▄▀▄█ █   █ █
█ █▄▄▄█ █▀▄▀▀ █▄▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄▀▄█▄█▄▀█▄▄▄▄▄▄▄█
...
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Using Expo Go
› Press s │ switch to development build

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor

› Press ? │ show all commands
```

**What you see:** A large QR code in your terminal, and a menu of options below it. This means the development server is running.

> **IMPORTANT:** Keep this Terminal window open. If you close it, the development server stops and the app will disconnect.

#### Step 2: Choose how to run the app

You have several options. Each is explained in detail in the next section (2.5). For a quick test:

- **Press `w`** to open in your web browser (easiest, works immediately)
- **Press `i`** to open in the iOS Simulator (requires Xcode)
- **Press `a`** to open on the Android Emulator (requires Android Studio emulator to be running)
- **Scan the QR code** with your phone to open in Expo Go

#### What you should see when the app loads:

The first screen is the **Login Screen**. It features:
- A gradient background (blue/teal)
- Glassmorphism effect (frosted glass cards)
- "OrthoSync" title with a tooth icon
- Email and Password input fields
- "Sign In" button
- Links for "Forgot Password?" and "Create Account"
- Language toggle (English/Hindi)

If you see this login screen, congratulations -- the app is running.

#### Troubleshooting

**Problem: "Unable to resolve module" errors**

```bash
npx expo start --clear
```

The `--clear` flag clears the Metro bundler cache.

**Problem: Port 8081 is already in use**

Another process is using port 8081. Either:

1. Kill the other process:
```bash
lsof -ti:8081 | xargs kill -9
```

2. Or use a different port:
```bash
npx expo start --port 8082
```

**Problem: Terminal shows the QR code but the app does not load**

Check that your computer and phone are on the same WiFi network. If you are on a corporate network, it may block the connection. Try using a personal hotspot.

---

### 2.5 Running on Each Platform

#### iOS Simulator

**Prerequisites:**
- Xcode installed (Section 1.6)
- iOS Simulator downloaded in Xcode

**Step 1:** Start the Expo server if not already running:

```bash
npx expo start
```

**Step 2:** Press `i` in the terminal, or run directly:

```bash
npx expo start --ios
```

**What happens:**
1. The iOS Simulator app launches (a simulated iPhone appears on your screen)
2. The simulator installs and opens Expo Go
3. Your OrthoSync app loads inside Expo Go
4. You see the Login screen

**Expected time:** First launch takes 1-2 minutes. Subsequent launches are faster (10-20 seconds).

**Troubleshooting:**

**Problem: "No simulator runtime is available"**

You need to download a simulator. Open Xcode > Settings > Platforms > download the latest iOS simulator.

**Problem: "Unable to boot simulator"**

```bash
xcrun simctl shutdown all
```

Then try again.

**Problem: Simulator opens but the app does not load**

Wait 30-60 seconds. Check the Terminal for error messages. Try pressing `r` in Terminal to reload.

---

#### Android Emulator

**Prerequisites:**
- Android Studio installed (Section 1.7)
- An AVD created (Section 1.7, Step 6)
- Environment variables set (Section 1.7, Step 4)

**Step 1:** Start the Android emulator FIRST (before running Expo):

Open Android Studio > Virtual Device Manager > Click the Play button on your AVD.

Or start it from Terminal:

```bash
emulator -avd Pixel_7_API_34
```

(Replace `Pixel_7_API_34` with your AVD name. Find available names with `emulator -list-avds`.)

Wait for the emulator to fully boot (you see the Android home screen).

**Step 2:** Start the Expo server and press `a`:

```bash
npx expo start
```

Then press `a`, or run directly:

```bash
npx expo start --android
```

**What happens:**
1. Expo detects the running emulator
2. It installs Expo Go on the emulator
3. The OrthoSync app opens
4. You see the Login screen

**Expected time:** First launch takes 1-3 minutes (installing Expo Go). Subsequent launches are faster.

**Troubleshooting:**

**Problem: "No Android connected device found"**

Make sure the emulator is running and fully booted. Verify with:

```bash
adb devices
```

**Expected output:**

```
List of devices attached
emulator-5554	device
```

If you see "emulator-5554 device", the emulator is connected. If the list is empty, the emulator is not running or not detected.

**Problem: "INSTALL_FAILED_OLDER_SDK"**

Your emulator's API level is too old. Create a new AVD with API 34.

**Problem: App installs but shows a white screen**

Press `r` in the Terminal to reload. Check the Terminal for error messages.

---

#### Web Browser

**Step 1:** Start the Expo server and press `w`:

```bash
npx expo start
```

Then press `w`, or run directly:

```bash
npx expo start --web
```

**What happens:**
1. Your default web browser opens
2. The app loads at `http://localhost:8081`
3. On web, you see the **Web Dashboard** with:
   - A sidebar navigation (Dashboard, Patients, Calendar, Billing, Reports, Settings)
   - The main content area showing the dashboard

> **Note:** The web version of OrthoSync shows a different layout than the mobile version. On mobile, you get bottom tabs. On web, you get a sidebar navigation. This is intentional -- the app detects the platform and adjusts the UI.

**Troubleshooting:**

**Problem: Browser shows "Cannot GET /"**

The Metro bundler might not be ready yet. Wait 10-20 seconds and refresh the page.

**Problem: Styles look broken on web**

Some React Native components render differently on web. This is expected for certain native-only features like `expo-blur` (glassmorphism). The app includes web-specific components to handle these differences.

---

#### Physical Device (iPhone or Android Phone)

This is the best way to test because you see exactly what your users will see.

**Prerequisites:**
- Expo Go app installed on your phone (Section 1.8, Step 3)
- Your phone and your Mac are connected to the SAME WiFi network

**Step 1:** Start the Expo server:

```bash
npx expo start
```

**Step 2:** Scan the QR code

**On iPhone:**
1. Open the Camera app (not Expo Go)
2. Point it at the QR code in your Terminal
3. A banner notification appears at the top: "Open in Expo Go"
4. Tap it

**On Android:**
1. Open the Expo Go app
2. Tap "Scan QR Code"
3. Point the camera at the QR code in your Terminal

**What happens:**
1. Expo Go connects to your development server
2. The JavaScript bundle downloads (takes 5-30 seconds on first load)
3. The OrthoSync app appears on your phone
4. You see the Login screen with the full glassmorphism effect

**Troubleshooting:**

**Problem: QR code scan does not work**

Manually enter the URL shown in Terminal (e.g., `exp://192.168.1.100:8081`):
- In Expo Go, tap "Enter URL manually" and type the address

**Problem: "Network request failed" or "Unable to connect"**

Your phone and computer are not on the same network, or the network blocks the connection:
1. Check both are on the same WiFi
2. Try disabling your Mac's firewall temporarily: System Settings > Network > Firewall > turn off
3. Try using a personal hotspot from your phone, and connect your Mac to it

**Problem: App loads but is stuck on a white/loading screen**

Shake your phone to open the Expo developer menu, and tap "Reload."

---

## Section 3: Firebase Setup (Backend)

Firebase is the backend for OrthoSync. It provides:
- **Authentication:** User login (email/password and phone OTP)
- **Firestore:** Database for storing patients, appointments, bills, etc.
- **Storage:** For storing patient photos (X-rays, intraoral images)
- **Cloud Messaging (FCM):** For push notifications

> **Note:** OrthoSync currently uses Zustand with AsyncStorage for local state management. Firebase integration provides cloud sync, multi-device access, and backup. The app works in offline mode using local storage and syncs when connected.

---

### 3.1 Create Firebase Project

#### Step 1: Go to Firebase Console

1. Open your web browser
2. Go to https://console.firebase.google.com
3. Sign in with your Google account (create one if you do not have one)

**What you see:** The Firebase Console homepage with a "Create a project" button (or "Add project" if you have existing projects).

#### Step 2: Create a new project

1. Click **Create a project** (or **Add project**)
2. **Project name:** Type `OrthoSync`
   - Firebase will show a project ID below it like `orthosync-12345`
   - This ID is unique and cannot be changed later
3. Click **Continue**
4. **Google Analytics:** You can toggle this OFF for simplicity (it is optional)
   - If you leave it ON, select "Default Account for Firebase" and click **Create project**
   - If you turn it OFF, just click **Create project**
5. Wait 15-30 seconds while Firebase creates your project
6. Click **Continue** when you see "Your new project is ready"

**What you see:** The Firebase project dashboard with a sidebar on the left showing Build, Run, Analytics, etc.

---

### 3.2 Enable Authentication

Authentication lets users sign in to OrthoSync.

#### Step 1: Navigate to Authentication

1. In the Firebase Console, click **Build** in the left sidebar
2. Click **Authentication**
3. Click **Get Started**

**What you see:** The Authentication page with tabs: Users, Sign-in method, Templates, Usage, Settings.

#### Step 2: Enable Email/Password sign-in

1. Click the **Sign-in method** tab
2. Click **Email/Password** (in the list of providers)
3. Toggle the first switch to **Enable**
4. Leave "Email link (passwordless sign-in)" disabled for now
5. Click **Save**

**What you see:** Email/Password now shows "Enabled" with a green checkmark.

#### Step 3: Enable Phone sign-in

1. Still on the Sign-in method tab
2. Click **Phone**
3. Toggle the switch to **Enable**
4. Click **Save**

**What you see:** Phone now shows "Enabled" with a green checkmark.

> **Note:** Phone authentication is used for OTP verification in OrthoSync. For testing, Firebase lets you add test phone numbers. Go to Sign-in method > Phone > "Phone numbers for testing" and add numbers like `+919999999999` with verification code `123456`.

---

### 3.3 Create Firestore Database

Firestore is a NoSQL database that stores all of OrthoSync's data: patients, appointments, treatments, bills, etc.

#### Step 1: Navigate to Firestore

1. In the Firebase Console, click **Build** in the left sidebar
2. Click **Firestore Database**
3. Click **Create database**

#### Step 2: Choose security rules

1. Select **Start in test mode**
   - This allows read/write access to anyone for 30 days
   - This is fine for development -- you will set proper rules before going to production
2. Click **Next**

#### Step 3: Choose a location

1. Select a Cloud Firestore location closest to your users:
   - For India: select **asia-south1 (Mumbai)**
   - For US: select **us-central1 (Iowa)** or **us-east1 (South Carolina)**
   - For Europe: select **europe-west1 (Belgium)**
2. Click **Enable**

> **IMPORTANT:** The location cannot be changed after creation. Choose wisely.

**What you see:** An empty Firestore database with a "Start collection" button. The database is ready.

#### Expected Firestore Collections (created by the app):

OrthoSync will create these collections as you use the app:

| Collection       | Description                          |
|-----------------|--------------------------------------|
| `doctors`       | Doctor profiles and settings         |
| `patients`      | Patient records                      |
| `appointments`  | Scheduled appointments               |
| `treatments`    | Patient treatments and visits        |
| `bills`         | Billing records                      |
| `commissions`   | Commission records per location      |
| `locations`     | Clinic/hospital locations            |
| `notifications` | Notification history                 |

---

### 3.4 Enable Storage

Firebase Storage stores files like patient photos (X-rays, intraoral photos, extraoral photos, OPGs, cephalograms).

#### Step 1: Navigate to Storage

1. In the Firebase Console, click **Build** in the left sidebar
2. Click **Storage**
3. Click **Get Started**

#### Step 2: Choose security rules

1. Select **Start in test mode** (allows all reads/writes for 30 days)
2. Click **Next**

#### Step 3: Choose location

1. The location should match your Firestore location (e.g., `asia-south1` for India)
2. Click **Done**

**What you see:** An empty storage bucket. The URL shown is your storage bucket address (e.g., `gs://orthosync-12345.appspot.com`).

---

### 3.5 Enable Cloud Messaging (FCM)

Firebase Cloud Messaging (FCM) sends push notifications to users' phones.

#### Step 1: Navigate to Cloud Messaging

1. In the Firebase Console, click **Build** in the left sidebar (or **Engage** in newer console versions)
2. Click **Cloud Messaging**

**What you see:** Cloud Messaging is typically enabled by default when you create a Firebase project. You should see the Cloud Messaging dashboard.

If you see "Enable Cloud Messaging API," click it.

No additional configuration is needed here for now. You will configure platform-specific settings (APNs for iOS) later.

---

### 3.6 Add Web App to Firebase

You need to register OrthoSync as a "Web App" in Firebase to get the configuration keys.

#### Step 1: Navigate to Project Settings

1. In the Firebase Console, click the **gear icon** (next to "Project Overview" at the top left)
2. Click **Project settings**

#### Step 2: Add a Web App

1. Scroll down to "Your apps" section
2. Click the **Web** icon (`</>` -- it looks like HTML angle brackets)
3. **App nickname:** Type `OrthoSync Web`
4. **Do NOT** check "Also set up Firebase Hosting for this app"
5. Click **Register app**

#### Step 3: Copy the configuration

After registering, Firebase shows you a code snippet. You need the `firebaseConfig` object. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB1234567890abcdefghijklmnop",
  authDomain: "orthosync-12345.firebaseapp.com",
  projectId: "orthosync-12345",
  storageBucket: "orthosync-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};
```

**IMPORTANT:** Copy these values somewhere safe. You will need them in the next step. You can also find them later in Project Settings > General > Your apps.

Click **Continue to console**.

---

### 3.7 Update App Config

Now you need to put your Firebase configuration into the OrthoSync code.

#### Step 1: Open the Firebase config file

Open VS Code with the project, then open:

```
src/config/firebase.ts
```

Or from Terminal:

```bash
code src/config/firebase.ts
```

#### Step 2: Current file contents (BEFORE)

The file currently looks like this:

```typescript
// ==========================================
// OrthoSync - Firebase Configuration
// ==========================================
// TODO: Replace with your actual Firebase config
// Get these values from: https://console.firebase.google.com
// Project Settings > General > Your Apps > Web App

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export default firebaseConfig;

// ==========================================
// Firebase Setup Instructions:
// ==========================================
// 1. Go to https://console.firebase.google.com
// 2. Create a new project named "OrthoSync"
// 3. Enable Authentication (Email/Password + Phone)
// 4. Create Firestore Database
// 5. Enable Storage
// 6. Enable Cloud Messaging
// 7. Add a Web App and copy the config here
// 8. For Android: Add SHA-1 fingerprint
// 9. For iOS: Download GoogleService-Info.plist
// ==========================================
```

#### Step 3: Replace with your real values (AFTER)

Replace the placeholder values with the values you copied from Firebase Console. The file should look like this (with YOUR values):

```typescript
// ==========================================
// OrthoSync - Firebase Configuration
// ==========================================

const firebaseConfig = {
  apiKey: 'AIzaSyB1234567890abcdefghijklmnop',
  authDomain: 'orthosync-12345.firebaseapp.com',
  projectId: 'orthosync-12345',
  storageBucket: 'orthosync-12345.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abc123def456ghi789',
};

export default firebaseConfig;
```

> **IMPORTANT:** Replace every value with YOUR actual values from Firebase. The values shown above are examples and will NOT work.

#### Step 4: Save the file

Press `Command + S` in VS Code.

---

### 3.8 Add Android App to Firebase

If you plan to build OrthoSync for Android, register it in Firebase.

#### Step 1: Navigate to Project Settings

1. Firebase Console > gear icon > Project Settings > General
2. Scroll to "Your apps"
3. Click **Add app** > Android icon

#### Step 2: Register the Android app

1. **Android package name:** `com.orthosync.app`
   - This must match the `android.package` in your `app.json` (which you will set in Section 6)
2. **App nickname:** `OrthoSync Android`
3. **Debug signing certificate SHA-1:** (optional for now, needed later for Phone Auth)

To get SHA-1 for development:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Expected output (relevant part):**

```
Certificate fingerprints:
	 SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

Copy the SHA1 value and paste it into Firebase.

4. Click **Register app**

#### Step 3: Download google-services.json

1. Click **Download google-services.json**
2. Save this file to the **root** of your OrthoSync project (same level as `package.json` and `App.tsx`)

Your project structure should now include:

```
OrthoSync/
  App.tsx
  app.json
  google-services.json    <-- NEW FILE
  package.json
  src/
  ...
```

3. Click **Next** through the remaining steps (you can skip them -- the Expo build process handles the rest)
4. Click **Continue to console**

#### Troubleshooting

**Problem: `keytool` command not found**

Install Java Development Kit:

```bash
brew install openjdk
```

Or find keytool in Android Studio's bundled JDK:

```bash
/Applications/Android\ Studio.app/Contents/jbr/Contents/Home/bin/keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Problem: "~/.android/debug.keystore" not found**

The debug keystore is created the first time you build an Android app. Run the app on the Android emulator first (Section 2.5), then try again. Or create it manually:

```bash
keytool -genkey -v -keystore ~/.android/debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android
```

---

### 3.9 Add iOS App to Firebase

If you plan to build OrthoSync for iOS, register it in Firebase.

#### Step 1: Navigate to Project Settings

1. Firebase Console > gear icon > Project Settings > General
2. Scroll to "Your apps"
3. Click **Add app** > iOS icon (Apple logo)

#### Step 2: Register the iOS app

1. **Apple bundle ID:** `com.orthosync.app`
   - This must match the `ios.bundleIdentifier` in your `app.json` (which you will set in Section 6)
2. **App nickname:** `OrthoSync iOS`
3. **App Store ID:** Leave blank for now
4. Click **Register app**

#### Step 3: Download GoogleService-Info.plist

1. Click **Download GoogleService-Info.plist**
2. Save this file to the **root** of your OrthoSync project (same level as `package.json`)

Your project structure should now include:

```
OrthoSync/
  App.tsx
  app.json
  google-services.json         <-- Android config
  GoogleService-Info.plist      <-- iOS config (NEW)
  package.json
  src/
  ...
```

3. Click **Next** through the remaining steps
4. Click **Continue to console**

**What you see in Firebase Console:** Under "Your apps," you should now see three apps listed:
- OrthoSync Web (web icon)
- OrthoSync Android (Android icon)
- OrthoSync iOS (Apple icon)

---

### 3.10 Install Firebase SDK

#### Step 1: Install the Firebase JavaScript SDK

```bash
npm install firebase
```

**Expected output:**

```
added 5 packages, and audited 898 packages in 8s

found 0 vulnerabilities
```

#### Step 2: Understanding the Firebase integration

The Firebase SDK is imported and used in OrthoSync through the config file at `src/config/firebase.ts`. The app initializes Firebase when it starts.

To use Firebase services in your code, you would typically create a file like `src/services/firebaseService.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

> **Note:** The current version of OrthoSync uses Zustand stores with AsyncStorage for local persistence. Firebase integration is used for cloud sync and authentication. The stores in `src/store/` manage local state, and the sync service in `src/services/syncService.ts` handles syncing with Firebase.

---

## Section 4: Push Notifications Setup

OrthoSync uses push notifications to remind doctors about upcoming appointments. Notifications can be sent via:
- **Local notifications:** Scheduled on the device (e.g., "Appointment in 1 hour")
- **Push notifications:** Sent from the server via FCM (Firebase Cloud Messaging)
- **WhatsApp messages:** Deep-linked to open WhatsApp with a pre-filled message (covered in Section 5)

---

### 4.1 Expo Push Notifications

OrthoSync already has `expo-notifications` configured. The notification service is in `src/services/notificationService.ts`.

#### How it works:

1. **Permission request:** When the app starts, it requests notification permission from the user
2. **Local scheduling:** Appointment reminders are scheduled locally:
   - 1 day before the appointment
   - 1 hour before the appointment
3. **Push tokens:** The app gets an Expo Push Token that can be used to send remote notifications

#### Verifying the dependency is installed

`expo-notifications` is already in `package.json`. Verify:

```bash
npx expo install expo-notifications
```

**Expected output:**

```
expo-notifications is already installed
```

Or it will install/update to the correct version.

#### Configuration in app.json

For notifications to work on real devices, add notification configuration to your `app.json`. Open `app.json` and add the following inside the `"expo"` object:

```json
{
  "expo": {
    "name": "OrthoSync",
    "slug": "OrthoSync",
    ...existing config...
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#1A8B8B",
          "sounds": []
        }
      ]
    ]
  }
}
```

#### Testing notifications locally

You can test notifications using the Expo push notification tool:

1. Start the app on a physical device (not simulator -- simulators have limited notification support)
2. The app will log the Expo Push Token to the console
3. Go to https://expo.dev/notifications
4. Enter the push token
5. Add a title ("Test") and body ("This is a test notification")
6. Click "Send a Notification"
7. You should receive the notification on your device

#### Platform differences

**iOS:**
- Requires explicit permission from the user (a dialog appears)
- Notifications work on physical devices only (not in simulator)
- Sound and badge work out of the box

**Android:**
- Notifications are enabled by default (no permission dialog on Android 12 and below)
- Android 13+ requires notification permission (the app will request it)
- Works on both emulator and physical device

---

### 4.2 FCM for Android

For Android push notifications via Firebase Cloud Messaging:

1. Make sure you have `google-services.json` in your project root (Section 3.8)
2. The Expo build system automatically configures FCM when it detects `google-services.json`
3. No additional code changes are needed

**Testing FCM:**
- Build the app using EAS Build (Section 6.2)
- FCM only works on standalone builds, not in Expo Go
- You can send test messages from Firebase Console > Cloud Messaging > "Send your first message"

---

### 4.3 APNs for iOS

For iOS push notifications, you need an Apple Push Notification service (APNs) key. This requires an Apple Developer Account.

#### Prerequisites

- Apple Developer Account ($99/year) -- https://developer.apple.com/programs/

#### Step 1: Generate an APNs Key

1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID
3. Click **Certificates, Identifiers & Profiles**
4. In the left sidebar, click **Keys**
5. Click the **+** button to create a new key
6. **Key Name:** `OrthoSync APNs Key`
7. Check the box for **Apple Push Notifications service (APNs)**
8. Click **Continue**
9. Click **Register**
10. **IMPORTANT:** Click **Download** to download the `.p8` file
    - The file will be named something like `AuthKey_ABC123DEF4.p8`
    - **You can only download this file ONCE.** Save it somewhere safe.
11. Note the **Key ID** shown on the page (e.g., `ABC123DEF4`)

#### Step 2: Find your Team ID

1. Go to https://developer.apple.com/account
2. Click **Membership details** (or look in the top right area)
3. Your **Team ID** is a 10-character alphanumeric string (e.g., `A1B2C3D4E5`)

#### Step 3: Upload the APNs Key to Firebase

1. Go to Firebase Console > Project Settings (gear icon) > **Cloud Messaging** tab
2. Scroll down to **Apple app configuration**
3. Under "APNs Authentication Key," click **Upload**
4. Select the `.p8` file you downloaded
5. Enter your **Key ID** (from Step 1, point 11)
6. Enter your **Team ID** (from Step 2, point 3)
7. Click **Upload**

**What you see:** The APNs key appears under "Apple app configuration" with your Key ID and Team ID.

#### Step 4: Configure in EAS Build

When you build with EAS (Section 6), the APNs configuration is handled automatically. EAS will prompt you for your Apple Developer credentials and handle the push notification certificates.

---

## Section 5: WhatsApp Integration

### 5.1 How WhatsApp Notifications Work in OrthoSync

OrthoSync has a built-in feature to send appointment reminders via WhatsApp. Here is how it works:

1. **No API key or WhatsApp Business account needed** for basic functionality
2. The app uses **deep linking** -- it opens WhatsApp with a pre-filled message
3. The doctor taps "Send" in WhatsApp to complete the delivery
4. Uses the URL scheme `whatsapp://send?phone=PHONE&text=MESSAGE`
5. Falls back to `https://wa.me/PHONE?text=MESSAGE` if WhatsApp is not installed

#### The flow:

1. Doctor goes to a patient's profile or appointment
2. Taps "Send Reminder" or "Send Notification"
3. Chooses notification channels (Push and/or WhatsApp)
4. If WhatsApp is enabled:
   - WhatsApp opens automatically
   - The message is pre-filled with patient name, appointment date, time, and location
   - Doctor taps the send button in WhatsApp
   - WhatsApp delivers the message to the patient

#### Example WhatsApp message (generated by OrthoSync):

```
Dear Rahul Sharma,

This is a reminder for your dental appointment:

📅 Date: 2026-03-20
⏰ Time: 10:30
🏥 Location: Smile Dental Clinic
📍 Address: 123 MG Road, Mumbai
👨‍⚕️ Doctor: Dr. Pooja Gangare

Please arrive 10 minutes early. If you need to reschedule, please contact us.

Thank you!
OrthoSync - Built by Dr. Pooja Gangare
```

#### Where this is implemented:

The code is in `src/services/notificationService.ts`:
- `sendWhatsAppMessage()` -- Opens WhatsApp with the phone number and message
- `generateAppointmentReminderMessage()` -- Creates the reminder text
- `generateMissedAppointmentMessage()` -- Creates the missed appointment follow-up text

The phone number is automatically formatted with the India country code (`91`) if not already present.

---

### 5.2 Testing WhatsApp

#### Important: WhatsApp deep linking only works on physical devices

The iOS Simulator and Android Emulator do NOT have WhatsApp installed, so deep linking will not work on them. You must test on a physical phone.

#### Testing Steps:

1. Run OrthoSync on your physical phone (via Expo Go -- scan QR code)
2. Log in or create a test account
3. Add a test patient with a real phone number (a phone that has WhatsApp)
4. Navigate to that patient's profile
5. Tap "Send Notification" or find the WhatsApp option
6. Enable the WhatsApp toggle
7. Tap "Send"
8. WhatsApp should open with the message pre-filled
9. Verify the message looks correct
10. Tap the send button in WhatsApp (or cancel if testing)

#### What you should see:

1. When you tap send in OrthoSync, the screen switches to WhatsApp
2. A new chat opens with the patient's phone number
3. The message text area is pre-filled with the appointment reminder
4. You can edit the message if needed before sending

#### Fallback behavior:

- If WhatsApp is NOT installed on the device, the app opens `https://wa.me/...` in the browser
- This opens WhatsApp Web in the browser, which still allows sending the message
- This fallback works on all platforms including simulators and web

#### Testing the fallback:

On the web version (`npx expo start --web`), WhatsApp integration will always use the web fallback. Click the WhatsApp send button and it will open `https://wa.me/...` in a new browser tab.

---

### 5.3 WhatsApp Business API (Optional Advanced)

> **This section is optional.** The basic WhatsApp deep linking described above works without any setup. The Business API is only needed if you want to send messages **automatically** without the doctor manually tapping "Send" in WhatsApp.

#### What is the WhatsApp Business API?

The WhatsApp Business API allows programmatic sending of messages -- meaning the server sends messages automatically without user interaction. This is useful for:
- Automatic appointment reminders sent the day before
- Automated missed appointment follow-ups
- Bulk message sending

#### Requirements:

1. **WhatsApp Business Account** (not the regular WhatsApp Business app)
2. **Facebook Business Manager** account
3. **Verified business** (requires business documents)
4. **API provider** (you cannot connect directly -- you use a provider)

#### Recommended API providers for India:

| Provider   | Website                     | Pricing                    |
|------------|----------------------------|----------------------------|
| Twilio     | twilio.com                 | Pay per message (~Rs 0.50) |
| MSG91      | msg91.com                  | Pay per message             |
| Gupshup    | gupshup.io                 | Pay per message             |
| WATI       | wati.io                    | Monthly plans               |
| Interakt   | interakt.shop              | Monthly plans               |

#### Integration steps (high level):

1. Sign up with a provider (e.g., MSG91 or Gupshup)
2. Get API credentials (API key, phone number ID)
3. Create message templates (WhatsApp requires pre-approved templates)
4. Set up a Firebase Cloud Function to call the provider's API
5. Trigger the function when appointments are created/updated

> **Note:** This is an advanced setup that requires a backend server or Firebase Cloud Functions. It is NOT needed for the basic OrthoSync functionality.

---

## Section 6: Building for Production

When you are ready to distribute OrthoSync to real users (not just testing through Expo Go), you need to create production builds.

---

### 6.1 Configure app.json / app.config.js

Before building, make sure your `app.json` has all the required fields. Open `app.json` and update it to include platform-specific identifiers.

Here is a complete example:

```json
{
  "expo": {
    "name": "OrthoSync",
    "slug": "OrthoSync",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.orthosync.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "OrthoSync needs camera access to take patient photos",
        "NSPhotoLibraryUsageDescription": "OrthoSync needs photo library access to attach patient photos"
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "package": "com.orthosync.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#1A8B8B"
        }
      ],
      "expo-camera",
      "expo-image-picker"
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

**Important fields to set:**

| Field | Value | Why |
|-------|-------|-----|
| `ios.bundleIdentifier` | `com.orthosync.app` | Unique ID for the iOS app |
| `android.package` | `com.orthosync.app` | Unique ID for the Android app |
| `android.googleServicesFile` | `./google-services.json` | Points to Firebase Android config |
| `version` | `1.0.0` | User-visible version number |
| `ios.buildNumber` | `1` | iOS internal build number (increment for each upload) |
| `android.versionCode` | `1` | Android internal version code (increment for each upload) |

---

### 6.2 Build for Android (APK/AAB)

EAS Build is Expo's cloud build service. It builds your app on Expo's servers, so you do not need to install the full Android build tools locally.

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

**Expected output:**

```
added 1 package in 5s
```

Verify:

```bash
eas --version
```

**Expected output:**

```
eas-cli/12.x.x ...
```

#### Step 2: Log in to Expo

```bash
eas login
```

Enter your Expo account username and password (from Section 1.8, Step 4).

#### Step 3: Configure EAS Build

```bash
eas build:configure
```

**Expected output:**

```
? What platforms would you like to configure for EAS Build? All

Generated eas.json
```

This creates an `eas.json` file in your project root. The default configuration is fine for most cases.

#### Step 4: Build an Android APK (for testing)

```bash
eas build --platform android --profile preview
```

If there is no "preview" profile in `eas.json`, you can create one. Open `eas.json` and make it look like:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Then run:

```bash
eas build --platform android --profile preview
```

**What happens:**
1. EAS uploads your project to Expo's build servers
2. The build takes 5-15 minutes
3. You get a URL to download the APK when it is done

**Expected output (during build):**

```
✔ Using remote Android credentials (Expo server)

Build details: https://expo.dev/accounts/yourusername/projects/OrthoSync/builds/xxxxxxxx

Waiting for build to complete. You can press Ctrl+C to exit.
⠸ Build in progress...
```

After the build completes:

```
✔ Build finished.

🤖 Android app:
https://expo.dev/artifacts/eas/xxxxxxxxxxxx.apk
```

#### Step 5: Download and install the APK

1. Open the artifact URL on your Android phone (or email it to yourself)
2. Download the `.apk` file
3. Open it to install (you may need to enable "Install from unknown sources" in Android Settings)

#### Step 6: Build for production (AAB for Play Store)

```bash
eas build --platform android --profile production
```

This creates an `.aab` (Android App Bundle) file, which is the format required by the Google Play Store.

---

### 6.3 Build for iOS (IPA)

#### Prerequisites

- Apple Developer Account ($99/year)
- Active Apple Developer Program membership

#### Step 1: Build for iOS

```bash
eas build --platform ios --profile production
```

**What happens:**
1. EAS will ask you to log in with your Apple ID
2. It will handle code signing automatically (creating provisioning profiles, certificates, etc.)
3. The build takes 10-20 minutes
4. You get a URL to download the IPA

**Expected prompts:**

```
? Do you have access to the Apple account that will be used for submitting this app to the App Store? Yes

? Apple ID: your.email@example.com
? Password: [hidden]

✔ Logged in as your.email@example.com
✔ Bundle identifier: com.orthosync.app
✔ Synced capabilities

Build details: https://expo.dev/accounts/yourusername/projects/OrthoSync/builds/xxxxxxxx

Waiting for build to complete...
```

#### Step 2: Understanding code signing

When EAS asks about credentials, choose **"Let Expo handle it"** (the default). EAS will:
- Create a Distribution Certificate on your Apple Developer account
- Create a Provisioning Profile
- Sign the app automatically

You do not need to understand the details of code signing -- EAS handles it all.

#### Troubleshooting

**Problem: "Your Apple Developer account does not have an active membership"**

You need to pay the $99/year Apple Developer Program fee at https://developer.apple.com/programs/

**Problem: "The bundle identifier is not available"**

Another app is already using `com.orthosync.app` on the App Store. Change the `bundleIdentifier` in `app.json` to something unique, like `com.yourname.orthosync`.

---

### 6.4 Submit to Google Play Store

#### Step 1: Create a Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Pay the one-time registration fee ($25 USD)
4. Complete the account setup (name, address, etc.)

#### Step 2: Create an app listing

1. In Play Console, click **Create app**
2. **App name:** OrthoSync
3. **Default language:** English (US) or English (India)
4. **App or Game:** App
5. **Free or Paid:** Free (or Paid if you charge)
6. Accept the policies and click **Create app**

#### Step 3: Fill out the store listing

Under **Store listing > Main store listing:**
- **Short description** (up to 80 characters): "Dental practice management for orthodontists"
- **Full description** (up to 4000 characters): Describe all features
- **Screenshots:** You need at least 2 screenshots for phone, 2 for tablet (optional)
  - Take screenshots from the emulator: On the emulator, press the camera icon in the toolbar
  - Or use `adb shell screencap` command
- **App icon:** 512x512 PNG (use the icon from `assets/icon.png`)
- **Feature graphic:** 1024x500 PNG

#### Step 4: Upload the AAB

1. Go to **Production > Create new release** (or **Testing > Internal testing** first)
2. Click **Upload** and select your `.aab` file
3. Add release notes
4. Click **Review release**
5. Click **Start rollout to production**

#### Step 5: Wait for review

Google reviews your app, usually within 1-3 days. You will receive an email when it is approved or if there are issues.

---

### 6.5 Submit to Apple App Store

#### Step 1: Set up App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Click **My Apps**
4. Click the **+** button > **New App**
5. Fill in:
   - **Platform:** iOS
   - **Name:** OrthoSync
   - **Primary Language:** English
   - **Bundle ID:** com.orthosync.app (select from dropdown -- it should appear if you built with EAS)
   - **SKU:** orthosync (a unique identifier you choose)
6. Click **Create**

#### Step 2: Fill out app information

Under your app in App Store Connect:
- **App Information:** Category (Medical), description, keywords
- **Pricing and Availability:** Set price and countries
- **App Privacy:** Complete the privacy questionnaire

#### Step 3: Submit using EAS Submit

The easiest way to upload your build to App Store Connect:

```bash
eas submit --platform ios
```

EAS will:
1. Ask for your Apple ID credentials
2. Upload the latest iOS build to App Store Connect
3. You will see the build appear in App Store Connect under TestFlight

#### Step 4: Complete submission in App Store Connect

1. In App Store Connect, go to your app > **App Store** tab
2. Under the current version, click **Build** and select the uploaded build
3. Add screenshots (required sizes: 6.7", 6.5", 5.5" iPhones)
4. Write a description, keywords, support URL
5. Click **Submit for Review**

#### Step 5: Wait for review

Apple reviews your app, usually within 24-48 hours. You will be notified by email. Common rejection reasons:
- Missing privacy policy URL
- Incomplete metadata
- Bugs or crashes during review
- Guideline violations

---

## Section 7: Troubleshooting Guide

This section covers the most common issues you might encounter while developing OrthoSync, with solutions for each.

---

### "Module not found" or "Unable to resolve module" errors

**Symptom:** Terminal shows something like:
```
error: Error: Unable to resolve module react-native-screens from ...
```

**Solution 1:** Clear cache and restart:
```bash
npx expo start --clear
```

**Solution 2:** Reinstall node_modules:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

**Solution 3:** If a specific package is missing:
```bash
npx expo install package-name-here
```

---

### Metro bundler stuck or not responding

**Symptom:** The development server starts but the app does not load. The terminal shows no new output.

**Solution 1:** Stop the server (press `Ctrl + C`) and restart with cache clear:
```bash
npx expo start --clear
```

**Solution 2:** Kill all Metro processes:
```bash
lsof -ti:8081 | xargs kill -9
npx expo start
```

**Solution 3:** Reset Watchman:
```bash
watchman watch-del-all
npx expo start --clear
```

---

### iOS build fails / "pod install" errors

**Symptom:** iOS build fails with errors about CocoaPods or native modules.

**Solution:**
```bash
cd ios
pod install
cd ..
npx expo start --ios
```

If the `ios` folder does not exist (Expo managed workflow), run:
```bash
npx expo prebuild --platform ios
cd ios
pod install
cd ..
```

---

### Android emulator is slow

**Symptom:** The Android emulator takes a long time to start or the app runs slowly.

**Solution 1: Apple Silicon Mac (M1/M2/M3/M4):**
- Make sure you are using an ARM64 system image in your AVD
- The emulator should run at near-native speed

**Solution 2: Intel Mac:**
- Install HAXM: `brew install intel-haxm`
- In the AVD settings, increase RAM to 4096 MB
- Use an x86_64 system image (not x86)

**Solution 3: All Macs:**
- Close other heavy applications (Chrome, Slack, Docker)
- In AVD settings, set Graphics to "Hardware - GLES 2.0"

---

### "Network request failed" error

**Symptom:** The app shows network errors when trying to connect to Firebase.

**Solution 1:** Check your Firebase configuration:
- Open `src/config/firebase.ts`
- Verify all values are correct (not placeholder values)
- Make sure you copied from the correct Firebase project

**Solution 2:** Check your internet connection:
- The development device/emulator must have internet access
- On simulators: they share your Mac's internet connection
- On physical devices: make sure WiFi is connected

**Solution 3:** Check Firebase Console:
- Go to https://console.firebase.google.com
- Make sure Firestore, Auth, and Storage are all enabled
- Check if test mode has expired (it expires after 30 days)

---

### Blank white screen on app launch

**Symptom:** The app loads but shows a white screen with no content.

**Solution 1:** Check the Terminal for JavaScript errors. Look for red text.

**Solution 2:** On physical device, shake the phone to open the developer menu > "Reload"

**Solution 3:** Check that all imports are correct:
```bash
npx tsc --noEmit
```

This will show any TypeScript errors that might cause the app to crash silently.

**Solution 4:** Clear all caches:
```bash
npx expo start --clear
```

---

### Glassmorphism not showing correctly

**Symptom:** The frosted-glass effect (blur) does not appear. Cards look flat or transparent without the blur.

**Explanation:** The `expo-blur` library has different behavior on different platforms:
- **Physical iPhone/iPad:** Full glassmorphism effect works perfectly
- **iOS Simulator:** Blur effect may appear simplified
- **Android:** `expo-blur` may have a simpler fallback (overlay without blur)
- **Web:** Uses CSS `backdrop-filter` -- works on most modern browsers

**Solution:** This is expected behavior. The app includes fallback styles for platforms where blur is not supported. Test on a physical iOS device for the best visual experience.

---

### "Invariant Violation" error

**Symptom:** Red error screen with "Invariant Violation: ..." message.

**Common causes:**

1. **Component name mismatch:** A screen or component is imported with the wrong name
   - Check that the import name matches the export name exactly

2. **Missing navigation screen:** A navigation screen is referenced but not registered
   - Check `src/navigation/` files for missing screen registrations

3. **Platform-specific code issue:** Code that works on one platform but not another
   - Check for `Platform.OS` conditions in the relevant file

**Solution:** Read the full error message. It usually tells you exactly which component or module has the problem.

---

### AsyncStorage quota exceeded

**Symptom:** Error about storage quota being exceeded, or data not saving.

**Solution 1:** Clear app data:
- **iOS Simulator:** Device > Erase All Content and Settings
- **Android Emulator:** Settings > Apps > Expo Go > Clear Data
- **Physical device:** Uninstall and reinstall the app

**Solution 2:** Reduce stored data. AsyncStorage has a 6 MB limit on Android by default. If you are storing large amounts of data (many patients with photos), consider using Firebase Storage for photos instead of local storage.

---

### WhatsApp not opening when sending notification

**Symptom:** Tapping "Send via WhatsApp" does nothing, or opens the browser instead of WhatsApp.

**Solution 1:** You must be testing on a **physical device** with WhatsApp installed. Simulators and emulators do not have WhatsApp.

**Solution 2:** Check the phone number format. The notification service prepends `91` (India country code) automatically. If your test number already has `91`, it might become `9191...`. Check `src/services/notificationService.ts`.

**Solution 3:** If testing on web, the app correctly falls back to `https://wa.me/...` which opens WhatsApp Web in the browser.

---

### Push notifications not working

**Symptom:** Notifications are not appearing on the device.

**Checklist:**
1. **Permissions granted?** Check device settings > OrthoSync > Notifications > Enabled
2. **Physical device?** Notifications have limited support on simulators
3. **FCM configured?** For Android, ensure `google-services.json` is in the project root
4. **APNs configured?** For iOS, ensure the APNs key is uploaded to Firebase (Section 4.3)
5. **Expo Push Token obtained?** Check the console logs when the app starts
6. **Not in Do Not Disturb?** Check device is not in silent/DND mode

**Testing:**
```bash
# Send a test notification using curl (replace YOUR_TOKEN with the Expo Push Token)
curl -H "Content-Type: application/json" -d '{
  "to": "ExponentPushToken[YOUR_TOKEN]",
  "title": "Test Notification",
  "body": "This is a test from OrthoSync"
}' https://exp.host/--/api/v2/push/send
```

---

### "Cannot find module" in VS Code (red squiggly lines)

**Symptom:** VS Code shows red underlines under imports, but the app runs fine.

**Solution 1:** Restart the TypeScript server:
1. Press `Command + Shift + P`
2. Type "TypeScript: Restart TS Server"
3. Press Enter

**Solution 2:** Make sure `node_modules` exists:
```bash
npm install
```

**Solution 3:** Check `tsconfig.json` extends the correct base:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

---

### App works on one platform but crashes on another

**Symptom:** App runs perfectly on iOS but crashes on Android (or vice versa).

**Solution:** Check for platform-specific issues:

1. Look for components that are iOS-only or Android-only
2. Check `Platform.OS` conditions in the code
3. Run `npx tsc --noEmit` to check for type errors
4. Check the Metro bundler terminal output for error details
5. Common culprits: date formatting differences, font loading, animation APIs

---

### Expo Go version mismatch

**Symptom:** Error about SDK version incompatibility:
```
This version of Expo Go is not compatible with the SDK version of your project.
```

**Solution:** Update Expo Go on your phone to the latest version from App Store / Play Store. OrthoSync uses Expo SDK 55, which requires the matching Expo Go version.

If you cannot update Expo Go, you can use a development build instead:
```bash
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

---

## Section 8: Environment Variables & Security

### Never commit sensitive data to public repositories

The following values are sensitive and should NEVER be committed to a public GitHub repository:

| File / Value | Why it is sensitive |
|---|---|
| `src/config/firebase.ts` (with real API keys) | Anyone could use your Firebase project |
| `google-services.json` | Contains your Firebase project credentials |
| `GoogleService-Info.plist` | Contains your Firebase project credentials |
| `.p8` APNs key file | Anyone could send push notifications as you |
| `.p12` or `.mobileprovision` files | iOS code signing credentials |
| `.env` files with secrets | Environment-specific secrets |
| `.jks` Android keystore | Your app signing identity |

### Using .env files with Expo

#### Step 1: Install the dotenv package

```bash
npx expo install expo-constants
```

#### Step 2: Create a .env file

Create a file called `.env.local` in your project root:

```
FIREBASE_API_KEY=AIzaSyB1234567890abcdefg
FIREBASE_AUTH_DOMAIN=orthosync-12345.firebaseapp.com
FIREBASE_PROJECT_ID=orthosync-12345
FIREBASE_STORAGE_BUCKET=orthosync-12345.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

#### Step 3: Use in app.config.js

Convert `app.json` to `app.config.js` to use environment variables:

```javascript
import 'dotenv/config';

export default {
  expo: {
    name: "OrthoSync",
    slug: "OrthoSync",
    // ... rest of your config
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
};
```

Then in your Firebase config:

```typescript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

export default firebaseConfig;
```

### What the .gitignore already protects

OrthoSync's `.gitignore` file already excludes these sensitive files:

```
node_modules/          -- Dependencies (too large for Git)
.expo/                 -- Expo cache
dist/                  -- Build output
web-build/             -- Web build output
*.jks                  -- Android keystores
*.p8                   -- APNs keys
*.p12                  -- iOS certificates
*.key                  -- Private keys
*.mobileprovision      -- iOS provisioning profiles
.env*.local            -- Local environment files
*.pem                  -- PEM certificates
/ios                   -- Generated native iOS folder
/android               -- Generated native Android folder
```

### Files you should NEVER commit (verify they are in .gitignore):

```
google-services.json
GoogleService-Info.plist
.env
.env.local
.env.production
*.p8
*.p12
*.jks
*.keystore
serviceAccountKey.json
```

If any of these are NOT in your `.gitignore`, add them before committing:

```bash
echo "google-services.json" >> .gitignore
echo "GoogleService-Info.plist" >> .gitignore
echo ".env" >> .gitignore
```

### What if you accidentally committed sensitive data?

If you pushed API keys or credentials to a public repository:

1. **Immediately rotate the credentials:**
   - Firebase: Firebase Console > Project Settings > General > Your apps > delete and re-create the app
   - APNs key: Apple Developer Console > Keys > Revoke and create new key

2. **Remove from Git history:**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/config/firebase.ts" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

> **Warning:** This rewrites Git history. Coordinate with your team before doing this.

3. **Add the file to .gitignore** to prevent future commits.

---

## Quick Reference: Common Commands

Here is a cheat sheet of the most common commands you will use during development:

| What you want to do | Command |
|---|---|
| Start the development server | `npx expo start` |
| Start with cache cleared | `npx expo start --clear` |
| Open on iOS Simulator | `npx expo start --ios` |
| Open on Android Emulator | `npx expo start --android` |
| Open on Web | `npx expo start --web` |
| Install a new package | `npx expo install package-name` |
| Check TypeScript errors | `npx tsc --noEmit` |
| Reinstall all dependencies | `rm -rf node_modules && npm install` |
| Build Android APK | `eas build --platform android --profile preview` |
| Build Android AAB (production) | `eas build --platform android --profile production` |
| Build iOS (production) | `eas build --platform ios --profile production` |
| Submit to App Store | `eas submit --platform ios` |
| Submit to Play Store | `eas submit --platform android` |
| Check Expo version | `npx expo --version` |
| Log in to Expo | `eas login` |
| View build status | `eas build:list` |
| Check connected Android devices | `adb devices` |
| List iOS simulators | `xcrun simctl list devices available` |
| Kill process on port 8081 | `lsof -ti:8081 \| xargs kill -9` |
| Reset Watchman | `watchman watch-del-all` |
| View project in VS Code | `code .` |

---

## Glossary

Terms you will encounter while working with OrthoSync:

| Term | Meaning |
|---|---|
| **React Native** | A framework for building mobile apps using JavaScript/TypeScript |
| **Expo** | A platform built on React Native that simplifies development |
| **Expo SDK 55** | The specific version of Expo that OrthoSync uses |
| **TypeScript** | A typed version of JavaScript that catches errors before runtime |
| **Metro** | The JavaScript bundler that React Native uses (packages your code) |
| **Zustand** | A lightweight state management library (stores app data in memory) |
| **AsyncStorage** | A local storage system for React Native (like localStorage in web) |
| **Firebase** | Google's backend platform (authentication, database, storage) |
| **Firestore** | Firebase's NoSQL database |
| **FCM** | Firebase Cloud Messaging (push notifications) |
| **APNs** | Apple Push Notification service |
| **EAS** | Expo Application Services (cloud build and submit) |
| **APK** | Android Package Kit (the file format for Android apps) |
| **AAB** | Android App Bundle (the format for Play Store submissions) |
| **IPA** | iOS App Store Package (the file format for iOS apps) |
| **Deep Linking** | Opening another app (like WhatsApp) with specific data pre-filled |
| **Glassmorphism** | A UI design trend using frosted-glass translucent backgrounds |
| **AVD** | Android Virtual Device (the simulated Android phone) |
| **CocoaPods** | A dependency manager for iOS native libraries |
| **Homebrew** | A package manager for macOS |
| **npm** | Node Package Manager (installs JavaScript libraries) |
| **npx** | Runs npm packages without installing them globally |
| **Node.js** | A JavaScript runtime for running JS outside the browser |
| **Git** | A version control system for tracking code changes |
| **GitHub** | A website for hosting Git repositories |
| **Watchman** | A file watcher that detects code changes for hot reload |
| **OTP** | One-Time Password (the verification code sent to a phone) |
| **i18n** | Internationalization (supporting multiple languages -- English and Hindi) |

---

## Version History of This Guide

| Date | Version | Changes |
|---|---|---|
| 2026-03-15 | 1.0.0 | Initial comprehensive setup guide |

---

**End of Setup Guide**

If you followed every step in this guide, you should have:
1. All required software installed on your Mac
2. OrthoSync running on iOS Simulator, Android Emulator, Web, and/or your physical device
3. Firebase configured with Authentication, Firestore, Storage, and Cloud Messaging
4. Push notifications configured for both iOS and Android
5. WhatsApp integration working on physical devices
6. Knowledge of how to build and submit to the App Store and Play Store

For questions or issues not covered in this guide, check:
- Expo documentation: https://docs.expo.dev
- React Native documentation: https://reactnative.dev
- Firebase documentation: https://firebase.google.com/docs
- OrthoSync repository issues: https://github.com/zxrrcpandey/OrthoSync/issues
