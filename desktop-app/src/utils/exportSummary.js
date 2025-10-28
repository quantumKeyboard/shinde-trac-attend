import html2canvas from 'html2canvas';
import { format } from 'date-fns';

// Generate WhatsApp text message format
export const generateWhatsAppMessage = (employee, salaryData, attendanceDetails) => {
  const { month, year, monthly_salary, total_working_days, days_present, days_absent_unpaid, days_absent_paid, deduction_amount, payable_salary } = salaryData;

  const monthName = format(new Date(year, month - 1), 'MMMM yyyy');

  let message = `📋 *Salary Summary - ${monthName}*\n\n`;
  message += `*Employee:* ${employee.full_name}\n`;
  message += `*ID:* ${employee.employee_id}\n`;
  message += `*Department:* ${employee.department}\n\n`;
  
  message += `📅 *Attendance*\n`;
  message += `Working Days: ${total_working_days}\n`;
  message += `Present: ${days_present} days\n`;
  message += `Absent (Unpaid): ${days_absent_unpaid} days\n`;
  message += `Absent (Paid): ${days_absent_paid} days\n\n`;

  if (attendanceDetails && attendanceDetails.length > 0) {
    message += `*Absent Dates:*\n`;
    attendanceDetails.forEach(record => {
      if (!record.is_present) {
        const dateStr = format(new Date(record.attendance_date), 'dd/MM/yyyy');
        const leaveType = record.is_paid_leave ? '(Paid)' : '(Unpaid)';
        message += `• ${dateStr} ${leaveType} - ${record.absence_reason || 'No reason'}\n`;
      }
    });
    message += '\n';
  }

  message += `💰 *Salary Details*\n`;
  message += `Basic Salary: ₹${monthly_salary.toLocaleString('en-IN')}\n`;
  message += `Per Day Rate: ₹${(monthly_salary / total_working_days).toFixed(2)}\n`;
  message += `Deduction: ₹${deduction_amount.toFixed(2)}\n`;
  message += `*Payable Salary: ₹${payable_salary.toLocaleString('en-IN')}*\n\n`;

  message += `---\n`;
  message += `Shinde Tractors\n`;
  message += `Generated on ${format(new Date(), 'dd/MM/yyyy')}`;

  return message;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Generate professional salary card image
export const generateSalaryCard = async (employee, salaryData, attendanceDetails) => {
  const { month, year, monthly_salary, total_working_days, days_present, days_absent_unpaid, days_absent_paid, per_day_rate, deduction_amount, payable_salary } = salaryData;

  // Create a temporary div for the card
  const cardDiv = document.createElement('div');
  cardDiv.style.position = 'absolute';
  cardDiv.style.left = '-9999px';
  cardDiv.style.width = '600px';
  cardDiv.style.background = 'white';
  cardDiv.style.padding = '40px';
  cardDiv.style.fontFamily = 'Arial, sans-serif';

  const monthName = format(new Date(year, month - 1), 'MMMM yyyy');

  cardDiv.innerHTML = `
    <div style="border: 3px solid #2563eb; border-radius: 12px; padding: 30px;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #1e3a8a; font-size: 28px;">Shinde Tractors</h1>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 16px;">Salary Statement</p>
        <p style="margin: 5px 0 0 0; color: #374151; font-size: 18px; font-weight: bold;">${monthName}</p>
      </div>

      <!-- Employee Details -->
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 14px;">Employee Name:</span>
          <span style="color: #111827; font-weight: bold; font-size: 14px;">${employee.full_name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 14px;">Employee ID:</span>
          <span style="color: #111827; font-weight: bold; font-size: 14px;">${employee.employee_id}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280; font-size: 14px;">Department:</span>
          <span style="color: #111827; font-weight: bold; font-size: 14px;">${employee.department}</span>
        </div>
      </div>

      <!-- Attendance Summary -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e40af; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Attendance Summary</h3>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">Total Working Days:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #111827;">${total_working_days}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">Days Present:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #059669;">${days_present}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">Days Absent (Unpaid):</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #dc2626;">${days_absent_unpaid}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">Days Absent (Paid):</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #f59e0b;">${days_absent_paid}</td>
          </tr>
        </table>
      </div>

      <!-- Salary Calculation -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e40af; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Salary Calculation</h3>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">Monthly Salary:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #111827;">₹${monthly_salary.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">Per Day Rate:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #111827;">₹${per_day_rate.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280;">Deduction (${days_absent_unpaid} days):</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #dc2626;">- ₹${deduction_amount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Net Salary -->
      <div style="background: #1e40af; color: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px;">Net Payable Salary:</span>
          <span style="font-size: 24px; font-weight: bold;">₹${payable_salary.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">Generated on ${format(new Date(), 'dd MMMM yyyy')}</p>
        <p style="margin: 5px 0 0 0;">This is a computer-generated document</p>
      </div>
    </div>
  `;

  document.body.appendChild(cardDiv);

  try {
    const canvas = await html2canvas(cardDiv, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false
    });

    document.body.removeChild(cardDiv);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    document.body.removeChild(cardDiv);
    throw error;
  }
};

// Download the generated card
export const downloadSalaryCard = async (employee, salaryData, attendanceDetails) => {
  const blob = await generateSalaryCard(employee, salaryData, attendanceDetails);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Salary_Card_${employee.employee_id}_${format(new Date(salaryData.year, salaryData.month - 1), 'MMM_yyyy')}.png`;
  link.click();
  URL.revokeObjectURL(url);
};
