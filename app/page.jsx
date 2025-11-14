"use client";
import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const validateFile = (file) => {
    if (!file) {
      alert("No file selected.");
      return false;
    }

    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowed.includes(file.type)) {
      alert("❌ Only PDF or Images allowed.");
      return false;
    }

    return true;
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    setLoading(true);
    setExtractedText("");
    setAnalysis("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const extractRes = await fetch("http://127.0.0.1:8000/extract", {
        method: "POST",
        body: formData,
      });

      const extractData = await extractRes.json();

      if (extractData.error) {
        alert(extractData.error);
        setLoading(false);
        return;
      }

      setExtractedText(extractData.text);

      const analyzeRes = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.text }),
      });

      const analyzeData = await analyzeRes.json();

      if (analyzeData.error) {
        alert(analyzeData.error);
        setLoading(false);
        return;
      }

      setAnalysis(analyzeData.analysis);
    } catch (err) {
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">AI Content Analyzer</h1>

      <h2 className="section-title">Upload File</h2>

      <div
        className="upload-box"
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = e.dataTransfer.files[0];
          if (validateFile(dropped)) {
            setFile(dropped);
            if (dropped.type.startsWith("image/"))
              setPreview(URL.createObjectURL(dropped));
            else setPreview(null);
          }
        }}
      >
        <b>Drag & Drop File</b>
        <p style={{ color: "#777" }}>PDF or Image</p>

        <input
          type="file"
          className="file-input"
          accept=".pdf, image/*"
          onChange={(e) => {
            const uploaded = e.target.files[0];
            if (validateFile(uploaded)) {
              setFile(uploaded);
              if (uploaded.type.startsWith("image/"))
                setPreview(URL.createObjectURL(uploaded));
              else setPreview(null);
            }
          }}
        />

        <p style={{ marginTop: 10, color: "green" }}>
          Allowed: PDF, PNG, JPG, JPEG
        </p>
      </div>

      {preview && <img src={preview} className="preview-img" />}

      <button className="btn" onClick={handleAnalyze}>
        {loading ? "Analyzing..." : "Analyze Content"}
      </button>

      {extractedText && (
        <div className="extract-box">
          <h3>Extracted Text:</h3>
          {extractedText}
        </div>
      )}

      {analysis && (
        <div className="result-box">
          <h3>Summary:</h3>
          {analysis}
        </div>
      )}
    </div>
  );
}
