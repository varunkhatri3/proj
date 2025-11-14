"use client";
import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFileSelect = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
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
      alert("Something went wrong: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">AI Content Analyzer</h1>

      <h2 className="section-title">Upload File</h2>

      <div
        className={`upload-box ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <b>Drag & Drop File</b>
        <p style={{ color: "#777" }}>PDF or Image</p>

        <input
          type="file"
          className="file-input"
          accept=".pdf, image/*"
          onChange={(e) => {
            const uploaded = e.target.files[0];
            if (uploaded) {
              handleFileSelect(uploaded);
            }
          }}
        />

        {file && (
          <p style={{ marginTop: 10, color: "#2563eb", fontWeight: "bold" }}>
            ✓ {file.name}
          </p>
        )}

        <p style={{ marginTop: 10, color: "green" }}>
          Allowed: PDF, PNG, JPG, JPEG
        </p>
      </div>

      {preview && <img src={preview} alt="Preview" className="preview-img" />}

      <button className="btn" onClick={handleAnalyze} disabled={loading}>
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