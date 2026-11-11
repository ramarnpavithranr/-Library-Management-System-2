'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { ExcelImportModal } from '@/components/admin/ExcelImportModal';
import { Student } from '@/types';

export default function AdminStudentsPage() {
  const { students, addStudent, bulkAddStudents, updateStudent } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    rollNumber: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    college: 'Sree Sakthi Engineering College',
    year: '3rd Year',
    section: 'A',
    username: '',
    password: '',
    status: 'active' as 'active' | 'inactive',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  });

  const departments = [
    'All',
    'Computer Science & Engineering',
    'Artificial Intelligence & Data Science',
    'Information Technology',
    'Electronics & Communication',
  ];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenAdd = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      studentId: `STU-2024-${randomNum}`,
      name: '',
      rollNumber: `24CS${randomNum.toString().slice(0, 2)}`,
      email: '',
      phone: '+91 98450 00000',
      department: 'Computer Science & Engineering',
      college: 'Sree Sakthi Engineering College',
      year: '1st Year',
      section: 'A',
      username: '',
      password: '',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      phone: student.phone,
      department: student.department,
      college: student.college || 'Sree Sakthi Engineering College',
      year: student.year,
      section: student.section,
      username: student.username,
      password: student.password || '',
      status: student.status,
      profileImage: student.profileImage || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber || !formData.username) {
      alert('Please fill student name, roll number, and username.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      alert('Initial password must be at least 6 characters for Supabase Authentication.');
      return;
    }
    const res = await addStudent(formData);
    if (res && res.success === false) {
      alert(res.message || 'Failed to create student account.');
      return;
    }
    // Switch filter to 'All' so newly provisioned student is immediately in view
    setSelectedDept('All');
    setSearchQuery('');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    updateStudent(selectedStudent.id, formData);
    setIsEditModalOpen(false);
  };

  const toggleStudentStatus = (student: Student) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    updateStudent(student.id, { status: newStatus });
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Student Management"
        subtitle="Account Provisioning, Credentials & Academic Records"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Notice Card: Admin Exclusive Account Creation */}
        <div className="p-4 rounded-3xl bg-[#FFF9F6] border border-burgundy-100 shadow-soft flex items-start gap-3">
          <ShieldCheck size={20} className="text-burgundy-800 shrink-0 mt-0.5" />
          <div className="text-xs text-charcoal-700 leading-relaxed">
            <strong className="text-burgundy-950 font-bold">Institutional Security Policy:</strong> All student accounts are created and provisioned exclusively by Library Administration. Public student registration is disabled. You can assign default passwords, edit department affiliations, and view academic borrowing status here.
          </div>
        </div>

        {/* Top Controls: Search, Add Student & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by student name, roll no, student ID..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="py-3 px-4 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold shadow-soft flex items-center gap-2 active:scale-95 transition-all"
            >
              <FileSpreadsheet size={16} className="text-emerald-700" />
              <span>Upload Excel</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="py-3 px-5 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-full text-xs font-bold shadow-burgundy-glow flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <UserPlus size={16} />
              <span>Create Student Account</span>
            </button>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'bg-white text-charcoal-700 border border-burgundy-100 hover:bg-burgundy-50'
              }`}
            >
              {dept === 'All' ? `All Departments (${students.length})` : dept}
            </button>
          ))}
        </div>

        {/* Student Cards Grid or Empty State */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-burgundy-100 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-burgundy-50 text-burgundy-800 flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-base font-bold text-charcoal-900 mb-1">No Student Records Found</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-6">
              {searchQuery || selectedDept !== 'All'
                ? 'No students match your current search or department filter.'
                : 'No student accounts have been provisioned yet. Click below to create your first student account.'}
            </p>
            {!searchQuery && selectedDept === 'All' && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-full text-xs font-bold shadow-burgundy-glow transition-all active:scale-95"
              >
                <UserPlus size={16} />
                <span>Create Student Account</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((s) => {
            const isActive = s.status === 'active';
            return (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-burgundy-200 shrink-0 bg-burgundy-950 shadow-sm">
                        {s.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {s.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-charcoal-900 truncate">
                          {s.name}
                        </h4>
                        <p className="text-xs font-mono font-semibold text-burgundy-800">
                          Roll: {s.rollNumber}
                        </p>
                        <p className="text-[10px] text-charcoal-400 font-mono">
                          ID: {s.studentId}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStudentStatus(s)}
                      title="Click to toggle status"
                    >
                      <Badge variant={isActive ? 'success' : 'danger'} size="sm" dot>
                        {isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </button>
                  </div>

                  {/* Details Card */}
                  <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-50 space-y-1.5 text-xs text-charcoal-600 mb-3">
                    <div className="flex items-center gap-2 truncate">
                      <GraduationCap size={13} className="text-burgundy-700 shrink-0" />
                      <span className="truncate">{s.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                      <span>Year: <strong className="text-charcoal-800">{s.year}</strong></span>
                      <span>Section: <strong className="text-charcoal-800">{s.section}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 truncate pt-1 border-t border-burgundy-100/60">
                      <Mail size={12} className="text-charcoal-400 shrink-0" />
                      <span className="text-[11px] truncate">{s.email}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-2 border-t border-burgundy-50 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-charcoal-500">
                    user: <strong>{s.username}</strong>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setIsProfileModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-charcoal-500 hover:text-burgundy-900 hover:bg-burgundy-50"
                      title="View Student Profile"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-2 rounded-xl text-charcoal-500 hover:text-burgundy-900 hover:bg-burgundy-50"
                      title="Edit student"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* CREATE STUDENT MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Student Account"
          subtitle="Admin controlled registration & login credential generation"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoUsername = name.toLowerCase().trim().replace(/\s+/g, '.');
                    setFormData({
                      ...formData,
                      name,
                      username: autoUsername,
                      email: `${autoUsername}@sreesakthi.edu.in`,
                    });
                  }}
                  placeholder="e.g. Liam Anderson"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g. 24CS088"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  College / Institution *
                </label>
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. Sree Sakthi Engineering College"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Year of Study
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="A"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Assigned Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full text-xs font-mono font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Initial Password *
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
              >
                Provision Student Account
              </button>
            </div>
          </form>
        </Modal>

        {/* EDIT STUDENT MODAL */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Student Account"
          subtitle={`Managing: ${selectedStudent?.name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Year of Study
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Reset Password
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="New password"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="inactive">Suspended (Access Revoked)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
              >
                Save Updates
              </button>
            </div>
          </form>
        </Modal>

        {/* VIEW PROFILE MODAL */}
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Student Record & Credentials"
          maxWidth="md"
        >
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-burgundy-200 shrink-0 bg-burgundy-950">
                  {selectedStudent.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedStudent.profileImage} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">{selectedStudent.name}</h3>
                  <p className="text-xs font-mono font-bold text-burgundy-800">Roll: {selectedStudent.rollNumber}</p>
                  <p className="text-[11px] text-charcoal-500">{selectedStudent.department}</p>
                </div>
              </div>

              <div className="p-4 bg-[#FAF7F7] rounded-2xl border border-burgundy-50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Student ID:</span>
                  <span className="font-mono font-bold text-charcoal-800">{selectedStudent.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Username:</span>
                  <span className="font-mono font-bold text-burgundy-800">{selectedStudent.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Account Status:</span>
                  <Badge variant={selectedStudent.status === 'active' ? 'success' : 'danger'} size="sm" dot>
                    {selectedStudent.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Year / Section:</span>
                  <span className="font-medium text-charcoal-800">{selectedStudent.year} • Sec {selectedStudent.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">College:</span>
                  <span className="font-medium text-charcoal-800">{selectedStudent.college || 'Sree Sakthi Engineering College'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Institutional Email:</span>
                  <span className="font-medium text-charcoal-800">{selectedStudent.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Phone Contact:</span>
                  <span className="font-medium text-charcoal-800">{selectedStudent.phone}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-5 py-2.5 bg-burgundy-800 text-white rounded-2xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Excel Import Modal */}
        <ExcelImportModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          type="students"
          onImport={(importedStudents) => {
            bulkAddStudents(importedStudents);
          }}
        />
      </main>
    </div>
  );
}

