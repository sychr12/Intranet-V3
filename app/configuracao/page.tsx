"use client";

import React, { useState } from "react";

type UploadResult = { ok: boolean; message?: string; };

function Card({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-72 h-48 rounded-2xl bg-emerald-900/90 hover:bg-emerald-900/95 transition p-6 text-white flex flex-col items-center justify-center shadow-lg"
    >
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-2xl font-bold tracking-wider">{title}</div>
    </button>
  );
}

export default function MaterialCards() {
  const [openUpload, setOpenUpload] = useState(false);
  const [openPdfEditor, setOpenPdfEditor] = useState(false);

  /* ---------- Upload (Mandar matérias) ---------- */
  const [files, setFiles] = useState<File[]>([]);
  const [materiaTitulo, setMateriaTitulo] = useState("");
  const [materiaDescricao, setMateriaDescricao] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  }

  async function sendMaterials() {
    if (files.length === 0) {
      setUploadMessage("Selecione ao menos um arquivo.");
      return;
    }
    setUploading(true);
    setUploadMessage(null);

    try {
      const fd = new FormData();
      fd.append("titulo", materiaTitulo);
      fd.append("descricao", materiaDescricao);
      files.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data: UploadResult = await res.json();
      if (data.ok) {
        setUploadMessage("Arquivos enviados com sucesso.");
        setFiles([]);
        setMateriaTitulo("");
        setMateriaDescricao("");
      } else {
        setUploadMessage(data.message || "Erro ao enviar.");
      }
    } catch (err) {
      console.error(err);
      setUploadMessage("Erro ao conectar com o servidor.");
    } finally {
      setUploading(false);
    }
  }

  /* ---------- PDF Editor (Editar e enviar PDF) ---------- */
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);

  function handlePdfSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f && f.type === "application/pdf") {
      setPdfFile(f);
      setPdfTitle((prev) => prev || f.name.replace(/\.pdf$/i, ""));
      setPdfMessage(null);
    } else {
      setPdfFile(null);
      setPdfMessage("Selecione um arquivo PDF válido.");
    }
  }

  async function sendPdf() {
    if (!pdfFile) {
      setPdfMessage("Selecione um PDF antes de enviar.");
      return;
    }
    setPdfUploading(true);
    setPdfMessage(null);

    try {
      const fd = new FormData();
      fd.append("title", pdfTitle);
      fd.append("description", pdfDescription);
      fd.append("file", pdfFile);

      const res = await fetch("/api/pdf", {
        method: "POST",
        body: fd,
      });

      const data: UploadResult = await res.json();
      if (data.ok) {
        setPdfMessage("PDF enviado com sucesso.");
        setPdfFile(null);
        setPdfTitle("");
        setPdfDescription("");
      } else {
        setPdfMessage(data.message || "Erro ao enviar PDF.");
      }
    } catch (err) {
      console.error(err);
      setPdfMessage("Erro ao conectar com o servidor.");
    } finally {
      setPdfUploading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 p-8 bg-gray-50">
      <h2 className="text-3xl font-semibold text-gray-800">Materiais</h2>

      <div className="flex gap-8">
        <Card
          title="Mandar Matérias"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            >
              <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          onClick={() => setOpenUpload(true)}
        />

        <Card
          title="Editar & Enviar PDF"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M12 2v20M3 7h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          onClick={() => setOpenPdfEditor(true)}
        />
      </div>

      {/* ---------- Modal Upload (Mandar Matérias) ---------- */}
      {openUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Mandar Matérias</h3>
              <button onClick={() => setOpenUpload(false)} className="text-gray-600 hover:text-gray-800">Fechar</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  value={materiaTitulo}
                  onChange={(e) => setMateriaTitulo(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                  placeholder="Título da matéria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={materiaDescricao}
                  onChange={(e) => setMateriaDescricao(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                  placeholder="Breve descrição"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Arquivos (documentos, imagens, zip)</label>
                <input multiple type="file" onChange={handleFilesSelected} className="mt-2" />
                {files.length > 0 && (
                  <ul className="mt-2">
                    {files.map((f, i) => (
                      <li key={i} className="text-sm text-gray-700">{f.name} • {Math.round(f.size/1024)} KB</li>
                    ))}
                  </ul>
                )}
              </div>

              {uploadMessage && <div className="text-sm text-gray-700">{uploadMessage}</div>}

              <div className="flex items-center gap-3 justify-end">
                <button onClick={() => setOpenUpload(false)} className="px-4 py-2 border rounded">Cancelar</button>
                <button
                  onClick={sendMaterials}
                  disabled={uploading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
                >
                  {uploading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal PDF Editor (Editar & Enviar PDF) ---------- */}
      {openPdfEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Editar & Enviar PDF</h3>
              <button onClick={() => setOpenPdfEditor(false)} className="text-gray-600 hover:text-gray-800">Fechar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Arquivo PDF</label>
                <input type="file" accept="application/pdf" onChange={handlePdfSelected} className="mt-2" />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} className="mt-1 block w-full border rounded-md p-2" placeholder="Título do PDF" />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea value={pdfDescription} onChange={(e) => setPdfDescription(e.target.value)} className="mt-1 block w-full border rounded-md p-2" placeholder="Descrição" />
                </div>

                {pdfMessage && <div className="mt-3 text-sm text-gray-700">{pdfMessage}</div>}

                <div className="flex gap-3 justify-end mt-6">
                  <button onClick={() => setOpenPdfEditor(false)} className="px-4 py-2 border rounded">Cancelar</button>
                  <button
                    onClick={sendPdf}
                    disabled={pdfUploading}
                    className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 disabled:opacity-60"
                  >
                    {pdfUploading ? "Enviando..." : "Enviar PDF"}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Pré-visualização</div>
                <div className="border rounded-md h-80 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {!pdfFile ? (
                    <div className="text-gray-500">Nenhum PDF selecionado</div>
                  ) : (
                    // iframe preview usando URL blob
                    <iframe
                      title="PDF Preview"
                      src={URL.createObjectURL(pdfFile)}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Observação: Edição aprofundada de conteúdo interno do PDF (como adicionar texto dentro do PDF) exige processamento no backend ou libs específicas (pdf-lib). Aqui o frontend envia o arquivo e metadados ao servidor.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
