"""
Piper TTS HTTP Server

Minimal Flask wrapper around the Piper CLI for browser-based TTS.
Accepts POST /api/tts with JSON { text, voice } and returns WAV audio.

Usage:
    pip install piper-tts flask flask-cors
    python scripts/piper_server.py

Hungarian voices (auto-downloaded on first use):
    hu_HU-anna-medium, hu_HU-berta-medium, hu_HU-imre-medium
"""

import io
import os
import subprocess
import tempfile
from pathlib import Path
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Map voice names to model file paths
PIPER_DATA_DIR = Path.home() / ".local" / "share" / "piper"
VOICE_MODELS = {
    "hu_HU-anna-medium": PIPER_DATA_DIR / "hu_HU-anna-medium" / "hu_HU-anna-medium.onnx",
    "hu_HU-berta-medium": PIPER_DATA_DIR / "hu_HU-berta-medium" / "hu_HU-berta-medium.onnx",
    "hu_HU-imre-medium": PIPER_DATA_DIR / "hu_HU-imre-medium" / "hu_HU-imre-medium.onnx",
}

VALID_VOICES = set(VOICE_MODELS.keys())


@app.route("/api/tts", methods=["POST"])
def tts():
    data = request.get_json(silent=True)
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Empty text"}), 400

    voice = data.get("voice", "hu_HU-anna-medium")
    if voice not in VALID_VOICES:
        return jsonify({"error": f"Invalid voice: {voice}"}), 400

    model_path = VOICE_MODELS[voice]
    if not model_path.exists():
        return jsonify({"error": f"Voice model not found: {model_path}"}), 500

    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

        result = subprocess.run(
            ["piper", "--model", str(model_path), "--output_file", tmp_path],
            input=text,
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode != 0:
            return jsonify({"error": f"Piper error: {result.stderr}"}), 500

        return send_file(
            tmp_path,
            mimetype="audio/wav",
            as_attachment=False,
        )
    except FileNotFoundError:
        return jsonify({"error": "Piper CLI not found. Install with: pip install piper-tts"}), 500
    except subprocess.TimeoutExpired:
        return jsonify({"error": "TTS generation timed out"}), 504


@app.route("/api/voices", methods=["GET"])
def voices():
    return jsonify({"voices": sorted(VALID_VOICES)})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    print("Piper TTS server starting on http://localhost:5001")
    print("Available voices:", ", ".join(sorted(VALID_VOICES)))
    app.run(host="0.0.0.0", port=5001, debug=False)
