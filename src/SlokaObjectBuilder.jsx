import React, { useState } from "react";

const initialState = {
  number: "",
  sanskrit: "",
  english: "",
  translation: ""
};

export default function SlokaObjectBuilder({ onCreate }) {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(form);
    if (onCreate) onCreate(form);
  };

  const handleReset = () => {
    setForm(initialState);
    setResult(null);
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = JSON.stringify(result, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Sloka Object Builder</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Number:<br />
            <input name="number" value={form.number} onChange={handleChange} style={{ width: "100%" }} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Sanskrit:<br />
            <textarea name="sanskrit" value={form.sanskrit} onChange={handleChange} rows={4} style={{ width: "100%" }} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>English:<br />
            <textarea name="english" value={form.english} onChange={handleChange} rows={4} style={{ width: "100%" }} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Translation:<br />
            <textarea name="translation" value={form.translation} onChange={handleChange} rows={4} style={{ width: "100%" }} required />
          </label>
        </div>
        <button type="submit" style={{ marginRight: 8 }}>Create Object</button>
        <button type="button" onClick={handleReset}>Reset</button>
      </form>
      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Resulting Object:</h3>
          <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 4 }}>{JSON.stringify(result, null, 2)}</pre>
          <button onClick={handleCopy} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 4, border: '1px solid #b77b1c', background: '#ecd9b6', color: '#7c4700', fontWeight: 600, cursor: 'pointer' }}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}
