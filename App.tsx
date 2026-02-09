import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { localService } from "./services/localService";
import { VoiceName, VisionModel, ProcessingState, AudioResult } from "./types";

const APP_VERSION = "v4.0.0";

const voiceDisplayNames: Record<VoiceName, string> = {
  [VoiceName.Kore]: "Kore (női)",
  [VoiceName.Charon]: "Charon (férfi)",
  [VoiceName.Aoede]: "Aoede (női)",
  [VoiceName.Puck]: "Puck (férfi)",
  [VoiceName.Fenrir]: "Fenrir (férfi)",
};

const modelDisplayNames: Record<VisionModel, string> = {
  [VisionModel.Gemini3ProPreview]: "Gemini 3 Pro Preview",
  [VisionModel.Gemini3FlashPreview]: "Gemini 3 Flash Preview",
  [VisionModel.Gemini25Flash]: "Gemini 2.5 Flash",
  [VisionModel.Gemini25FlashLite]: "Gemini 2.5 Flash Lite",
  [VisionModel.Gemini25Pro]: "Gemini 2.5 Pro",
};

const App: React.FC = () => {
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(
    null
  );
  const [pdfFileName, setPdfFileName] = useState<string>("dokumentum");
  const [pageCount, setPageCount] = useState<number>(0);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [extractedText, setExtractedText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [selectedModel, setSelectedModel] = useState<VisionModel>(
    VisionModel.Gemini3ProPreview
  );
  const [processing, setProcessing] = useState<ProcessingState>({
    status: "idle",
    message: "",
  });
  const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setProcessing({
        status: "error",
        message: "Kérjük, csak PDF fájlt töltsön fel!",
      });
      return;
    }
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setPdfFileName(baseName);
    setProcessing({ status: "extracting", message: "Fájl beolvasása..." });
    setAudioResult(null);
    setExtractedText("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) })
          .promise;
        const count = pdf.numPages;
        setPageCount(count);
        setPdfArrayBuffer(arrayBuffer);
        setStartPage(1);
        setEndPage(Math.min(count, 5));
        setProcessing({
          status: "ready_to_speech",
          message: "Válaszd ki az oldalakat a szekvenciális feldolgozáshoz.",
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setProcessing({
        status: "error",
        message: "Hiba történt a PDF beolvasása közben.",
      });
    }
  };

  const handleExtractRange = async () => {
    if (!pdfArrayBuffer) return;
    if (startPage > endPage) {
      setProcessing({ status: "error", message: "Hibás oldaltartomány!" });
      return;
    }

    setAudioResult(null);
    let fullText = "";
    const totalToProcess = endPage - startPage + 1;

    // Create new AbortController for this extraction
    abortControllerRef.current = new AbortController();

    try {
      for (let p = startPage; p <= endPage; p++) {
        // Check if extraction was stopped
        if (abortControllerRef.current.signal.aborted) {
          setProcessing({
            status: "ready_to_speech",
            message: "Kinyerés megszakítva.",
          });
          if (fullText.trim()) {
            setExtractedText(fullText.trim());
          }
          return;
        }

        setProcessing({
          status: "extracting",
          message: `Oldal elemzése (${
            p - startPage + 1
          } / ${totalToProcess})...`,
        });
        const pageText = await localService.extractSinglePage(
          pdfArrayBuffer,
          p,
          selectedModel,
          abortControllerRef.current.signal
        );
        fullText += pageText + "\n\n";
      }
      setExtractedText(fullText.trim());
      setProcessing({
        status: "ready_to_speech",
        message: "Az összes oldal elemzése sikeresen befejeződött.",
      });
    } catch (error: any) {
      if (error.name === "AbortError") {
        setProcessing({
          status: "ready_to_speech",
          message: "Kinyerés megszakítva.",
        });
        if (fullText.trim()) {
          setExtractedText(fullText.trim());
        }
      } else {
        setProcessing({
          status: "error",
          message: "Hiba történt az oldalankénti feldolgozás során.",
        });
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStopExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const generateAudio = async () => {
    if (!extractedText) return;
    setProcessing({
      status: "generating_audio",
      message: "Hang generálása darabolással...",
    });

    try {
      const wavBlob = await localService.textToSpeech(
        extractedText,
        selectedVoice,
        (current, total) => {
          setProcessing((prev) => ({
            ...prev,
            message: `Hang generálása: ${current} / ${total} részlet kész.`,
          }));
        }
      );

      const url = URL.createObjectURL(wavBlob);
      setAudioResult({ url, blob: wavBlob });
      setProcessing({
        status: "ready_to_speech",
        message: "A teljes hanganyag elkészült!",
      });
    } catch (error) {
      setProcessing({
        status: "error",
        message:
          "Hiba történt a hanggenerálás során. Próbáld meg kevesebb oldallal.",
      });
    }
  };

  const downloadAsWord = () => {
    if (!extractedText) return;
    const content = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body style="font-family: Arial; line-height: 1.5;">
        <h2>${pdfFileName} (${startPage}-${endPage}. oldal)</h2>
        <hr/><div style="white-space: pre-wrap;">${extractedText.replace(
          /\n/g,
          "<br/>"
        )}</div>
      </body></html>`;
    const blob = new Blob(["\ufeff", content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pdfFileName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl text-center mb-8 mt-4">
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" alt="VoxPDF Logo" className="h-16 md:h-40" />
        </div>
        <p className="text-slate-600 text-lg">
          Hosszú dokumentumok oldalankénti, precíz feldolgozása Gemini-vel.
        </p>
      </header>

      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100">
        {processing.status === "idle" && (
          <div
            className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-700">
              Kattints a PDF feltöltéséhez
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
        )}

        {(processing.status === "extracting" ||
          processing.status === "generating_audio") && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="relative w-16 h-16 mb-6 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-slate-700 animate-pulse px-4">
              {processing.message}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Oldalankénti feldolgozás folyamatban...
            </p>
            {processing.status === "extracting" && (
              <button
                onClick={handleStopExtraction}
                className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Kinyerés leállítása
              </button>
            )}
          </div>
        )}

        {processing.status === "error" && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
            <p className="text-red-700 font-medium text-center">
              {processing.message}
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() =>
                  setProcessing({ ...processing, status: "ready_to_speech" })
                }
                className="text-blue-600 font-bold underline"
              >
                Vissza
              </button>
              <button
                onClick={() => {
                  setPdfArrayBuffer(null);
                  setProcessing({ status: "idle", message: "" });
                }}
                className="text-slate-500 font-bold underline"
              >
                Új fájl
              </button>
            </div>
          </div>
        )}

        {processing.status === "ready_to_speech" && pdfArrayBuffer && (
          <div className="space-y-6">
            {!extractedText && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-4">
                  Oldaltartomány kiválasztása ({pageCount} oldal)
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={startPage}
                    onChange={(e) =>
                      setStartPage(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="bg-white border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Tól"
                  />
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={endPage}
                    onChange={(e) =>
                      setEndPage(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="bg-white border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ig"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    AI Modell
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) =>
                      setSelectedModel(e.target.value as VisionModel)
                    }
                    className="w-full bg-white border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  >
                    {Object.values(VisionModel).map((m) => (
                      <option key={m} value={m}>
                        {modelDisplayNames[m]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleExtractRange}
                  className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                  Szekvenciális kinyerés indítása
                </button>
              </div>
            )}

            {extractedText && (
              <>
                <div className="p-4 bg-white rounded-xl max-h-48 overflow-y-auto border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap shadow-inner">
                  <div className="flex justify-between items-center mb-2 border-b pb-1">
                    <h3 className="font-bold text-slate-800">
                      Kinyert szöveg előnézete:
                    </h3>
                    <button
                      onClick={() => setExtractedText("")}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Oldalak módosítása
                    </button>
                  </div>
                  {extractedText}
                </div>

                {!audioResult && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Hang kiválasztása (Gemini TTS)
                      </label>
                      <select
                        value={selectedVoice}
                        onChange={(e) =>
                          setSelectedVoice(e.target.value as VoiceName)
                        }
                        className="w-full bg-white border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                      >
                        {Object.values(VoiceName).map((v) => (
                          <option key={v} value={v}>
                            {voiceDisplayNames[v]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={generateAudio}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>Szöveg felolvasása</span>
                    </button>
                    <button
                      onClick={downloadAsWord}
                      className="w-full bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Word dokumentum letöltése</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {audioResult && (
              <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="text-blue-800 font-bold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8H5v4h2l3 3V5L7 8z" />
                  </svg>
                  Hanganyag elkészült
                </h4>
                <audio
                  controls
                  className="w-full mb-6"
                  src={audioResult.url}
                ></audio>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={audioResult.url}
                    download={`${pdfFileName}.wav`}
                    className="bg-blue-600 text-white font-bold p-3 rounded-xl text-center hover:bg-blue-700"
                  >
                    Letöltés (.wav)
                  </a>
                  <button
                    onClick={downloadAsWord}
                    className="bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700"
                  >
                    Word (.doc)
                  </button>
                </div>
                <button
                  onClick={() => {
                    setExtractedText("");
                    setAudioResult(null);
                  }}
                  className="w-full mt-3 text-blue-600 font-bold underline"
                >
                  Új tartomány feldolgozása
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-slate-400 text-sm text-center">
        <p className="font-medium">© 2025 VoxPDF • {APP_VERSION}</p>
        <p className="mt-1">Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
