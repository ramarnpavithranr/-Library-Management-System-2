'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Table,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'books' | 'students';
  onImport: (rows: any[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setPreviewHeaders([]);
    setError(null);
  };

  const downloadSampleTemplate = () => {
    if (type === 'books') {
      const sampleBooks = [
        {
          Title: 'Deep Learning with Python',
          Author: 'François Chollet',
          Category: 'Artificial Intelligence',
          ISBN: '978-1617294433',
          Quantity: 10,
          ShelfLocation: 'Shelf AI-02',
          Publisher: 'Manning Publications',
          PublicationYear: 2023,
          Edition: '2nd Edition',
          Description: 'Hands-on practical deep learning with Keras and PyTorch.',
        },
        {
          Title: 'Distributed Operating Systems',
          Author: 'Andrew S. Tanenbaum',
          Category: 'Operating Systems',
          ISBN: '978-0130313584',
          Quantity: 8,
          ShelfLocation: 'Shelf OS-01',
          Publisher: 'Pearson Education',
          PublicationYear: 2022,
          Edition: '3rd Edition',
          Description: 'Concepts and architectures of modern distributed computing.',
        },
        {
          Title: 'Computer Networks: A Systems Approach',
          Author: 'Larry L. Peterson, Bruce S. Davie',
          Category: 'Computer Networks',
          ISBN: '978-0128182001',
          Quantity: 12,
          ShelfLocation: 'Shelf NET-04',
          Publisher: 'Morgan Kaufmann',
          PublicationYear: 2024,
          Edition: '6th Edition',
          Description: 'Comprehensive systems perspective on network architecture.',
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleBooks);
      XLSX.utils.book_append_sheet(wb, ws, 'Books_Catalog');
      XLSX.writeFile(wb, 'SSEC_Books_Import_Template.xlsx');
    } else {
      const sampleStudents = [
        {
          Name: 'Kavitha Ramasamy',
          RollNumber: '24CS051',
          StudentID: 'STU-2024-051',
          Department: 'Computer Science & Engineering',
          Year: '1st Year',
          Section: 'A',
          Email: 'kavitha.24cs@sreesakthi.edu.in',
          Phone: '+91 98450 11223',
          Username: '24cs051',
          Password: '',
        },
        {
          Name: 'Sanjay Kumar S',
          RollNumber: '24AI028',
          StudentID: 'STU-2024-052',
          Department: 'Artificial Intelligence & Data Science',
          Year: '1st Year',
          Section: 'B',
          Email: 'sanjay.24ai@sreesakthi.edu.in',
          Phone: '+91 97890 33445',
          Username: '24ai028',
          Password: '',
        },
        {
          Name: 'Priya Dharshini M',
          RollNumber: '24IT015',
          StudentID: 'STU-2024-053',
          Department: 'Information Technology',
          Year: '1st Year',
          Section: 'A',
          Email: 'priya.24it@sreesakthi.edu.in',
          Phone: '+91 94432 55667',
          Username: '24it015',
          Password: '',
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleStudents);
      XLSX.utils.book_append_sheet(wb, ws, 'Students_List');
      XLSX.writeFile(wb, 'SSEC_Students_Import_Template.xlsx');
    }
  };

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    setError(null);
    setFile(selectedFile);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in uploaded spreadsheet.');
      }

      const sheet = workbook.Sheets[sheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (rawRows.length === 0) {
        throw new Error('Spreadsheet appears to be empty. Please enter at least 1 record.');
      }

      if (type === 'books') {
        const normalized = rawRows.map((r, i) => {
          const title = r.Title || r.title || r['Book Title'] || r['BOOK TITLE'] || `Book ${i + 1}`;
          const author = r.Author || r.author || r['Author Name'] || 'Unknown Author';
          const category = r.Category || r.category || r['Department'] || 'General';
          const isbn = r.ISBN || r.isbn || r['ISBN Code'] || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
          const quantity = Number(r.Quantity || r.quantity || r['Total Copies'] || 5);
          const shelf = r.ShelfLocation || r.shelfLocation || r['Shelf Location'] || r.Shelf || 'General Rack';
          const publisher = r.Publisher || r.publisher || 'Academic Press';
          const publicationYear = Number(r.PublicationYear || r.publicationYear || r.Year || 2024);
          const edition = r.Edition || r.edition || '1st Edition';
          const description = r.Description || r.description || `${title} by ${author}`;

          return {
            title,
            author,
            category,
            isbn,
            quantity: isNaN(quantity) || quantity <= 0 ? 5 : quantity,
            availableQuantity: isNaN(quantity) || quantity <= 0 ? 5 : quantity,
            shelfLocation: shelf,
            publisher,
            publicationYear: isNaN(publicationYear) ? 2024 : publicationYear,
            edition,
            description,
            coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
          };
        });

        setParsedData(normalized);
        setPreviewHeaders(['Title', 'Author', 'Category', 'ISBN', 'Quantity', 'ShelfLocation']);
      } else {
        const normalized = rawRows.map((r, i) => {
          const name = r.Name || r.name || r['Student Name'] || r['Full Name'] || `Student ${i + 1}`;
          const rollNumber = (r.RollNumber || r.rollNumber || r['Roll No'] || r.Roll || `24CS${100 + i}`).toString().toUpperCase();
          const studentId = r.StudentID || r.studentId || r['Student ID'] || `STU-2024-${100 + i}`;
          const department = r.Department || r.department || r.Dept || 'Computer Science & Engineering';
          const year = r.Year || r.year || '1st Year';
          const section = (r.Section || r.section || 'A').toString().toUpperCase();
          const email = r.Email || r.email || `${rollNumber.toLowerCase()}@sreesakthi.edu.in`;
          const phone = r.Phone || r.phone || r.Mobile || '+91 98450 00000';
          const username = (r.Username || r.username || rollNumber.toLowerCase()).toString();
          const password = (r.Password || r.password || '').toString();

          return {
            name,
            rollNumber,
            studentId,
            department,
            year,
            section,
            email,
            phone,
            username,
            password,
            status: 'active',
            profileImage: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop`,
          };
        });

        setParsedData(normalized);
        setPreviewHeaders(['Name', 'RollNumber', 'StudentID', 'Department', 'Year', 'Section', 'Email']);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to read Excel file. Please ensure it is a valid .xlsx or .csv.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImport(parsedData);
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-burgundy-100 shadow-2xl overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-850 p-5 sm:p-6 text-white relative">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold tracking-wider uppercase mb-1">
                <Sparkles size={11} className="text-emerald-300" />
                <span>Spreadsheet Bulk Import</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {type === 'books' ? 'Upload Excel Sheet: New Books' : 'Upload Excel Sheet: Student List'}
              </h3>
              <p className="text-[11px] text-rose-200/80 mt-0.5">
                Import multiple {type === 'books' ? 'catalogue book titles' : 'student accounts'} in seconds via .xlsx or .csv
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Download Sample Template Banner */}
          <div className="p-4 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                <FileSpreadsheet size={15} className="text-emerald-700" />
                <span>Download Official SSEC Template</span>
              </h4>
              <p className="text-[11px] text-charcoal-500">
                Pre-formatted columns with sample data for error-free import.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[11px] font-bold shadow-soft flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download size={13} />
              <span>Download .XLSX Template</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-burgundy-200 hover:border-burgundy-700 bg-burgundy-50/20 hover:bg-burgundy-50/40 rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-white border border-burgundy-100 shadow-soft flex items-center justify-center text-burgundy-800">
                <Upload size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-charcoal-900">
                  Click to browse or drag and drop your spreadsheet here
                </p>
                <p className="text-[11px] text-charcoal-500">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) files up to 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File details card */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-charcoal-900">{file.name}</h5>
                    <p className="text-[11px] text-emerald-800 font-semibold">
                      {(file.size / 1024).toFixed(1)} KB • {parsedData.length} records parsed successfully
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-charcoal-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Change File
                </button>
              </div>

              {/* Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Table size={14} className="text-burgundy-800" />
                    <span>Spreadsheet Preview (First {Math.min(parsedData.length, 5)} rows)</span>
                  </h5>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Total: {parsedData.length} {type === 'books' ? 'Books' : 'Students'}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-burgundy-100 shadow-inner">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#FAF7F7] text-charcoal-700 font-bold border-b border-burgundy-100">
                      <tr>
                        {previewHeaders.map((h) => (
                          <th key={h} className="p-2.5 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-burgundy-50 bg-white">
                      {parsedData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-burgundy-50/30">
                          {previewHeaders.map((h) => {
                            const key =
                              h === 'Title' ? 'title' :
                              h === 'Author' ? 'author' :
                              h === 'Category' ? 'category' :
                              h === 'ISBN' ? 'isbn' :
                              h === 'Quantity' ? 'quantity' :
                              h === 'ShelfLocation' ? 'shelfLocation' :
                              h === 'Name' ? 'name' :
                              h === 'RollNumber' ? 'rollNumber' :
                              h === 'StudentID' ? 'studentId' :
                              h === 'Department' ? 'department' :
                              h === 'Year' ? 'year' :
                              h === 'Section' ? 'section' :
                              h === 'Email' ? 'email' : h;
                            return (
                              <td key={h} className="p-2.5 text-charcoal-700 whitespace-nowrap">
                                {row[key] ?? '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-burgundy-50">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-charcoal-200 text-xs font-bold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-soft flex items-center gap-2 active:scale-95 transition-all disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  <span>Import {parsedData.length} {type === 'books' ? 'Books' : 'Students'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

