import { jsPDF } from 'jspdf';
import { Application, Company } from '../types';

export function generateAppointmentLetterPDF(application: Application, company?: Company): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const letter = application.appointmentLetter;
  const companyName = company?.name || application.companyName || 'CareerMatch Partner Enterprise';
  const companyTagline = company?.tagline || 'Leading Enterprise Innovation';
  const companyLocation = company?.location || 'Bangalore, Karnataka, India';
  const candidateName = application.seekerName;
  const candidateEmail = application.seekerEmail;
  const letterId = letter?.letterId || `APPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = letter?.issuedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const joiningDate = letter?.joiningDate || 'Immediate';
  const designation = letter?.designation || application.jobTitle;
  const salaryOffered = letter?.salaryOffered || 850000;
  const reportingManager = letter?.reportingManager || 'Engineering Director';
  const workLocation = letter?.workLocation || 'Bangalore Campus / Hybrid';
  const probationMonths = letter?.probationMonths || 3;

  // Margin and layout constants
  const marginX = 20;
  let cursorY = 22;

  // 1. Corporate Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(companyName.toUpperCase(), marginX, cursorY);

  cursorY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(companyTagline, marginX, cursorY);
  doc.text(companyLocation, marginX, cursorY + 4);

  cursorY += 10;
  // Hairline separator
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(marginX, cursorY, 190, cursorY);

  cursorY += 10;
  // Letter Metadata Block
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref ID: ${letterId}`, marginX, cursorY);
  doc.text(`Date of Issue: ${issueDate}`, 190, cursorY, { align: 'right' });

  cursorY += 10;
  // Candidate Address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TO:', marginX, cursorY);
  cursorY += 5;
  doc.text(candidateName, marginX, cursorY);
  cursorY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${candidateEmail}`, marginX, cursorY);
  doc.text(`Phone: ${application.seekerPhone}`, marginX, cursorY + 4);
  doc.text(`Application Ref: ${application.applicationId}`, marginX, cursorY + 8);

  cursorY += 16;
  // Subject
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`SUBJECT: OFFICIAL APPOINTMENT & OFFER OF EMPLOYMENT`, marginX, cursorY);

  cursorY += 8;
  // Opening Paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const openingText = `Dear ${candidateName},\n\nOn behalf of ${companyName}, we are pleased to offer you the position of ${designation}. Following your interviews and evaluation, our leadership team was exceedingly impressed with your technical capabilities, academic track record, and problem-solving aptitude.`;
  const splitOpening = doc.splitTextToSize(openingText, 170);
  doc.text(splitOpening, marginX, cursorY);
  cursorY += (splitOpening.length * 4.8) + 4;

  // Employment Terms Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, cursorY, 170, 48, 2, 2, 'FD');

  const termsStartY = cursorY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Terms of Employment:', marginX + 6, termsStartY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const leftColX = marginX + 6;
  const rightColX = marginX + 90;

  doc.text(`• Position: ${designation}`, leftColX, termsStartY + 8);
  doc.text(`• Reporting Manager: ${reportingManager}`, leftColX, termsStartY + 15);
  doc.text(`• Date of Joining: ${joiningDate}`, leftColX, termsStartY + 22);
  doc.text(`• Work Location: ${workLocation}`, leftColX, termsStartY + 29);

  doc.text(`• Total Annual CTC: ₹${salaryOffered.toLocaleString('en-IN')}`, rightColX, termsStartY + 8);
  doc.text(`• Probation Period: ${probationMonths} Months`, rightColX, termsStartY + 15);
  doc.text(`• Employment Mode: Full-time Regular`, rightColX, termsStartY + 22);
  doc.text(`• Notice Period: 30 Days post-probation`, rightColX, termsStartY + 29);

  cursorY += 56;

  // Benefits & Responsibilities
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Compensation & Benefits Structure:', marginX, cursorY);

  cursorY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const benefits = letter?.benefitsSummary || [
    `Annual Base Remuneration + Performance Bonus: ₹${salaryOffered.toLocaleString('en-IN')} per annum`,
    'Comprehensive Family Medical Health Insurance coverage up to ₹5,00,000 per annum',
    'Company provided high-performance engineering workstation & hardware setup',
    'Continuous professional upskilling and certification reimbursement budget'
  ];

  benefits.forEach(b => {
    doc.text(`• ${b}`, marginX + 4, cursorY);
    cursorY += 4.8;
  });

  cursorY += 4;
  // Acceptance Note
  const closingText = `Please sign and return the duplicate copy of this letter within 7 days to signify your acceptance. We look forward to a mutually fulfilling and rewarding association.`;
  const splitClosing = doc.splitTextToSize(closingText, 170);
  doc.text(splitClosing, marginX, cursorY);
  cursorY += (splitClosing.length * 4.5) + 12;

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FOR ' + companyName.toUpperCase(), marginX, cursorY);
  doc.text('CANDIDATE ACCEPTANCE', 130, cursorY);

  cursorY += 16;
  doc.setDrawColor(203, 213, 225);
  doc.line(marginX, cursorY, marginX + 50, cursorY);
  doc.line(130, cursorY, 180, cursorY);

  cursorY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory / Talent Director', marginX, cursorY);
  doc.text(`${candidateName} (Sign & Date)`, 130, cursorY);

  // Footer stamp
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-verified authentic appointment document issued via CareerMatch Intelligent Hub.', 105, 285, { align: 'center' });

  // Download PDF file
  const filename = `${candidateName.replace(/\s+/g, '_')}_Appointment_Letter_${companyName.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
