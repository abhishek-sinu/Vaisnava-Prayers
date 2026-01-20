# How to Create New Prayer Sections

1. **Add the Section to this notes file**  
   Write the prayer section name, verse range, and Vedabase links for reference.

2. **Create a Template JSON File**  
   Create a new slokas_SectionName.json file with the same structure as existing files (fields: number, sanskrit, english, translation).

3. **Fetch Slokas from Vedabase**  
   Use the slokas_fetcher.cjs script to fetch Sanskrit, English, and translation for the desired range.
   
   Example command:
   ```
   node slokas_fetcher.cjs <canto> <chapter> <startVerse> <endVerse> slokas_SectionName.json
   ```
   For example, for SB 3.15.46-50:
   ```
   node slokas_fetcher.cjs 3 15 46 50 slokas_Sanakadi_Vaikuntha.json
   ```
   Or use:
   ```js
   fetchRange(3, 15, 46, 50, './slokas_Sanakadi_Vaikuntha.json');
   ```
   in slokas_fetcher.cjs and run the script.

4. **Add Odia and Bengali Transliteration**  
   After fetching, run:
   ```
   node add_transliterations.cjs
   ```
   This will add Odia and Bengali fields to all slokas_*.json files that are missing them.

5. **Review and Edit**  
   Open the new slokas_SectionName.json file.
   Review the Sanskrit, English, translation, Odia, and Bengali fields.
   Make any manual corrections if needed.

6. **Integrate with Main Data**  
   Import the new JSON file in src/slokasData.js and add it to the exported slokas object with a suitable display name.

7. **Add to UI Playlist (Sidebar/Navigation)**  
   Add a new entry for your prayer section in src/prayersData.js (title, reference, Vedabase link). This ensures it appears in the sidebar and navigation in the UI.

8. **Use in Your App**  
   Import or reference the new JSON file in your React app or wherever needed.

---

**Summary:**
- Add section info to this notes file
- Create template JSON
- Fetch slokas from Vedabase
- Add Odia/Bengali transliteration
- Review and edit
- Integrate with slokasData.js
- Add to prayersData.js for UI playlist
- Use in your app
