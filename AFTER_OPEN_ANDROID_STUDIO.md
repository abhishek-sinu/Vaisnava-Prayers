# What to do after opening Android Studio with Capacitor

1. **Wait for Gradle Sync**
   - Android Studio will automatically sync the Gradle project. Wait for it to finish (bottom status bar will show progress).

2. **Check for Errors**
   - If you see any errors, let Android Studio finish indexing and syncing. If errors persist, try "File > Sync Project with Gradle Files".

3. **Build the APK**
   - Go to the top menu: `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
   - Wait for the build to finish (progress at the bottom).

4. **Locate the APK**
   - After building, a notification will appear: "APK(s) generated successfully. Locate or analyze the APK."
   - Click "locate" or manually find it in:
     - `android/app/build/outputs/apk/debug/app-debug.apk` (for testing)
     - `android/app/build/outputs/apk/release/app-release.apk` (for production, after signing)

5. **Install the APK on your device**
   - Copy the APK to your Android device and open it to install (you may need to allow installation from unknown sources).
   - Or use `adb install app-debug.apk` if you have Android Platform Tools installed.

6. **(Optional) Build a Signed APK for Play Store**
   - For publishing, you need a signed APK or AAB. Go to `Build > Generate Signed Bundle / APK` and follow the wizard.
   - You will need to create a keystore if you don't have one.

---

**Tips:**
- For every new web build, run `npm run build` and `npx cap copy android` before building the APK again.
- Test your app on a real device for best results.
- If you change web code, always rebuild and copy before building a new APK.

