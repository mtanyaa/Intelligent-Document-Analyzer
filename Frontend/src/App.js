import React, { useState } from 'react';

// Main App component
export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [persona, setPersona] = useState('');
  const [jobToBeDone, setJobToBeDone] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Function to handle file selection
  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(files ? Array.from(files) : []);
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    const formData = new FormData();
    for (const file of selectedFiles) {
      formData.append('files', file);
    }
    formData.append('persona', persona);
    formData.append('job_to_be_done', jobToBeDone);

    try {
      const res = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        
        .min-h-screen {
          min-height: 100vh;
        }

        .bg-gray-100 {
          background-color: #f7fafc;
        }

        .p-8 {
          padding: 2rem;
        }

        .flex {
          display: flex;
        }

        .items-center {
          align-items: center;
        }

        .justify-center {
          justify-content: center;
        }
        
        .font-sans {
          font-family: 'Inter', sans-serif;
        }

        .bg-white {
          background-color: #ffffff;
        }

        .rounded-xl {
          border-radius: 1rem;
        }
        
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .w-full {
          width: 100%;
        }

        .max-w-4xl {
          max-width: 56rem;
        }

        .space-y-8 > :not([hidden]) ~ :not([hidden]) {
          margin-top: 2rem;
        }

        .text-4xl {
          font-size: 2.25rem;
          line-height: 2.5rem;
        }

        .font-extrabold {
          font-weight: 800;
        }

        .text-center {
          text-align: center;
        }

        .text-gray-800 {
          color: #1a202c;
        }

        .tracking-tight {
          letter-spacing: -0.025em;
        }

        .inline-block {
          display: inline-block;
        }
        
        .text-indigo-600 {
            color: #4f46e5;
        }
        
        .mr-3 {
            margin-right: 0.75rem;
        }

        .text-center {
          text-align: center;
        }
        
        .text-gray-600 {
          color: #4a5568;
        }
        
        .mb-8 {
            margin-bottom: 2rem;
        }
        
        .max-w-xl {
            max-width: 36rem;
        }
        
        .mx-auto {
            margin-left: auto;
            margin-right: auto;
        }
        
        .space-y-6 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 1.5rem;
        }

        label {
          display: flex;
          align-items: center;
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .text-gray-700 {
          color: #4a5568;
        }

        .font-semibold {
          font-weight: 600;
        }

        .mb-2 {
          margin-bottom: 0.5rem;
        }
        
        .text-indigo-500 {
            color: #6366f1;
        }
        
        .mr-2 {
            margin-right: 0.5rem;
        }

        input[type="file"] + label {
          border: 2px dashed #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem 1rem;
          cursor: pointer;
          background-color: #f7fafc;
          transition: background-color 0.2s ease-in-out;
        }
        
        input[type="file"] + label:hover {
            background-color: #edf2f7;
        }

        .text-gray-500 {
          color: #a0aec0;
        }
        
        .hidden {
            display: none;
        }
        
        input, textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease-in-out;
        }

        input:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 2px #c3dafe;
          border-color: #4c51bf;
        }

        button {
          width: 100%;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: #ffffff;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        button:not([disabled]) {
          background-color: #4f46e5;
        }

        button:not([disabled]):hover {
          background-color: #4338ca;
          transform: scale(1.025);
        }

        button[disabled] {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }
        
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        .text-red-700 {
            color: #c53030;
        }
        
        .bg-red-100 {
            background-color: #fff5f5;
        }
        
        .text-green-700 {
            color: #2f855a;
        }
        
        .bg-green-100 {
            background-color: #f0fff4;
        }
        
        .text-gray-800 {
            color: #2d3748;
        }
        
        .bg-gray-800 {
            background-color: #2d3748;
        }
        
        .text-white {
            color: #ffffff;
        }
        
        .p-4 {
            padding: 1rem;
        }
        
        .rounded-lg {
            border-radius: 0.5rem;
        }
        
        .max-h-96 {
            max-height: 24rem;
        }
        
        .overflow-y-auto {
            overflow-y: auto;
        }
        
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .shadow-inner {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        }

        .bg-gray-50 {
          background-color: #f9fafb;
        }
        
        @media (max-width: 768px) {
          .max-w-4xl {
            max-width: 100%;
          }
          .text-4xl {
            font-size: 2rem;
          }
        }
        `}
      </style>
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl space-y-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 tracking-tight">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block text-indigo-600 mr-3">
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            PDF Semantic Extractor
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto">
            Upload PDF files and provide a persona and a task. Our backend will
            extract and filter relevant sections for you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file-upload">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload PDF Files
              </label>
              <label className="file-upload-label">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '1.5rem',
                  border: '2px dashed #e2e8f0',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f7fafc',
                  cursor: 'pointer'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                    {selectedFiles.length > 0 ? (
                      `${selectedFiles.length} file(s) selected`
                    ) : (
                      'Click to upload or drag & drop'
                    )}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#a0aec0', marginTop: '0.25rem' }}>
                    (PDF files only)
                  </span>
                </div>
              </label>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
                {selectedFiles.length > 0 && selectedFiles.map(file => (
                  <span key={file.name} style={{ display: 'block', marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: '600' }}>{file.name}</span> - {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                ))}
              </p>
            </div>

            <div>
              <label htmlFor="persona">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 mr-2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Persona
              </label>
              <input
                id="persona"
                type="text"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., 'A software developer'"
                required
              />
            </div>

            <div>
              <label htmlFor="job-to-be-done">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 mr-2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Job to be Done
              </label>
              <textarea
                id="job-to-be-done"
                value={jobToBeDone}
                onChange={(e) => setJobToBeDone(e.target.value)}
                placeholder="e.g., 'Find all sections related to system architecture and API design.'"
                rows="3"
                required
              />
            </div>

            <button type="submit" disabled={loading || selectedFiles.length === 0}>
              {loading ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin mr-2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M12 5l7 7-7 7"></path>
                    <path d="M19 12H5"></path>
                  </svg>
                  Process Documents
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ backgroundColor: '#fff5f5', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', color: '#c53030' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p style={{ fontWeight: '600' }}>Error: <span style={{ fontWeight: '400' }}>{error}</span></p>
              </div>
            )}

            {response && (
              <div style={{ backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', color: '#2f855a' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-8.86"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p style={{ fontWeight: '600' }}>
                  Success! Your documents have been processed.
                </p>
              </div>
            )}

            {response && (
              <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', maxHeight: '24rem', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2d3748', marginBottom: '1rem' }}>Backend Response</h3>
                <pre style={{ fontSize: '0.875rem', backgroundColor: '#2d3748', color: '#ffffff', padding: '1rem', borderRadius: '0.5rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
