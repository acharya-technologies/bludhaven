// /lib/export-helper.ts
import { getSupabaseClient } from "./supabase/client"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export const handleExport = async (format: 'html' | 'pdf' = 'html') => {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Please login to export data")
      return
    }

    // Fetch all user data
    const [userRes, profileRes, projectsRes, expensesRes, installmentsRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('bludhaven_projects').select('*').eq('user_id', user.id),
      supabase.from('bludhaven_expenses').select(`
        *,
        bludhaven_projects(title)
      `).eq('user_id', user.id),
      supabase.from('bludhaven_installments').select(`
        *,
        bludhaven_projects(title)
      `).eq('user_id', user.id)
    ])

    // Prepare data
    const exportData = {
      metadata: {
        title: "BLUDHAVEN DATA EXPORT",
        exportDate: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'full',
          timeStyle: 'medium'
        }),
        userId: user.id,
        userEmail: user.email,
        userName: userRes.data?.user?.user_metadata?.full_name || userRes.data?.user?.email?.split('@')[0] || 'User'
      },
      userInfo: {
        auth: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in: user.last_sign_in_at,
          user_metadata: user.user_metadata || {}
        },
        profile: profileRes.data || {}
      },
      projects: projectsRes.data || [],
      expenses: (expensesRes.data || []).map(exp => ({
        ...exp,
        project_title: exp.bludhaven_projects?.title
      })),
      installments: (installmentsRes.data || []).map(inst => ({
        ...inst,
        project_title: inst.bludhaven_projects?.title
      })),
      summary: {
        totalProjects: projectsRes.data?.length || 0,
        activeProjects: projectsRes.data?.filter(p => ['enquiry', 'advance'].includes(p.status)).length || 0,
        completedProjects: projectsRes.data?.filter(p => p.status === 'delivered').length || 0,
        totalExpenses: expensesRes.data?.reduce((sum, e) => sum + e.amount, 0) || 0,
        totalRevenue: projectsRes.data?.reduce((sum, p) => sum + (p.amount_received || 0), 0) || 0,
        pendingRevenue: projectsRes.data?.reduce((sum, p) => sum + ((p.finalized_amount || 0) - (p.amount_received || 0)), 0) || 0,
        netProfit: (projectsRes.data?.reduce((sum, p) => sum + (p.amount_received || 0), 0) || 0) - 
                  (expensesRes.data?.reduce((sum, e) => sum + e.amount, 0) || 0)
      }
    }

    if (format === 'pdf') {
      await generatePDF(exportData)
    } else {
      generateHTML(exportData)
    }
    
  } catch (error) {
    console.error("Export failed:", error)
    alert("Failed to export data. Please try again.")
  }
}

// HTML Export
const generateHTML = (exportData: any) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert("Please allow popups to print the report")
    return
  }

  const htmlContent = generateReportHTML(exportData)
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

// PDF Export
const generatePDF = async (exportData: any) => {
  const element = document.createElement('div')
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.width = '210mm' // A4 width
  element.innerHTML = generateReportHTML(exportData)
  document.body.appendChild(element)

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`BLUDHAVEN_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error("PDF generation failed:", error)
    alert("Failed to generate PDF. Generating HTML instead.")
    generateHTML(exportData)
  } finally {
    document.body.removeChild(element)
  }
}

// LaTeX-style report HTML generator
const generateReportHTML = (exportData: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>BLUDHAVEN Data Export</title>
      <style>
        /* LaTeX-like typography */
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&family=Source+Code+Pro:wght@400&display=swap');
        
        @page {
          size: A4;
          margin: 2cm;
          @top-center {
            content: "BLUDHAVEN MANAGEMENT SYSTEM";
            font-family: 'Source Serif Pro', serif;
            font-size: 10pt;
            color: #666;
          }
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
            font-family: 'Source Serif Pro', serif;
            font-size: 9pt;
            color: #666;
          }
        }
        
        body {
          font-family: 'Source Serif Pro', serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #222;
          background: #fff;
          margin: 0;
          padding: 0;
          counter-reset: section subsection figure table;
        }
        
        h1, h2, h3, h4 {
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #1a202c;
        }
        
        h1 {
          font-size: 24pt;
          text-align: center;
          margin-top: 0;
          padding-bottom: 0.5em;
          border-bottom: 3px double #dc2626;
          margin-bottom: 1em;
        }
        
        h2 {
          font-size: 16pt;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.3em;
          margin-top: 1.8em;
          counter-increment: section;
          counter-reset: subsection;
        }
        
        h2:before {
          content: counter(section) ". ";
          color: #dc2626;
          font-weight: bold;
        }
        
        h3 {
          font-size: 13pt;
          margin-top: 1.2em;
          counter-increment: subsection;
        }
        
        h3:before {
          content: counter(section) "." counter(subsection) ". ";
          color: #666;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2em;
        }
        
        .title {
          font-size: 28pt;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 0.2em;
        }
        
        .subtitle {
          font-size: 14pt;
          color: #666;
          font-weight: 400;
          margin-bottom: 1em;
        }
        
        .metadata {
          display: flex;
          justify-content: space-between;
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 1em;
          margin-bottom: 2em;
          font-size: 10pt;
        }
        
        .metadata-left, .metadata-right {
          width: 48%;
        }
        
        .metadata-item {
          margin-bottom: 0.3em;
        }
        
        .metadata-label {
          font-weight: 600;
          color: #4a5568;
          display: inline-block;
          width: 120px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1em;
          margin-bottom: 2em;
        }
        
        .summary-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 1em;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .summary-card-title {
          font-size: 10pt;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5em;
        }
        
        .summary-card-value {
          font-size: 20pt;
          font-weight: 700;
          color: #2d3748;
        }
        
        .summary-card-value.positive {
          color: #10b981;
        }
        
        .summary-card-value.negative {
          color: #ef4444;
        }
        
        .summary-card-value.warning {
          color: #f59e0b;
        }
        
        .table-container {
          overflow-x: auto;
          margin-bottom: 2em;
          page-break-inside: avoid;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
          font-size: 10pt;
          margin-bottom: 1em;
        }
        
        thead {
          background: #dc2626;
          color: white;
        }
        
        th {
          padding: 0.8em 1em;
          text-align: left;
          font-weight: 600;
          border: 1px solid #e2e8f0;
        }
        
        td {
          padding: 0.6em 1em;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .amount {
          font-family: 'Source Code Pro', monospace;
          text-align: right;
          font-weight: 600;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.2em 0.8em;
          border-radius: 12px;
          font-size: 9pt;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .status-enquiry { background: #fed7aa; color: #9a3412; }
        .status-advance { background: #bfdbfe; color: #1e40af; }
        .status-delivered { background: #bbf7d0; color: #166534; }
        .status-archived { background: #e5e7eb; color: #374151; }
        
        .priority-critical { background: #fecaca; color: #991b1b; }
        .priority-high { background: #fed7aa; color: #9a3412; }
        .priority-medium { background: #fef3c7; color: #92400e; }
        .priority-low { background: #d1fae5; color: #065f46; }
        
        .category-development { background: #dbeafe; color: #1e40af; }
        .category-hosting { background: #e9d5ff; color: #6b21a8; }
        .category-marketing { background: #fce7f3; color: #9d174d; }
        .category-tools { background: #fef3c7; color: #92400e; }
        .category-salary { background: #d1fae5; color: #065f46; }
        .category-other { background: #e5e7eb; color: #374151; }
        
        .page-break {
          page-break-before: always;
        }
        
        .footer {
          margin-top: 3em;
          padding-top: 1em;
          border-top: 1px solid #e2e8f0;
          font-size: 9pt;
          color: #718096;
          text-align: center;
        }
        
        .no-data {
          text-align: center;
          padding: 2em;
          color: #a0aec0;
          font-style: italic;
          border: 2px dashed #e2e8f0;
          border-radius: 6px;
        }
        
        .code {
          font-family: 'Source Code Pro', monospace;
          background: #f7fafc;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
          border: 1px solid #e2e8f0;
        }
        
        @media print {
          body {
            font-size: 10pt;
          }
          
          h1 {
            font-size: 20pt;
          }
          
          h2 {
            font-size: 14pt;
          }
          
          .summary-card-value {
            font-size: 16pt;
          }
          
          table {
            font-size: 9pt;
          }
          
          .no-print {
            display: none;
          }
        }
        
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc2626;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Source Serif Pro', serif;
          font-weight: 600;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .print-button:hover {
          background: #b91c1c;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">Print Report</button>
      
      <div class="header">
        <div class="title">BLUDHAVEN</div>
        <div class="subtitle">Data Export & Business Report</div>
      </div>
      
      <div class="metadata">
        <div class="metadata-left">
          <div class="metadata-item">
            <span class="metadata-label">Report ID:</span>
            <span class="code">${Date.now().toString(36).toUpperCase()}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Exported By:</span>
            ${exportData.metadata.userName}
          </div>
          <div class="metadata-item">
            <span class="metadata-label">User ID:</span>
            <span class="code">${exportData.metadata.userId.substring(0, 8)}...</span>
          </div>
        </div>
        <div class="metadata-right">
          <div class="metadata-item">
            <span class="metadata-label">Export Date:</span>
            ${exportData.metadata.exportDate}
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Email:</span>
            ${exportData.metadata.userEmail}
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Time Zone:</span>
            IST (Asia/Kolkata)
          </div>
        </div>
      </div>
      
      <h1>Executive Summary</h1>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-card-title">Total Projects</div>
          <div class="summary-card-value">${exportData.summary.totalProjects}</div>
          <div style="font-size: 9pt; color: #718096; margin-top: 0.5em;">
            Active: ${exportData.summary.activeProjects} • Completed: ${exportData.summary.completedProjects}
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-card-title">Total Revenue</div>
          <div class="summary-card-value positive">₹${exportData.summary.totalRevenue.toLocaleString('en-IN')}</div>
          <div style="font-size: 9pt; color: #718096; margin-top: 0.5em;">
            Pending: ₹${exportData.summary.pendingRevenue.toLocaleString('en-IN')}
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-card-title">Total Expenses</div>
          <div class="summary-card-value negative">₹${exportData.summary.totalExpenses.toLocaleString('en-IN')}</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-card-title">Net Profit</div>
          <div class="summary-card-value ${exportData.summary.netProfit >= 0 ? 'positive' : 'negative'}">
            ₹${Math.abs(exportData.summary.netProfit).toLocaleString('en-IN')}
          </div>
          <div style="font-size: 9pt; color: #718096; margin-top: 0.5em;">
            ${exportData.summary.netProfit >= 0 ? 'Profit' : 'Loss'}
          </div>
        </div>
      </div>
      
      <h2>User Information</h2>
      
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Account ID</strong></td>
            <td class="code">${exportData.userInfo.auth.id}</td>
          </tr>
          <tr>
            <td><strong>Email Address</strong></td>
            <td>${exportData.userInfo.auth.email}</td>
          </tr>
          <tr>
            <td><strong>Account Created</strong></td>
            <td>${new Date(exportData.userInfo.auth.created_at).toLocaleString('en-IN', {
              dateStyle: 'long',
              timeStyle: 'short'
            })}</td>
          </tr>
          <tr>
            <td><strong>Last Sign In</strong></td>
            <td>${exportData.userInfo.auth.last_sign_in ? 
              new Date(exportData.userInfo.auth.last_sign_in).toLocaleString('en-IN', {
                dateStyle: 'long',
                timeStyle: 'short'
              }) : 'N/A'}</td>
          </tr>
          ${Object.entries(exportData.userInfo.auth.user_metadata).map(([key, value]) => `
            <tr>
              <td><strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></td>
              <td>${value}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${exportData.projects.length > 0 ? `
        <div class="page-break"></div>
        <h2>Projects Portfolio</h2>
        <p style="color: #718096; margin-bottom: 1em;">Total: ${exportData.projects.length} projects • Total Value: ₹${exportData.projects.reduce((sum: number, p: any) => sum + (p.finalized_amount || 0), 0).toLocaleString('en-IN')}</p>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Client</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Amount (₹)</th>
                <th>Progress</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.projects.map((project: any, index: number) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td><strong>${project.title}</strong></td>
                  <td>${project.leader}</td>
                  <td>
                    <span class="status-badge status-${project.status}">
                      ${project.status}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge priority-${project.priority}">
                      ${project.priority}
                    </span>
                  </td>
                  <td class="amount">
                    ₹${(project.amount_received || 0).toLocaleString('en-IN')}
                    <div style="font-size: 8pt; color: #718096;">
                      of ₹${(project.finalized_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5em;">
                      <div style="width: 40px; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                        <div style="width: ${project.progress}%; height: 100%; background: #10b981;"></div>
                      </div>
                      <span>${project.progress}%</span>
                    </div>
                  </td>
                  <td>${project.deadline ? 
                    new Date(project.deadline).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<div class="no-data">No projects found</div>'}
      
      ${exportData.expenses.length > 0 ? `
        <div class="page-break"></div>
        <h2>Expense Report</h2>
        <p style="color: #718096; margin-bottom: 1em;">Total: ${exportData.expenses.length} expenses • Total Amount: ₹${exportData.summary.totalExpenses.toLocaleString('en-IN')}</p>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Project</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.expenses.map((expense: any, index: number) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td>${new Date(expense.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}</td>
                  <td>
                    <span class="status-badge category-${expense.category}">
                      ${expense.category}
                    </span>
                  </td>
                  <td>${expense.description || 'No description'}</td>
                  <td>${expense.project_title || 'General'}</td>
                  <td class="amount">₹${expense.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<div class="no-data">No expenses found</div>'}
      
      ${exportData.installments.length > 0 ? `
        <div class="page-break"></div>
        <h2>Installment Schedule</h2>
        <p style="color: #718096; margin-bottom: 1em;">Total: ${exportData.installments.length} installments</p>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Project</th>
                <th>Due Date</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Paid Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.installments.map((installment: any, index: number) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td>${installment.project_title || 'N/A'}</td>
                  <td>${installment.due_date ? 
                    new Date(installment.due_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}</td>
                  <td class="amount">₹${installment.amount.toLocaleString('en-IN')}</td>
                  <td>
                    <span class="status-badge ${installment.status === 'paid' ? 'status-delivered' : 
                      installment.status === 'pending' ? 'status-advance' : 'priority-critical'}">
                      ${installment.status}
                    </span>
                  </td>
                  <td>${installment.paid_date ? 
                    new Date(installment.paid_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Pending'}</td>
                  <td>${installment.description || 'No description'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<div class="no-data">No installments found</div>'}
      
      <div class="page-break"></div>
      <h2>System Information</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Report Generated</strong></td>
            <td>${new Date().toLocaleString('en-IN', {
              dateStyle: 'full',
              timeStyle: 'long'
            })}</td>
          </tr>
          <tr>
            <td><strong>Data Range</strong></td>
            <td>All available data</td>
          </tr>
          <tr>
            <td><strong>Report Format</strong></td>
            <td>Comprehensive Business Report</td>
          </tr>
          <tr>
            <td><strong>Document Version</strong></td>
            <td>2.0</td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p>This document contains confidential business information of BLUDHAVEN Management System.</p>
        <p>Unauthorized distribution, reproduction, or disclosure is strictly prohibited.</p>
        <p>© ${new Date().getFullYear()} BLUDHAVEN. All rights reserved.</p>
      </div>
      
      <script>
        // Auto-print after a short delay
        setTimeout(() => {
          window.print();
          setTimeout(() => {
            if (confirm('Report printed successfully. Close this window?')) {
              window.close();
            }
          }, 1000);
        }, 1000);
      </script>
    </body>
    </html>
  `
}