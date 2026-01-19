# How to Build an Android APK from a React (Vite) Project Using Capacitor

1. **Install Capacitor dependencies**
   ```sh
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Initialize Capacitor**
   ```sh
   npx cap init prayers-app com.example.prayersapp --web-dir=dist
   ```
   - Replace `prayers-app` and `com.example.prayersapp` with your app name and package ID if desired.

3. **Build your React app**
   ```sh
   npm run build
   ```
   - This creates the production build in the `dist` folder.

4. **Add the Android platform**
   ```sh
   npx cap add android
   ```

5. **Copy the latest web build to the Android project**
   ```sh
   npx cap copy android
   ```
   - (Do this after every new web build.)

6. **Open the Android project in Android Studio**
   ```sh
   npx cap open android
   ```

7. **Build the APK in Android Studio**
   - In Android Studio, go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
   - The APK will be found in `android/app/build/outputs/apk/debug` (or `release` for production).

---

## How to Resize Your Logo for Android App Icons

You need to create multiple sizes of your logo for Android icons:

- **mipmap-mdpi**: 48x48 px
- **mipmap-hdpi**: 72x72 px
- **mipmap-xhdpi**: 96x96 px
- **mipmap-xxhdpi**: 144x144 px
- **mipmap-xxxhdpi**: 192x192 px

### Automated Resize (using Node.js and Sharp)

1. Install Sharp:
   ```sh
   npm install sharp
   ```
2. Save your logo as `vaishnava-logo.png` in your project root.
3. Create a script `resize-logo.js`:
   ```js
   const sharp = require('sharp');
   const sizes = [
     { name: 'mipmap-mdpi', size: 48 },
     { name: 'mipmap-hdpi', size: 72 },
     { name: 'mipmap-xhdpi', size: 96 },
     { name: 'mipmap-xxhdpi', size: 144 },
     { name: 'mipmap-xxxhdpi', size: 192 },
   ];
   sizes.forEach(({ name, size }) => {
     sharp('vaishnava-logo.png')
       .resize(size, size)
       .toFile(`android/app/src/main/res/${name}/ic_launcher.png`)
       .then(() => console.log(`Created ${name} icon (${size}x${size})`));
   });
   ```
4. Run the script:
   ```sh
   node resize-logo.js
   ```

This will generate all required icon sizes in the correct folders.

---

### Manual Resize (if you prefer)
- Use any online image resizer (e.g. https://resizeimage.net/)
- Download each size and place in the corresponding folder above.

---

**After resizing:**
- Rebuild your APK as usual.
- Your app will now use the new logo for its icon on all devices.

---

**Tips:**
- For release APK (for Play Store), you need to sign the APK. Let me know if you need those steps.
- You can use the same process for other web frameworks (Vue, Angular, etc.) with minor changes.
- For updates, always run `npm run build` and `npx cap copy android` before building the APK again.

For your Android app:

Copy vaishnava-logo.png to android/app/src/main/res/mipmap-*/ (resize to 48x48, 72x72, 96x96, 144x144, 192x192 for icons).
For splash screen, use it in android/app/src/main/res/drawable/ and configure with Capacitor or a splash plugin.
